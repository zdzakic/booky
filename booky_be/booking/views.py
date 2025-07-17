from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from datetime import datetime, time, timedelta
from django.db.models import Q

from .models import ServiceType, Reservation, Resource, BusinessHours, Holiday
from .serializers import (
    ServiceTypeSerializer, 
    ReservationSerializer,
    ReservationListSerializer,
    HolidaySerializer
)
from django.core.mail import send_mail
from rest_framework import viewsets
from rest_framework.permissions import AllowAny


class ServiceTypeListAPIView(generics.ListAPIView):
    """Lists all available service types."""
    queryset = ServiceType.objects.all()
    serializer_class = ServiceTypeSerializer


class AvailabilityAPIView(APIView):
    """Calculates and returns available start times for a given service and date."""

    def get(self, request):
        service_id = request.query_params.get('service')
        date_str = request.query_params.get('date')

        if not service_id or not date_str:
            return Response({"error": "'service' and 'date' parameters are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        # === PROVJERA PRAZNIKA ===
        if Holiday.objects.filter(date=date_obj).exists():
            return Response([], status=status.HTTP_200_OK) # Vrati praznu listu ako je praznik

        try:
            service = get_object_or_404(ServiceType, pk=service_id)
            # The BusinessHours model uses 0-indexed weekdays (Monday=0), matching Python's weekday().
            day_of_week = date_obj.weekday()
        except (ValueError, ServiceType.DoesNotExist):
            return Response({"error": "Invalid service ID or date format."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            business_hours = BusinessHours.objects.get(day_of_week=day_of_week)
        except BusinessHours.DoesNotExist:
            return Response([], status=status.HTTP_200_OK) # No slots on a day off

        # 1. Filter reservations for the correct service on the given day (TIMEZONE-AWARE)
        tz = timezone.get_current_timezone() # Gets 'Europe/Zurich' from settings
        start_of_day = datetime.combine(date_obj, time.min, tzinfo=tz)
        end_of_day = datetime.combine(date_obj, time.max, tzinfo=tz)

        existing_reservations = Reservation.objects.filter(
            service=service, 
            start_time__lt=end_of_day, 
            end_time__gt=start_of_day
        ).select_related('resource')

        # Group reservations by resource for efficient lookup
        reservations_by_resource = {}
        for res in existing_reservations:
            reservations_by_resource.setdefault(res.resource_id, []).append(res)
        
        # 2. Get only the resources relevant to the selected service (CORRECTED QUERY)
        all_resources = list(Resource.objects.filter(services=service))
        if not all_resources:
            return Response({"error": "No resources are configured for this specific service."}, status=status.HTTP_400_BAD_REQUEST)

        total_resources = len(all_resources)

        # Loop through time slots and check for availability
        available_slots = []
        start_work_time = datetime.combine(date_obj, business_hours.open_time, tzinfo=tz)
        end_work_time = datetime.combine(date_obj, business_hours.close_time, tzinfo=tz)
        service_duration = timedelta(minutes=service.duration_minutes)
        step = timedelta(minutes=30)  # Define the time step for checking availability. We use 30 minutes for better UI.

        current_time = start_work_time
        while current_time + service_duration <= end_work_time:

            # If the date is today, skip slots that are in the past.
            if date_obj == timezone.localdate() and current_time < timezone.localtime():
                current_time += step
                continue

            slot_end_time = current_time + service_duration

            # Count how many resources are booked at this specific time
            occupied_resources_count = sum(1 for r in existing_reservations if r.start_time < slot_end_time and r.end_time > current_time)

            # If the number of occupied resources is less than the total available, the slot is available
            if occupied_resources_count < total_resources:
                available_count = total_resources - occupied_resources_count
                available_slots.append({
                    "time": current_time.strftime('%H:%M'),
                    "available_count": available_count
                })

            current_time += step

        return Response(available_slots, status=status.HTTP_200_OK)


class ReservationListCreateAPIView(generics.ListCreateAPIView):

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

            Please approve it in the administration panel.
            """
            from_email = 'noreply@booky.app' # This can be anything
            recipient_list = ['owner@domain.com'] # Change to your email

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
    # permission_classes = [IsAuthenticated] # Privremeno uklonjeno

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Ako se mijenja status na odobren
        if 'is_approved' in request.data and request.data['is_approved'] == True and not instance.is_approved:
            try:
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
                from_email = 'noreply@booky.app'
                recipient_list = [instance.email]
                
                send_mail(subject, message, from_email, recipient_list, fail_silently=False)
            except Exception as e:
                print(f"Error sending approval email: {e}")

        return super().partial_update(request, *args, **kwargs)


class HolidayViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows holidays to be viewed, created, or deleted.
    """
    queryset = Holiday.objects.all()
    serializer_class = HolidaySerializer
    permission_classes = [AllowAny] # TODO: Replace with IsAdminUser or custom owner permission
