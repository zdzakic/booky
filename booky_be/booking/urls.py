from django.urls import path
from .views import ServiceTypeListAPIView, TimeSlotListAPIView, ReservationCreateAPIView, AvailableSlotsAPIView, ReservationListAPIView

urlpatterns = [
    path('services/', ServiceTypeListAPIView.as_view(), name='service-list'),
    path('timeslots/', TimeSlotListAPIView.as_view(), name='timeslot-list'),
    path('reservations/', ReservationCreateAPIView.as_view(), name='reservation-create'),
    path('reservations/lists/', ReservationListAPIView.as_view(), name='reservation-list'),
    path('available-slots/', AvailableSlotsAPIView.as_view(), name='available-slots'),
]
