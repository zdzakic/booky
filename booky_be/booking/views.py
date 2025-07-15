from rest_framework import generics
from .models import ServiceType, TimeSlot, Reservation
from .serializers import ServiceTypeSerializer, TimeSlotSerializer, ReservationListSerializer,ReservationSerializer
from datetime import datetime
from django.db.models import Exists, OuterRef
from django.utils.dateparse import parse_date
from rest_framework.response import Response
from rest_framework import status
from datetime import timedelta
from rest_framework.generics import ListAPIView,CreateAPIView
from rest_framework.views import APIView



# Pregled svih usluga
class ServiceTypeListAPIView(ListAPIView):
    queryset = ServiceType.objects.all()
    serializer_class = ServiceTypeSerializer

# Pregled svih rezervacija
class ReservationListCreateAPIView(generics.ListCreateAPIView):
    queryset = Reservation.objects.all().order_by('slots__date', 'slots__start_time')
    serializer_class = ReservationSerializer

class ReservationDestroyAPIView(generics.DestroyAPIView):
    """
    API view to delete a reservation.
    Requires the reservation ID in the URL.
    """
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer

# Pregled dostupnih termina po datumu (kasnije možemo filtrirati po datumu)
class TimeSlotListAPIView(ListAPIView):
    serializer_class = TimeSlotSerializer

    def get_queryset(self):
        queryset = TimeSlot.objects.filter(is_available=True)

        date_str = self.request.query_params.get('date')
        if date_str:
            parsed_date = parse_date(date_str)
            if parsed_date:
                queryset = queryset.filter(date=parsed_date)

        return queryset


class ReservationListAPIView(ListAPIView):
    """
    Lists all reservations (for admin use).
    """
    queryset = Reservation.objects.prefetch_related('timeslot').select_related('service').order_by('-created_at')
    serializer_class = ReservationListSerializer


class AvailableSlotsAPIView(ListAPIView):
    """
    Returns available slots for a given service and date, considering service duration.
    """

    def get(self, request):
        service_id = request.GET.get('service')
        date_str = request.GET.get('date')

        if not service_id or not date_str:
            return Response({"error": "Missing 'service' or 'date' parameter."}, status=400)

        try:
            service = ServiceType.objects.get(pk=service_id)
            date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        except (ServiceType.DoesNotExist, ValueError):
            return Response({"error": "Invalid service or date."}, status=400)

        required_slots = service.duration_minutes // 30

        # 🔍 Filtriramo samo slobodne i nerezervisane slotove
        slots = TimeSlot.objects.annotate(
            is_reserved=Exists(
                Reservation.objects.filter(timeslot=OuterRef('pk'))
            )
        ).filter(
            date=date_obj,
            is_available=True,
            is_reserved=False
        ).order_by('start_time')

        result = []
        slot_list = list(slots)

        for i in range(len(slot_list) - required_slots + 1):
            sequence = slot_list[i:i + required_slots]

            # Provjera uzastopnosti
            valid_sequence = True
            for j in range(1, len(sequence)):
                prev = datetime.combine(date_obj, sequence[j - 1].start_time)
                curr = datetime.combine(date_obj, sequence[j].start_time)
                if (curr - prev).seconds != 30 * 60:
                    valid_sequence = False
                    break

            if valid_sequence:
                result.append({
                    "start_time": sequence[0].start_time.strftime("%H:%M"),
                    "end_time": (datetime.combine(date_obj, sequence[-1].start_time) + timedelta(minutes=30)).time().strftime("%H:%M"),
                })

        return Response(result)


class AllSlotsStatusAPIView(ListAPIView):
    """
    Returns all slots for a given date & service, and marks if starting there is possible for whole service duration.
    """

    def get(self, request):
        service_id = request.GET.get('service')
        date_str = request.GET.get('date')

        if not service_id or not date_str:
            return Response({"error": "Missing 'service' or 'date' parameter."}, status=400)

        try:
            service = ServiceType.objects.get(pk=service_id)
            date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        except (ServiceType.DoesNotExist, ValueError):
            return Response({"error": "Invalid service or date."}, status=400)

        required_slots = service.duration_minutes // 30

        all_slots = list(
            TimeSlot.objects.filter(date=date_obj, is_available=True).order_by('start_time')
        )

        result = []

        for i, slot in enumerate(all_slots):
            sequence = all_slots[i:i + required_slots]
            # Enough slots ahead?
            if len(sequence) < required_slots:
                enabled = False
            else:
                # Check all are sequential and have enough capacity
                valid_sequence = True
                for j in range(1, len(sequence)):
                    prev = datetime.combine(date_obj, sequence[j - 1].start_time)
                    curr = datetime.combine(date_obj, sequence[j].start_time)
                    if (curr - prev).seconds != 30 * 60:
                        valid_sequence = False
                        break
                for s in sequence:
                    if s.reservation_set.count() >= s.capacity:
                        valid_sequence = False
                        break
                enabled = valid_sequence

            result.append({
                "id": slot.id,
                "start_time": slot.start_time.strftime("%H:%M"),
                "end_time": (
                    (datetime.combine(date_obj, slot.start_time) + timedelta(minutes=service.duration_minutes)).time().strftime("%H:%M")
                ),
                "enabled": enabled
            })

        return Response(result)



class ReservationCreateAPIView(APIView):
    """
    API endpoint for creating a reservation.
    
    Expects user-friendly input:
        - full_name
        - phone
        - email
        - license_plate
        - service (ID)
        - is_stored
        - date (YYYY-MM-DD)
        - start_time (HH:MM)
    
    Steps performed:
        1. Validates presence and format of required input fields.
        2. Parses date, start_time, and service.
        3. Determines how many timeslots are needed based on service duration.
        4. Finds available, consecutive timeslots for the given start time.
        5. Validates timeslot sequence (consecutiveness & capacity).
        6. Passes timeslot IDs and user data to ReservationSerializer.
        7. Creates the reservation if all checks pass.
    """

    def post(self, request):
        # 1. Extract and check input fields
        data = request.data.copy()
        date_str = data.get('date')
        start_time_str = data.get('start_time')
        service_id = data.get('service')

        if not (date_str and start_time_str and service_id):
            return Response({"error": "Missing date, start_time or service."}, status=400)

        # 2. Parse input values and service object
        try:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
            start_time_obj = datetime.strptime(start_time_str, "%H:%M").time()
            service = ServiceType.objects.get(pk=service_id)
        except (ValueError, ServiceType.DoesNotExist):
            return Response({"error": "Invalid date, time or service."}, status=400)

        # 3. Calculate required timeslots for service duration
        required_slots = service.duration_minutes // 30

        # 4. Gather all available slots for the date, sorted by time
        all_slots = list(
            TimeSlot.objects.filter(date=date_obj, is_available=True).order_by('start_time')
        )

        # 5. Find the index for the requested start time
        slot_indices = [i for i, slot in enumerate(all_slots) if slot.start_time == start_time_obj]
        if not slot_indices:
            return Response({"error": "Slot with this start_time does not exist or is not available."}, status=400)
        start_index = slot_indices[0]
        sequence = all_slots[start_index:start_index + required_slots]

        # 6. Validate that the sequence has enough consecutive slots
        if len(sequence) < required_slots:
            return Response({"error": "Not enough slots for this service duration."}, status=400)

        valid_sequence = True
        for j in range(1, len(sequence)):
            prev = datetime.combine(date_obj, sequence[j - 1].start_time)
            curr = datetime.combine(date_obj, sequence[j].start_time)
            # Check 30 min gap (consecutiveness)
            if (curr - prev).seconds != 30 * 60:
                valid_sequence = False
                break
            # Check slot capacity
            if sequence[j].reservation_set.count() >= sequence[j].capacity:
                valid_sequence = False
                break

        if not valid_sequence:
            return Response({"error": "Selected slot(s) are not available or not sequential."}, status=400)

        # 7. Insert found slot IDs into data for serializer
        data["timeslot"] = [slot.id for slot in sequence]

        # 8. Pass everything to ReservationSerializer and create reservation
        serializer = ReservationSerializer(data=data)
        if serializer.is_valid():
            reservation = serializer.save()
            return Response({"message": "Reservation successfully created."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
