from django.urls import path
from .views import (
    ServiceTypeListAPIView,
    AvailabilityAPIView,
    ReservationListCreateAPIView,
    ReservationDetailView,
    HolidayViewSet,
    LoginAPIView,
    DisabledDatesView,
)

app_name = 'booking'

urlpatterns = [
    path('services/', ServiceTypeListAPIView.as_view(), name='service-list'),
    path('availability/', AvailabilityAPIView.as_view(), name='availability'),
    path('reservations/', ReservationListCreateAPIView.as_view(), name='reservation-list-create'),
    path('reservations/<int:pk>/', ReservationDetailView.as_view(), name='reservation-detail'),
    path('holidays/', HolidayViewSet.as_view({'get': 'list', 'post': 'create'}), name='holiday-list-create'),
    path('holidays/<int:pk>/', HolidayViewSet.as_view({'get': 'retrieve', 'delete': 'destroy'}), name='holiday-detail'),
    path('auth/login/', LoginAPIView.as_view(), name='token_obtain_pair'),
    path('disabled-dates/', DisabledDatesView.as_view(), name='disabled-dates'),
]
