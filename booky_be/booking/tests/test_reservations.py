from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from booking.models import ServiceType, Reservation, Resource, BusinessHours, Holiday
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
        # Provjeravamo da odgovor sadrži objekte s vremenom i brojem dostupnih mjesta
        self.assertTrue(any(slot['time'] == '08:00' and slot['available_count'] == 2 for slot in response.data))
        self.assertTrue(any(slot['time'] == '16:30' for slot in response.data))
        self.assertFalse(any(slot['time'] == '17:00' for slot in response.data))

    def test_unapproved_reservation_does_not_block_slot(self):
        """Testira da nova, neodobrena rezervacija NE zauzima termin."""
        # Kreiramo jednu rezervaciju, koja je po defaultu is_approved=False
        tz = timezone.get_current_timezone()
        start_time_aware = datetime.combine(self.test_date, time(9, 0), tzinfo=tz)
        reservation_data = {
            "full_name": "John Doe", "phone": "555-1234", "email": "john.doe@test.com",
            "service": self.service.id, "start_time": start_time_aware.isoformat()
        }
        response_create = self.client.post(self.reservations_url, reservation_data, format='json')
        self.assertEqual(response_create.status_code, status.HTTP_201_CREATED)

        # Provjeravamo da je termin u 09:00 i dalje dostupan s punim kapacitetom
        response_after = self.client.get(self.availability_url, {'service': self.service.id, 'date': self.test_date.isoformat()})
        self.assertEqual(response_after.status_code, status.HTTP_200_OK)
        slot_info = next((slot for slot in response_after.data if slot['time'] == '09:00'), None)
        self.assertIsNotNone(slot_info)
        self.assertEqual(slot_info['available_count'], 2) # Oba resursa su i dalje slobodna

    def test_approved_reservations_block_slot_with_multiple_resources(self):
        """Testira da se termin popunjava tek NAKON ODOBRENJA rezervacija."""
        tz = timezone.get_current_timezone()
        start_time_aware = datetime.combine(self.test_date, time(10, 0), tzinfo=tz)

        # Kreiramo DVIJE rezervacije za isti termin
        reservation_data_1 = {
            "full_name": "John Doe", "phone": "555-0001", "email": "john@test.com",
            "service": self.service.id, "start_time": start_time_aware.isoformat()
        }
        self.client.post(self.reservations_url, reservation_data_1, format='json')

        reservation_data_2 = {
            "full_name": "Jane Doe", "phone": "555-0002", "email": "jane@test.com",
            "service": self.service.id, "start_time": start_time_aware.isoformat()
        }
        self.client.post(self.reservations_url, reservation_data_2, format='json')
        self.assertEqual(Reservation.objects.count(), 2)

        # Prije odobrenja, termin je dostupan s punim kapacitetom
        response_before = self.client.get(self.availability_url, {'service': self.service.id, 'date': self.test_date.isoformat()})
        slot_info_before = next((slot for slot in response_before.data if slot['time'] == '10:00'), None)
        self.assertIsNotNone(slot_info_before)
        self.assertEqual(slot_info_before['available_count'], 2)

        # Odobravamo samo JEDNU rezervaciju
        Reservation.objects.filter(full_name="John Doe").update(is_approved=True)

        # Nakon odobrenja jedne, termin je i dalje dostupan, ali s jednim mjestom manje
        response_middle = self.client.get(self.availability_url, {'service': self.service.id, 'date': self.test_date.isoformat()})
        slot_info_middle = next((slot for slot in response_middle.data if slot['time'] == '10:00'), None)
        self.assertIsNotNone(slot_info_middle)
        self.assertEqual(slot_info_middle['available_count'], 1)

        # Odobravamo i DRUGU rezervaciju
        Reservation.objects.filter(full_name="Jane Doe").update(is_approved=True)

        # Nakon odobrenja obje, termin više nije na listi dostupnih
        response_after = self.client.get(self.availability_url, {'service': self.service.id, 'date': self.test_date.isoformat()})
        self.assertFalse(any(slot['time'] == '10:00' for slot in response_after.data))

    def test_availability_on_holiday(self):
        """Testira da za dan koji je praznik nema slobodnih termina."""
        # Kreiramo praznik za naš testni datum
        Holiday.objects.create(name="Test Holiday", date=self.test_date)

        # Pokušavamo dohvatiti dostupnost za taj dan
        response = self.client.get(self.availability_url, {'service': self.service.id, 'date': self.test_date.isoformat()})

        # Očekujemo HTTP 200 OK, ali sa praznom listom kao podacima
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, []) # Ključna provjera