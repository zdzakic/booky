# booky/tests/test_reservations.py
from django.urls import reverse
from rest_framework.test import APITestCase
from booking.models import ServiceType, TimeSlot, Reservation
from datetime import date, time

class ReservationAPITest(APITestCase):
    def setUp(self):
        self.service = ServiceType.objects.create(name="Reifenwechsel", duration_minutes=30)
        self.slot = TimeSlot.objects.create(
            date=date(2025, 6, 30),
            start_time=time(9, 30),
            is_available=True,
            capacity=1  # Ažurirano!
        )
        self.url = reverse('reservation-create')

    def test_create_reservation_success(self):
        data = {
            "full_name": "Test User",
            "phone": "123456789",
            "email": "test@example.com",
            "license_plate": "XYZ123",
            "service": self.service.id,
            "is_stored": True,
            "date": "2025-06-30",
            "start_time": "09:30"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Reservation.objects.count(), 1)
        self.assertEqual(Reservation.objects.first().full_name, "Test User")


class ReservationSlotValidationTest(APITestCase):
    def setUp(self):
        self.service_30 = ServiceType.objects.create(name="Reifenwechsel", duration_minutes=30)
        self.service_60 = ServiceType.objects.create(name="Reifenwechsel mit Felgen", duration_minutes=60)

        self.date = date(2025, 6, 30)
        self.slot_1 = TimeSlot.objects.create(date=self.date, start_time=time(8, 0), is_available=True, capacity=1)
        self.slot_2 = TimeSlot.objects.create(date=self.date, start_time=time(8, 30), is_available=True, capacity=1)
        self.slot_3 = TimeSlot.objects.create(date=self.date, start_time=time(9, 0), is_available=False, capacity=1)

        self.url = reverse('reservation-create')

    def test_30_min_service_with_one_slot(self):
        data = {
            "full_name": "User 30min",
            "phone": "123",
            "email": "u30@test.com",
            "license_plate": "XX1",
            "service": self.service_30.id,
            "is_stored": True,
            "date": str(self.date),
            "start_time": "08:00"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, 201)

    def test_60_min_service_with_only_one_slot(self):
        data = {
            "full_name": "User 60min fail",
            "phone": "456",
            "email": "u60fail@test.com",
            "license_plate": "XX2",
            "service": self.service_60.id,
            "is_stored": False,
            "date": str(self.date),
            "start_time": "09:00"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, 400)  # ili 422 ako koristiš custom error


class ServiceListTest(APITestCase):
    def test_service_list_returns_all_services(self):
        ServiceType.objects.create(name="Reifenwechsel", duration_minutes=30)
        ServiceType.objects.create(name="Reifenwechsel auf Felgen", duration_minutes=60)

        response = self.client.get(reverse('service-list'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['name'], "Reifenwechsel")


class ReservationListTest(APITestCase):
    def setUp(self):
        self.service = ServiceType.objects.create(name="Reifenwechsel", duration_minutes=30)
        self.slot = TimeSlot.objects.create(date=date.today(), start_time=time(8, 0), is_available=True, capacity=1)
        self.reservation = Reservation.objects.create(
            full_name="Tester",
            phone="123456",
            email="test@test.com",
            license_plate="XX123",
            service=self.service,
            is_stored=False,
        )
        # Pravilno dodavanje slotova u rezervaciju (M2M)
        self.reservation.timeslot.set([self.slot])

    def test_reservation_list_returns_reservations(self):
        response = self.client.get(reverse('reservation-list'))
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.data), 1)
        self.assertIn('full_name', response.data[0])
        self.assertIn('slots', response.data[0])  # Provjera da su slotovi prisutni!


class AvailableSlotsTest(APITestCase):
    def setUp(self):
        self.service = ServiceType.objects.create(name="Reifenwechsel", duration_minutes=30)
        self.date = date(2025, 6, 27)
        TimeSlot.objects.create(date=self.date, start_time=time(8, 0), is_available=True, capacity=1)
        TimeSlot.objects.create(date=self.date, start_time=time(8, 30), is_available=True, capacity=1)

    def test_available_slots_returns_slots(self):
        url = reverse('available-slots') + f'?date={self.date}&service={self.service.id}'
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertTrue(any(slot["start_time"] == "08:00" for slot in response.data))

    def test_available_slots_excludes_reserved(self):
        # Prvo napravi rezervaciju za 08:00
        slot = TimeSlot.objects.get(date=self.date, start_time=time(8, 0))
        reservation = Reservation.objects.create(
            full_name="User Reserved",
            phone="555",
            email="reserved@test.com",
            license_plate="XZZZZ",
            service=self.service,
            is_stored=True,
        )
        reservation.timeslot.set([slot])
        url = reverse('available-slots') + f'?date={self.date}&service={self.service.id}'
        response = self.client.get(url)
        # Provjeravamo da sada "08:00" više NIJE među dostupnim slotovima (ako capacity=1)
        self.assertFalse(any(slot["start_time"] == "08:00" for slot in response.data))
