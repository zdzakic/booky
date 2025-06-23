from django.urls import path
from .views import ServiceTypeListAPIView, TimeSlotListAPIView, ReservationCreateAPIView

urlpatterns = [
    path('services/', ServiceTypeListAPIView.as_view(), name='service-list'),
    path('timeslots/', TimeSlotListAPIView.as_view(), name='timeslot-list'),
    path('reservations/', ReservationCreateAPIView.as_view(), name='reservation-create'),
]
