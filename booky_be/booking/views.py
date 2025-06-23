from rest_framework import generics
from .models import ServiceType, TimeSlot, Reservation
from .serializers import ServiceTypeSerializer, TimeSlotSerializer, ReservationSerializer
from datetime import datetime
from django.db.models import Exists, OuterRef
from rest_framework.exceptions import ValidationError

# Pregled svih usluga
class ServiceTypeListAPIView(generics.ListAPIView):
    queryset = ServiceType.objects.all()
    serializer_class = ServiceTypeSerializer

# Pregled dostupnih termina po datumu (kasnije možemo filtrirati po datumu)
class TimeSlotListAPIView(generics.ListAPIView):
    serializer_class = TimeSlotSerializer

    def get_queryset(self):
        date_str = self.request.query_params.get('date')
        if not date_str:
            raise ValidationError({"date": "Date query parameter is required. Use format YYYY-MM-DD."})

        try:
            date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            raise ValidationError({"date": "Invalid date format. Use YYYY-MM-DD."})

        return TimeSlot.objects.filter(date=date, is_available=True)

# Slanje rezervacije
class ReservationCreateAPIView(generics.CreateAPIView):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
