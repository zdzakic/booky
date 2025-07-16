from django.urls import path
from .views import (
    ServiceTypeListAPIView,
    AvailabilityAPIView,
    ReservationListCreateAPIView,
    ReservationDetailView,
)

app_name = 'booking'

urlpatterns = [
    path('services/', ServiceTypeListAPIView.as_view(), name='service-list'),
    path('availability/', AvailabilityAPIView.as_view(), name='availability'),
    path('reservations/', ReservationListCreateAPIView.as_view(), name='reservation-list-create'),
    path('reservations/<int:pk>/', ReservationDetailView.as_view(), name='reservation-detail'),
]
