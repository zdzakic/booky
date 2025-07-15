from django.urls import path
from .views import (
    ServiceTypeListAPIView,
    AvailabilityAPIView,
    ReservationListCreateAPIView,
)

app_name = 'booking'

urlpatterns = [
    path('services/', ServiceTypeListAPIView.as_view(), name='service-list'),
    path('availability/', AvailabilityAPIView.as_view(), name='availability'),
    path('reservations/', ReservationListCreateAPIView.as_view(), name='reservation-list-create'),
]
