from django.contrib import admin
from .models import Reservation, ServiceType, Resource, BusinessHours

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = [
        'id', 
        'full_name', 
        'service', 
        'resource',
        'start_time',
        'end_time',
        'phone', 
        'email', 
        'license_plate', 
        'is_stored',
        'created_at'
    ]
    list_filter = ['service', 'resource', 'is_stored', 'start_time']
    search_fields = ['full_name', 'email', 'license_plate']
    ordering = ['-start_time']

@admin.register(ServiceType)
class ServiceTypeAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'duration_minutes']

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']

@admin.register(BusinessHours)
class BusinessHoursAdmin(admin.ModelAdmin):
    list_display = ['get_day_of_week_display', 'open_time', 'close_time']
    ordering = ['day_of_week']
