from django.contrib import admin
from .models import Reservation, ServiceType, TimeSlot

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = [
        'id', 
        'full_name', 
        'service', 
        'get_slot_dates', 
        'phone', 
        'email', 
        'license_plate', 
        'is_stored',
        'created_at'
    ]
    list_filter = ['service', 'is_stored']
    search_fields = ['full_name', 'email', 'license_plate']
    ordering = ['-created_at']  # Najnovije prvo, ili promijeni po želji

    def get_slot_dates(self, obj):
        # Prikazuje sve slotove kao string, npr: "2025-07-01 08:00, 2025-07-01 08:30"
        return ", ".join(
            f"{ts.date} {ts.start_time.strftime('%H:%M')}" 
            for ts in obj.timeslot.all()
        )
    get_slot_dates.short_description = "Termini"

# Ako želiš da dodaš i druge modele:
@admin.register(ServiceType)
class ServiceTypeAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'duration_minutes']

@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ['id', 'date', 'start_time', 'capacity', 'is_available']
    list_filter = ['date', 'is_available']
