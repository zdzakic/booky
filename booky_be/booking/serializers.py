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


class ReservationListSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)
    slots = serializers.SerializerMethodField()

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
            'slots'
        ]

    def get_slots(self, obj):
        # Vrati listu slotova kao dict-ove (datum, vrijeme)
        return [
            {
                "date": ts.date,
                "start_time": ts.start_time.strftime("%H:%M"),
            }
            for ts in obj.timeslot.all()
        ]


class ReservationSerializer(serializers.ModelSerializer):
    # Ako koristiš "timeslots" ili "timeslot", koristi isti naziv kao u modelu
    timeslot = serializers.PrimaryKeyRelatedField(
        many=True, queryset=TimeSlot.objects.all()
    )
    slots = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = ['id', 'full_name', 'phone', 'email', 'license_plate', 'service', 'is_stored', 'timeslot', 'slots']

    def get_slots(self, obj):
        return [
            {
                "date": ts.date,
                "start_time": ts.start_time,
            }
            for ts in obj.timeslot.all()
        ]

    def validate_timeslot(self, value):
        """
        Provjeri da li je svaki slot iz liste slobodan (capacity).
        """
        for slot in value:
            if slot.reservation_set.count() >= slot.capacity:
                raise ValidationError(f"Terminski slot {slot.date} {slot.start_time} je već popunjen.")
        return value