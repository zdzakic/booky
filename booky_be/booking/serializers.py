from rest_framework import serializers, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Reservation, ServiceType, TimeSlot


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
        ]

    def create(self, validated_data):
        # Ekstrakcija polja koje nisu direktno u modelu Reservation
        date = validated_data.pop('date')
        start_time = validated_data.pop('start_time')
        service = validated_data['service']

        # Traženje odgovarajućeg slobodnog termina
        timeslot = get_object_or_404(
            TimeSlot,
            service=service,
            date=date,
            start_time=start_time,
            is_available=True
        )

        # Kreiranje rezervacije
        reservation = Reservation.objects.create(
            timeslot=timeslot,
            **validated_data
        )

        # Označavanje termina kao zauzetog
        timeslot.is_available = False
        timeslot.save()

        return reservation
