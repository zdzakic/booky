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
            day_of_week = date_obj.weekday()
        except (ValueError, ServiceType.DoesNotExist):
            return Response({"error": "Invalid service ID or date format."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            business_hours = BusinessHours.objects.get(day_of_week=day_of_week)
        except BusinessHours.DoesNotExist:
            return Response([], status=status.HTTP_200_OK) # No slots on a day off

        # Get all reservations for the given date for all resources
        start_of_day = timezone.make_aware(datetime.combine(date_obj, time.min))
        end_of_day = timezone.make_aware(datetime.combine(date_obj, time.max))
        
        existing_reservations = Reservation.objects.filter(
            start_time__gte=start_of_day,
            end_time__lte=end_of_day
        ).select_related('resource')

        # Group reservations by resource
        reservations_by_resource = {}
        for res in existing_reservations:
            reservations_by_resource.setdefault(res.resource_id, []).append(res)
        
        all_resources = list(Resource.objects.all())
        if not all_resources:
            return Response({"error": "No resources (e.g., garage bays) are configured."}, status=status.HTTP_400_BAD_REQUEST)

        # Define the time range to check
        current_time = datetime.combine(date_obj, business_hours.open_time)
        end_of_work_day = datetime.combine(date_obj, business_hours.close_time)
        service_duration = timedelta(minutes=service.duration_minutes)
        slot_interval = timedelta(minutes=15) # Check every 15 minutes

        available_start_times = set()

        while current_time + service_duration <= end_of_work_day:
            potential_start = timezone.make_aware(current_time)
            potential_end = potential_start + service_duration

            # Check if this slot is available on ANY resource
            for resource in all_resources:
                is_resource_free = True
                # Check for overlaps with existing reservations on this resource
                for res in reservations_by_resource.get(resource.id, []):
                    if max(potential_start, res.start_time) < min(potential_end, res.end_time):
                        is_resource_free = False
                        break
                
                if is_resource_free:
                    available_start_times.add(current_time.strftime("%H:%M"))
                    break # Found a free resource, no need to check others for this time slot
            
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

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        service = validated_data['service']
        start_time = validated_data['start_time']
        end_time = start_time + timedelta(minutes=service.duration_minutes)

        # Lock all resources to prevent race conditions while we find a free one
        resources = list(Resource.objects.select_for_update().all())
        if not resources:
             return Response({"error": "No resources are configured."}, status=status.HTTP_400_BAD_REQUEST)

        assigned_resource = None
        for resource in resources:
            # Check for overlapping reservations on this specific resource
            conflicting_reservations = Reservation.objects.filter(
                resource=resource,
                start_time__lt=end_time,
                end_time__gt=start_time
            ).exists()

            if not conflicting_reservations:
                assigned_resource = resource
                break
        
        if not assigned_resource:
            return Response({"error": "No available resource for the selected time."}, status=status.HTTP_409_CONFLICT)

        # Create the reservation
        reservation = Reservation.objects.create(
            **validated_data,
            resource=assigned_resource,
            end_time=end_time
        )

        # We use the ListSerializer to return the full object representation
        response_serializer = ReservationListSerializer(reservation)
        headers = self.get_success_headers(response_serializer.data)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
