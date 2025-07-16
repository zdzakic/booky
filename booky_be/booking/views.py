from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from datetime import datetime, time, timedelta

from .models import ServiceType, Reservation, Resource, BusinessHours
from .serializers import (
    ServiceTypeSerializer, 
    ReservationSerializer,
    ReservationListSerializer
)


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
            service = get_object_or_404(ServiceType, pk=service_id)
            date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
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
            service=service, # Filter by service is crucial
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

        # --- Loop with timezone awareness --- 
        current_time = datetime.combine(date_obj, business_hours.open_time, tzinfo=tz)
        end_of_work_day = datetime.combine(date_obj, business_hours.close_time, tzinfo=tz)
        service_duration = timedelta(minutes=service.duration_minutes)
        slot_interval = timedelta(minutes=15)
        available_start_times = set()

        while current_time + service_duration <= end_of_work_day:
            potential_start = current_time
            potential_end = potential_start + service_duration

            occupied_resources_count = 0
            for resource in all_resources:
                for reservation in reservations_by_resource.get(resource.id, []):
                    if max(potential_start, reservation.start_time) < min(potential_end, reservation.end_time):
                        occupied_resources_count += 1
                        break 
            
            if occupied_resources_count < len(all_resources):
                available_start_times.add(potential_start.strftime("%H:%M"))

            current_time += slot_interval

        return Response(sorted(list(available_start_times)))


class ReservationListCreateAPIView(generics.ListCreateAPIView):
    """Handles listing and creation of reservations."""

    def get_queryset(self):
        return Reservation.objects.select_related('service', 'resource').order_by('-start_time')

    def get_serializer_class(self):
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
        serializer.save(end_time=end_time, resource=assigned_resource)


class ReservationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Reservation.objects.all()
