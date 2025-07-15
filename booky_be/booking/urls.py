from django.urls import path
from .views import ServiceTypeListAPIView, TimeSlotListAPIView, ReservationListCreateAPIView, AvailableSlotsAPIView, ReservationDestroyAPIView, ReservationListAPIView, AllSlotsStatusAPIView

urlpatterns = [
    path('services/', ServiceTypeListAPIView.as_view(), name='service-list'),
    path('timeslots/', TimeSlotListAPIView.as_view(), name='timeslot-list'),
    path('reservations/', ReservationListCreateAPIView.as_view(), name='reservation-list-create'),
    path('reservations/lists/', ReservationListAPIView.as_view(), name='reservation-list'),
    path('reservations/<int:pk>/', ReservationDestroyAPIView.as_view(), name='reservation-delete'),
    path('available-slots/', AvailableSlotsAPIView.as_view(), name='available-slots'),
    path('all-slots-status/', AllSlotsStatusAPIView.as_view(), name='all-slots-status'),
]
