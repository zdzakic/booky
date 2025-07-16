from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from booking.models import ServiceType, Reservation, Resource, BusinessHours
from datetime import date, time, datetime
from django.utils import timezone


class BookingLogicTests(APITestCase):
    """Potpuno novi test suite koji testira postojeću logiku bookinga."""
    
    def setUp(self):
        """Postavlja sve potrebne podatke za testiranje."""
        # 1. Kreiramo DVA resursa
        self.resource1 = Resource.objects.create(name="Test Line 1")
        self.resource2 = Resource.objects.create(name="Test Line 2")

        # 2. Kreiramo servis i povežemo ga s OBA resursa
        self.service = ServiceType.objects.create(name="Test Service", duration_minutes=30)
        self.service.resources.add(self.resource1, self.resource2)

        # 3. Definiramo radno vrijeme za dan koji ćemo testirati
        #    Koristimo četvrtak, 17. srpnja 2025. Njegov weekday() je 3.
        self.test_date = date(2025, 7, 17)
        BusinessHours.objects.create(
            day_of_week=3,  # Ponedjeljak=0, Utorak=1, Srijeda=2, Četvrtak=3
            open_time=time(8, 0),
            close_time=time(17, 0)
        )

        # 4. Definiramo URL-ove koje ćemo pozivati (s ispravnim namespace-om)
        self.availability_url = reverse('booking:availability')
        self.reservations_url = reverse('booking:reservation-list-create')

    def test_get_availability_for_empty_day(self):
        """Testira osnovnu funkcionalnost: dohvaćanje slobodnih termina za prazan dan."""
        response = self.client.get(self.availability_url, {'service': self.service.id, 'date': self.test_date.isoformat()})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Provjeravamo ključne vrijednosti
        self.assertIn("08:00", response.data)  # Prvi termin bi trebao biti dostupan
        self.assertIn("16:30", response.data)  # Posljednji termin (16:30 + 30min = 17:00) bi trebao biti dostupan
        self.assertNotIn("17:00", response.data) # Ovaj termin je izvan radnog vremena

    def test_single_booking_with_multiple_resources(self):
        """Testira da termin ostaje dostupan ako se rezervira samo jedan od više resursa."""
        # === Korak 1: Provjeri da je termin u 09:00 slobodan PRIJE rezervacije ===
        response_before = self.client.get(self.availability_url, {'service': self.service.id, 'date': self.test_date.isoformat()})
        self.assertEqual(response_before.status_code, status.HTTP_200_OK)
        self.assertIn("09:00", response_before.data)

        # === Korak 2: Kreiraj jednu rezervaciju za 09:00 ===
        tz = timezone.get_current_timezone()
        start_time_aware = datetime.combine(self.test_date, time(9, 0), tzinfo=tz)

        reservation_data = {
            "full_name": "John Doe",
            "phone": "555-1234",
            "email": "john.doe@test.com",
            "service": self.service.id,
            "start_time": start_time_aware.isoformat()
        }

        response_create = self.client.post(self.reservations_url, reservation_data, format='json')
        self.assertEqual(response_create.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Reservation.objects.count(), 1)

        # === Korak 3: Provjeri da je termin u 09:00 I DALJE DOSTUPAN (jer je drugi resurs slobodan) ===
        response_after = self.client.get(self.availability_url, {'service': self.service.id, 'date': self.test_date.isoformat()})
        self.assertEqual(response_after.status_code, status.HTTP_200_OK)
        self.assertIn("09:00", response_after.data) # Ključna provjera!

    def test_availability_with_multiple_resources(self):
        """Testira logiku kada servis ima više resursa i svi se popune."""
        tz = timezone.get_current_timezone()
        start_time_aware = datetime.combine(self.test_date, time(10, 0), tzinfo=tz)

        # === Korak 1: Provjeri da je 10:00 slobodno na početku ===
        response_before = self.client.get(self.availability_url, {'service': self.service.id, 'date': self.test_date.isoformat()})
        self.assertIn("10:00", response_before.data)

        # === Korak 2: Kreiraj PRVU rezervaciju za 10:00 ===
        reservation_data = {
            "full_name": "John Doe", "phone": "555-0001", "email": "john@test.com",
            "service": self.service.id, "start_time": start_time_aware.isoformat()
        }
        response1 = self.client.post(self.reservations_url, reservation_data, format='json')
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)

        # === Korak 3: Provjeri da je 10:00 I DALJE DOSTUPNO (jer je drugi resurs slobodan) ===
        response_middle = self.client.get(self.availability_url, {'service': self.service.id, 'date': self.test_date.isoformat()})
        self.assertIn("10:00", response_middle.data)

        # === Korak 4: Kreiraj DRUGU rezervaciju za 10:00 ===
        reservation_data_2 = {
            "full_name": "Jane Doe", "phone": "555-0002", "email": "jane@test.com",
            "service": self.service.id, "start_time": start_time_aware.isoformat()
        }
        response2 = self.client.post(self.reservations_url, reservation_data_2, format='json')
        self.assertEqual(response2.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Reservation.objects.count(), 2)

        # === Korak 5: Provjeri da 10:00 VIŠE NIJE DOSTUPNO (oba resursa su zauzeta) ===
        response_after = self.client.get(self.availability_url, {'service': self.service.id, 'date': self.test_date.isoformat()})
        self.assertNotIn("10:00", response_after.data)