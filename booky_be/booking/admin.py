from django.contrib import admin
from .models import ServiceType, TimeSlot, Reservation

admin.site.register(ServiceType)
admin.site.register(TimeSlot)
admin.site.register(Reservation)
