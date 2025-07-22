# booking/utils.py

from datetime import timedelta
from booking.models import Reservation

def is_slot_available(service, start_time):
    duration = timedelta(minutes=service.duration_minutes)
    end_time = start_time + duration
    total_resources = service.resources.count()
    busy_resources = Reservation.objects.filter(
        service=service,
        start_time__lt=end_time,
        end_time__gt=start_time
    ).count()
    return busy_resources < total_resources

def is_resource_available(service, resource, start_time):
    duration = timedelta(minutes=service.duration_minutes)
    end_time = start_time + duration
    qs = Reservation.objects.filter(resource=resource)
    overlapping = qs.filter(
        start_time__lt=end_time,
        end_time__gt=start_time
    ).exists()
    return not overlapping



