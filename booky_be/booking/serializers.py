from rest_framework import serializers, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Reservation, ServiceType, TimeSlot
from datetime import datetime, timedelta
from rest_framework.exceptions import ValidationError



class ServiceTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceType
        fields = '__all__'

class TimeSlotSerializer(serializers.ModelSerializer):
    service = ServiceTypeSerializer(read_only=True)

    class Meta:
        model = TimeSlot
        fields = '__all__'

class ReservationCreateAPIView(APIView):
    """
    Handles creation of reservations via POST request.
    Expects service name, customer info, and selected date/time.
    """
    def post(self, request):
        serializer = ReservationSerializer(data=request.data)
        if serializer.is_valid():
            reservation = serializer.save()
            return Response({"message": "Reservation erfolgreich erstellt."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReservationSerializer(serializers.ModelSerializer):
    date = serializers.DateField(write_only=True)
    start_time = serializers.TimeField(write_only=True)
    reserved_date = serializers.DateField(source='timeslot.date', read_only=True)
    reserved_start_time = serializers.TimeField(source='timeslot.start_time', read_only=True)

    class Meta:
        model = Reservation
        fields = [
            'full_name',
            'phone',
            'email',
            'license_plate',
            'service',
            'is_stored',
            'date',
            'start_time',
            'reserved_date',
            'reserved_start_time'
        ]

    def create(self, validated_data):
        date = validated_data.pop('date')
        start_time = validated_data.pop('start_time')
        service = validated_data['service']

        # Koliko slotova treba za ovu uslugu?
        required_slots = service.duration_minutes // 30

        base_time = datetime.combine(date, start_time)

        # Lista svih potrebnih termina
        slot_times = [
            (base_time + timedelta(minutes=30 * i)).time()
            for i in range(required_slots)
        ]

        # Pronađi sve slotove koji su slobodni — bez filtera po service!
        slots = list(TimeSlot.objects.filter(
            date=date,
            start_time__in=slot_times,
            is_available=True
        ).order_by('start_time'))

        print("=== DEBUG INFO ===")
        print("Requested date:", date)
        print("Requested start time:", start_time)
        print("Required slots:", required_slots)
        print("Slot times needed:", slot_times)

        all_slots = TimeSlot.objects.filter(date=date).order_by('start_time')
        print("All slots on that date:")
        for s in all_slots:
            print(f"- {s.start_time} | available: {s.is_available}")


        if len(slots) != required_slots:
            raise ValidationError("One or more time slots are no longer available.")

        # Označi slotove kao zauzete
        for slot in slots:
            slot.is_available = False
            slot.save()

        # Kreiraj rezervaciju
        reservation = Reservation.objects.create(
                timeslot=slots[0],
            **validated_data
        )

        return reservation


# booking/serializers.py

class ReservationListSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)
    date = serializers.DateField(source='timeslot.date', read_only=True)
    start_time = serializers.TimeField(source='timeslot.start_time', read_only=True)

    class Meta:
        model = Reservation
        fields = [
            'id',
            'full_name',
            'phone',
            'email',
            'license_plate',
            'is_stored',
            'service_name',
            'date',
            'start_time'
        ]

