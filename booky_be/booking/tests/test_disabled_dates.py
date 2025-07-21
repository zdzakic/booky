from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.utils import timezone
from datetime import timedelta
from ..models import Holiday, BusinessHours

class DisabledDatesAPITests(APITestCase):
    def setUp(self):
        # Kreiramo BusinessHours samo za radne dane (pon–pet, tj. 0–4)
        for dow in range(5):
            BusinessHours.objects.create(day_of_week=dow, open_time="08:00", close_time="17:00")
        # Dodamo jedan praznik sutra
        self.today = timezone.localdate()
        self.holiday = Holiday.objects.create(
            name="Test Holiday",
            date=self.today + timedelta(days=1)
        )
        # URL za naš endpoint (pretpostavljamo namespace 'booking')
        self.url = reverse('booking:disabled-dates')

    def test_default_days_param_includes_holiday_and_weekend(self):
        """GET bez parametra days vraća default (90) i sadrži praznik i vikend."""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        # Provjeri start_date i end_date
        self.assertEqual(data['start_date'], self.today.isoformat())
        expected_end = self.today + timedelta(days=90)
        self.assertEqual(data['end_date'], expected_end.isoformat())

        disabled = data['disabled_dates']
        # Praznik sutra mora biti u disabled listi
        self.assertIn(self.holiday.date.isoformat(), disabled)

        # Uvjerimo se da barem jedan od prvih vikenda (npr. danas+5) također stoji u disabled
        # (danas.uikend može biti daleko; uzimamo generički primjer)
        sample_weekend = self.today + timedelta(days=(5 - self.today.weekday()) % 7)
        self.assertIn(sample_weekend.isoformat(), disabled)

    def test_custom_days_param_and_invalid(self):
        """GET s days=5 vrati kratak period, a s ne-numeričkim days baci 400."""
        # Validni parametar days
        response = self.client.get(self.url, {'days': 5})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        # end_date točno danas+5
        expected_end = self.today + timedelta(days=5)
        self.assertEqual(data['end_date'], expected_end.isoformat())
        # sutrašnji praznik je i dalje unutar tog perioda
        self.assertIn(self.holiday.date.isoformat(), data['disabled_dates'])

        # Nevalidni parametar days
        bad = self.client.get(self.url, {'days': 'foo'})
        self.assertEqual(bad.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detail', bad.json())
        self.assertEqual(bad.json()['detail'], 'Parametar must be an int.')
