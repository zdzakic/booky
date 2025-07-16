from django.contrib import admin
from .models import Reservation, ServiceType, Resource, BusinessHours, Holiday

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
        'is_approved',
        'created_at'
    ]
    list_filter = ['service', 'resource', 'is_stored', 'start_time', 'is_approved']
    search_fields = ['full_name', 'email', 'license_plate']
    ordering = ['-start_time']
    actions = ['approve_reservations']

    def approve_reservations(self, request, queryset):
        queryset.update(is_approved=True)
    approve_reservations.short_description = "Approve selected reservations"

admin.site.register(Resource)
admin.site.register(ServiceType)
admin.site.register(BusinessHours)
admin.site.register(Holiday)
