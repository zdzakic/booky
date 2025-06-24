from rest_framework import generics
from .models import ServiceType, TimeSlot, Reservation
from .serializers import ServiceTypeSerializer, TimeSlotSerializer, ReservationSerializer, ReservationListSerializer
from datetime import datetime
from django.db.models import Exists, OuterRef
from rest_framework.exceptions import ValidationError
from django.utils.dateparse import parse_date
from rest_framework.response import Response
from datetime import timedelta

# Pregled svih usluga
class ServiceTypeListAPIView(generics.ListAPIView):
    queryset = ServiceType.objects.all()
    serializer_class = ServiceTypeSerializer

# Pregled dostupnih termina po datumu (kasnije možemo filtrirati po datumu)
class TimeSlotListAPIView(generics.ListAPIView):
    serializer_class = TimeSlotSerializer

    def get_queryset(self):
        queryset = TimeSlot.objects.filter(is_available=True)

        date_str = self.request.query_params.get('date')
        if date_str:
            parsed_date = parse_date(date_str)
            if parsed_date:
                queryset = queryset.filter(date=parsed_date)

        return queryset

# Slanje rezervacije
class ReservationCreateAPIView(generics.CreateAPIView):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer


class ReservationListAPIView(generics.ListAPIView):
    """
    Lists all reservations (for admin use).
    """
    queryset = Reservation.objects.select_related('timeslot', 'service').order_by('-timeslot__date', '-timeslot__start_time')
    serializer_class = ReservationListSerializer


class AvailableSlotsAPIView(generics.ListAPIView):
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