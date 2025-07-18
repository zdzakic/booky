from rest_framework import serializers
from .models import Reservation, ServiceType, Resource, BusinessHours, Holiday


class ServiceTypeSerializer(serializers.ModelSerializer):
    """Serializer for the ServiceType model."""
    class Meta:
        model = ServiceType
        fields = '__all__'


class ResourceSerializer(serializers.ModelSerializer):
    """Serializer for the Resource model."""
    class Meta:
        model = Resource
        fields = '__all__'


class BusinessHoursSerializer(serializers.ModelSerializer):
    """Serializer for the BusinessHours model."""
    day_of_week = serializers.CharField(source='get_day_of_week_display')
    class Meta:
        model = BusinessHours
        fields = ['day_of_week', 'open_time', 'close_time']


class ReservationSerializer(serializers.ModelSerializer):
    """Serializer for creating a reservation. Requires minimal input from the user."""
    # id = serializers.ReadOnlyField()

    class Meta:
        model = Reservation
        fields = [
            'id', 
            'full_name', 
            'phone', 
            'email', 
            'license_plate', 
            'service', 
            'start_time', 
            'end_time', 
            'is_approved',
            'is_stored'
        ]
        read_only_fields = ['end_time', 'is_approved', 'resource']


class HolidaySerializer(serializers.ModelSerializer):
    created_by_username = serializers.SerializerMethodField()

    class Meta:
        model = Holiday
        fields = ['id', 'name', 'date', 'created_by_username']

    def get_created_by_username(self, obj):
        if obj.created_by:
            return obj.created_by.username
        return '-'


class ReservationListSerializer(serializers.ModelSerializer):
    """Serializer for listing reservations, includes nested details for context."""
    service = ServiceTypeSerializer(read_only=True)
    resource = ResourceSerializer(read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True)

    class Meta:
        model = Reservation
        fields = [
            'id', 
            'full_name', 
            'phone', 
            'email', 
            'license_plate', 
            'service', 
            'resource',
            'start_time', 
            'end_time',
            'is_stored',
            'is_approved',
            'created_at',
            'service_name'
        ]