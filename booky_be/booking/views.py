from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.cache import cache
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from datetime import datetime, time, timedelta
from django.db.models import Q
from rest_framework import serializers
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.permissions import IsAuthenticated
from .models import ServiceType, Reservation, Resource, BusinessHours, Holiday
from .serializers import (
    ServiceTypeSerializer, 
    ReservationSerializer,
    ReservationListSerializer,
    HolidaySerializer,
    MyTokenObtainPairSerializer,
    DisabledDatesSerializer,
)
from django.core.mail import send_mail
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, IsAdminUser, AllowAny



class LoginAPIView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = MyTokenObtainPairSerializer


class ServiceTypeListAPIView(generics.ListAPIView):
    """Lists all available service types."""
    permission_classes = [AllowAny]
    queryset = ServiceType.objects.all()
    serializer_class = ServiceTypeSerializer


class AvailabilityAPIView(APIView):
    """
    Calculates and returns available start times for a given service and date.
    Sada podržava više radnih perioda po danu (pauze, fleksibilni rasporedi)!
    """
    permission_classes = [AllowAny]

    def get(self, request):
        # 1. Dohvati parametre iz URL-a (service i date)
        service_id = request.query_params.get('service')
        date_str = request.query_params.get('date')

        if not service_id or not date_str:
            return Response(
                {"error": "'service' and 'date' parameters are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Parsiraj datum
        try:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Ako je praznik, nema termina (return prazna lista)
        if Holiday.objects.filter(date=date_obj).exists():
            return Response([], status=status.HTTP_200_OK)

        # 4. Provjeri servis i dan u sedmici
        try:
            service = get_object_or_404(ServiceType, pk=service_id)
            day_of_week = date_obj.weekday()
        except (ValueError, ServiceType.DoesNotExist):
            return Response(
                {"error": "Invalid service ID or date format."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 5. Dohvati SVE periode za taj dan (može biti više za radne dane s pauzom!)
        business_hours_list = BusinessHours.objects.filter(day_of_week=day_of_week).order_by('open_time')
        if not business_hours_list.exists():
            # Neradni dan (npr. vikend) ili nije definisano radno vrijeme
            return Response([], status=status.HTTP_200_OK)

        # 6. Pripremi timezone-aware interval za cijeli dan
        tz = timezone.get_current_timezone()
        start_of_day = datetime.combine(date_obj, time.min, tzinfo=tz)
        end_of_day = datetime.combine(date_obj, time.max, tzinfo=tz)

        # 7. Nađi sve resurse koji su povezani s ovim servisom
        service_resources = list(Resource.objects.filter(services=service))
        if not service_resources:
            return Response(
                {"error": "No resources are configured for this specific service."},
                status=status.HTTP_400_BAD_REQUEST
            )
        total_resources = len(service_resources)

        # 8. Nađi sve rezervacije za te resurse u datom danu
        existing_reservations = Reservation.objects.filter(
            resource__in=service_resources,
            start_time__lt=end_of_day,
            end_time__gt=start_of_day
        ).select_related('resource')

        # 9. Definiši trajanje servisa i korak za generisanje slotova
        service_duration = timedelta(minutes=service.duration_minutes)
        step = timedelta(minutes=30)  # Svaki slot počinje na 30min razmaka (možeš mijenjati)

        available_slots = []  # Lista svih slotova koji će se vratiti FE-u

        # 10. PETLJA kroz SVE radne periode tog dana (omogućava pauze!)
        for business_hours in business_hours_list:
            start_work_time = datetime.combine(date_obj, business_hours.open_time, tzinfo=tz)
            end_work_time = datetime.combine(date_obj, business_hours.close_time, tzinfo=tz)
            current_time = start_work_time

            while current_time + service_duration <= end_work_time:
                # Ako je traženi dan danas i slot je u prošlosti — preskoči
                if date_obj == timezone.localdate() and current_time < timezone.localtime():
                    current_time += step
                    continue

                slot_end_time = current_time + service_duration

                # Pronađi sve rezervacije koje se preklapaju sa ovim slotom
                overlapping_reservations = [
                    res for res in existing_reservations
                    if res.start_time < slot_end_time and res.end_time > current_time
                ]

                # Koliko resursa je zauzeto u ovom slotu?
                occupied_resource_ids = {res.resource_id for res in overlapping_reservations}
                available_count = total_resources - len(occupied_resource_ids)

                # Ako ima slobodnih resursa — dodaj slot
                if available_count > 0:
                    available_slots.append({
                        "time": current_time.strftime('%H:%M'),
                        "available_count": available_count
                    })

                current_time += step  # Pomjeri se na sljedeći potencijalni slot

        # 11. Vrati sve raspoložive slotove za taj dan (svi periodi, bez pauza)
        return Response(available_slots, status=status.HTTP_200_OK)


class ReservationListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Dinamički filtrira rezervacije na temelju 'period' query parametra.
        Moguće vrijednosti za 'period':
        - '3w' (default): Prikazuje rezervacije od danas do 3 tjedna unaprijed.
        - 'all': Prikazuje sve rezervacije.
        - 'pending': Prikazuje sve neodobrene rezervacije.
        - 'today': Prikazuje sve rezervacije za današnji dan.
        """
        period = self.request.query_params.get('period', '3w')
        search_query = self.request.query_params.get('search', None)
        
        queryset = Reservation.objects.all()
        today = timezone.now().date()

        if search_query:
            queryset = queryset.filter(
                Q(full_name__icontains=search_query) |
                Q(email__icontains=search_query) |
                Q(phone__icontains=search_query) |
                Q(license_plate__icontains=search_query)
            )

        # Logika filtriranja po periodu
        if period == 'pending':
            queryset = queryset.filter(is_approved=False)
        elif period == 'past':
            queryset = queryset.filter(start_time__date__lt=today)
        else: # '3w', 'all', 'today' i default
            queryset = queryset.filter(start_time__date__gte=today)
            if period == '3w':
                three_weeks_from_now = today + timedelta(weeks=3)
                queryset = queryset.filter(start_time__date__lte=three_weeks_from_now)
            elif period == 'today':
                queryset = queryset.filter(start_time__date=today)
        
        # Sortiranje primjenjujemo na kraju
        if period == 'past':
            return queryset.order_by('-start_time') # Prošle sortiramo od najnovijih
        return queryset.order_by('start_time') # Buduće sortiramo od najranijih

    def get_serializer_class(self):
        """Odabire serializer ovisno o akciji (GET vs POST)."""
        if self.request.method == 'POST':
            return ReservationSerializer
        return ReservationListSerializer

    def perform_create(self, serializer):
        """This is the correct place to add extra data before saving."""
        validated_data = serializer.validated_data
        service = validated_data['service']
        start_time = validated_data['start_time']

        # 1. Calculate end_time
        end_time = start_time + timedelta(minutes=service.duration_minutes)

        # 2. Find an available resource
        resources_for_service = service.resources.all()
        booked_resources_ids = Reservation.objects.filter(
            resource__in=resources_for_service,
            start_time__lt=end_time,
            end_time__gt=start_time
        ).values_list('resource_id', flat=True)

        available_resources = resources_for_service.exclude(id__in=booked_resources_ids)
        
        if not available_resources.exists():
            # This should ideally not be reached if frontend checks availability first,
            # but it's a crucial server-side validation.
            raise serializers.ValidationError("This time slot is already fully booked.")

        # 3. Assign the first available resource and save
        assigned_resource = available_resources.first()
        instance = serializer.save(end_time=end_time, resource=assigned_resource)

        # 4. Send email notification AFTER saving the instance
        try:
            from django.conf import settings

            subject = f"New reservation for {instance.service.name}"
            message = f"""
            A new reservation has been created.

            Details:
            Name: {instance.full_name}
            Phone: {instance.phone}
            Email: {instance.email}
            Plates: {instance.license_plate}
            Service: {instance.service.name}
            Time Slot: {instance.start_time.strftime('%d.%m.%Y at %H:%M')}

            Please approve it in the administration/dashboard panel.
            """
            from_email = settings.DEFAULT_FROM_EMAIL # This can be anything
            recipient_list = [settings.BOOKY_OWNER_EMAIL] # Change to your email

            send_mail(subject, message, from_email, recipient_list, fail_silently=False)

            # --- START: Send confirmation to user ---
            subject_user = "Your reservation is pending approval"
            message_user = f"""
            Hello {instance.full_name},

            We have received your reservation request for {instance.service.name} on {instance.start_time.strftime('%d.%m.%Y at %H:%M')}.

            You will receive another email once your reservation is confirmed.

            Thank you!
            """
            recipient_list_user = [instance.email]
            send_mail(subject_user, message_user, from_email, recipient_list_user, fail_silently=False)
            # --- END: Send confirmation to user ---

        except Exception as e:
            # If email sending fails, we don't want to crash the whole process.
            # We'll just print the error to the console.
            print(f"Error sending email: {e}")


class ReservationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Reservation.objects.all()
    serializer_class = ReservationListSerializer
    permission_classes = [IsAuthenticated]

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Ako se mijenja status na odobren
        if 'is_approved' in request.data and request.data['is_approved'] == True and not instance.is_approved:
            try:
                from django.conf import settings

                subject = "Your reservation has been approved"
                message = f"""
                Hello {instance.full_name},

                Your reservation for {instance.service.name} has been approved.

                Details:
                Service: {instance.service.name}
                Date: {instance.start_time.strftime('%d.%m.%Y')}
                Time: {instance.start_time.strftime('%H:%M')}
                Resource: {instance.resource.name}
                Plates: {instance.license_plate}

                We look forward to seeing you!

                Best regards,
                Your service team
                """
                from_email = settings.DEFAULT_FROM_EMAIL
                recipient_list = [instance.email]
                
                send_mail(subject, message, from_email, recipient_list, fail_silently=False)
            except Exception as e:
                print(f"Error sending approval email: {e}")

        return super().partial_update(request, *args, **kwargs)


class HolidayViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows holidays to be viewed, created, or deleted.
    """
    queryset = Holiday.objects.all().order_by('date')
    serializer_class = HolidaySerializer
    permission_classes = [IsAuthenticatedOrReadOnly] # TODO: Replace with IsAdminUser or custom owner permission

    def perform_create(self, serializer):
        # Automatically set the creator to the current user.
        if self.request.user.is_authenticated:
            serializer.save(created_by=self.request.user)
        else:
            # Optional: handle case for unauthenticated users if needed
            serializer.save()


class DisabledDatesView(APIView):
    """
    Vraća sve "disabled" datume (praznici i neradni dani) u zadanom periodu.
    Query param: days (int, optional, default=90)
    """
    permission_classes = [AllowAny]

    def get(self, request):
        # 1) Parsamo koliko dana unaprijed
        try:
            days = int(request.query_params.get("days", 90))
        except ValueError:
            return Response({"detail": "Parametar must be an int."}, status=400)

        # 2) Racunamo period
        today = timezone.localdate()
        end = today + timedelta(days=days)

        # 3) Dohvat praznika
        holiday_dates = set(
            Holiday.objects
                   .filter(date__range=(today, end))
                   .values_list("date", flat=True)
        )

        # 4) Koji su dani u tjednu radni?
        working_days = set(
            BusinessHours.objects
                         .values_list("day_of_week", flat=True)
                         .distinct()
        )

        # 5) Generiramo listu disabled datuma
        disabled = []
        total_days = (end - today).days
        for i in range(total_days + 1):
            d = today + timedelta(days=i)
            # ako je praznik ili taj dan u tjednu nije radni
            if d in holiday_dates or d.weekday() not in working_days:
                disabled.append(d)

        # 6) Serijaliziramo i šaljemo
        serializer = DisabledDatesSerializer({
            "start_date": today,
            "end_date":   end,
            "disabled_dates": disabled,
        })
        return Response(serializer.data)