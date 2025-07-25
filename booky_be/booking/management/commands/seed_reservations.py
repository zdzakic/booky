from django.core.management.base import BaseCommand
from booking.models import Reservation, ServiceType
from django.utils import timezone
import random
from datetime import timedelta

IMENA_DE = [
    "Johann Müller", "Lena Schneider", "Maximilian Bauer", "Sophie Fischer", "Leon Weber",
    "Hannah Becker", "Felix Hoffmann", "Emma Schulz", "Lukas Zimmermann", "Mia Hartmann"
]
IMENA_FR = [
    "Pierre Dubois", "Élise Martin", "Luc Morel", "Camille Laurent", "Sophie Petit",
    "Antoine Lambert", "Julie Lefevre", "Nicolas Girard", "Manon Chevalier", "Hugo Renault"
]
IMENA_IT = [
    "Luca Bianchi", "Giulia Rossi", "Matteo Romano", "Alessia Galli", "Marco Ferrari",
    "Francesca Ricci", "Simone Conti", "Chiara Moretti", "Davide Costa", "Martina De Luca"
]
IMENA_RS = [
    "Marko Petrović", "Ana Jovanović", "Nikola Kovačević", "Jelena Ilić", "Stefan Milinković",
    "Ivana Popović", "Miloš Stanković", "Marija Nikolić", "Vladimir Lukić", "Katarina Ristić"
]

EMAIL_DOMENE = ["@example.ch", "@testmail.ch", "@mail.ch"]

CH_KANTONS = [
    "ZH", "GE", "VD", "BE", "BL", "BS", "TI", "SG", "AG", "LU", "SZ", "SH", "TG", "FR",
    "SO", "GR", "NE", "JU", "VS", "OW", "NW", "GL", "AR", "AI", "UR"
]

def make_license_plate():
    canton = random.choice(CH_KANTONS)
    number_len = random.randint(2, 6)
    number = random.randint(10**(number_len-1), 10**number_len - 1)
    return f"{canton}-{number}"

def make_name_email(language_group):
    if language_group == 'de':
        full_name = random.choice(IMENA_DE)
    elif language_group == 'fr':
        full_name = random.choice(IMENA_FR)
    elif language_group == 'it':
        full_name = random.choice(IMENA_IT)
    elif language_group == 'rs':
        full_name = random.choice(IMENA_RS)
    else:
        full_name = "Hans Muster"
    email = (
        full_name.lower()
        .replace(" ", ".")
        .replace("š", "s")
        .replace("ć", "c")
        .replace("č", "c")
        .replace("ž", "z")
        .replace("đ", "dj")
        + random.choice(EMAIL_DOMENE)
    )
    return full_name, email

def make_phone():
    return f"+41 7{random.randint(6,9)} {random.randint(100,999)} {random.randint(10,99)} {random.randint(10,99)}"

def gen_working_datetime(dt_type, duration_minutes):
    while True:
        # 1. Odredi bazni dan (u prošlosti, sljedećih 7, ili onih tamo 8-14 dana)
        if dt_type == 'past':
            base_date = timezone.now() - timedelta(days=random.randint(1, 10))
        elif dt_type == 'next':
            base_date = timezone.now() + timedelta(days=random.randint(0, 6))
        else:
            base_date = timezone.now() + timedelta(days=random.randint(8, 14))
        # 2. Presloži na radni dan (pon–pet)
        while base_date.weekday() >= 5:  # 5=subota, 6=nedjelja
            base_date += timedelta(days=1)
        # 3. Randomizuj slot prije ili poslije pauze
        before_pause = random.choice([True, False])
        if before_pause:
            # 08:00 do max (12:00 - trajanje)
            earliest = 8 * 60
            latest = (12 * 60) - duration_minutes
        else:
            # 13:00 do max (17:00 - trajanje)
            earliest = 13 * 60
            latest = (17 * 60) - duration_minutes
        if latest < earliest:
            continue  # skipaj, nema mjesta za taj servis
        start_minutes = random.randint(earliest, latest)
        start_hour = start_minutes // 60
        start_minute = start_minutes % 60
        # Postavi na bazni dan
        start_time = base_date.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(hours=start_hour, minutes=start_minute)
        # timezone-aware (vec jeste)
        return start_time

class Command(BaseCommand):
    help = 'Seed random reservations for testing/demo. --delete briše sve, -nr N pravi N novih rezervacija'

    def add_arguments(self, parser):
        parser.add_argument(
            '-nr', '--number',
            type=int,
            default=10,
            help='Broj rezervacija za generisati (default 10)'
        )
        parser.add_argument(
            '-d', '--delete',
            action='store_true',
            help='Prvo obrisi sve rezervacije (i zaustavi se)'
        )

    def handle(self, *args, **options):
        broj_rez = options['number']
        do_delete = options['delete']

        # --delete radi samo brisanje!
        if do_delete:
            Reservation.objects.all().delete()
            self.stdout.write(self.style.WARNING("Obrisane sve postojeće rezervacije."))
            return

        if broj_rez == 0:
            self.stdout.write(self.style.SUCCESS("Nema traženih novih rezervacija za seed."))
            return

        if ServiceType.objects.count() == 0:
            self.stdout.write(self.style.ERROR("Nema definisanih ServiceType!"))
            return

        lang_groups = ['de', 'fr', 'it', 'rs']
        count_per_group = broj_rez // len(lang_groups)
        extra = broj_rez % len(lang_groups)
        lang_list = []
        for g in lang_groups:
            lang_list.extend([g]*count_per_group)
        lang_list.extend(random.choices(lang_groups, k=extra))
        random.shuffle(lang_list)

        rezervacije = []

        def get_random_service():
            return random.choice(list(ServiceType.objects.all()))

        def get_random_resource(service):
            return random.choice(list(service.resources.all()))

        n_past = max(1, broj_rez // 5)
        n_next = broj_rez // 2
        n_later = broj_rez - n_past - n_next

        date_types = ['past'] * n_past + ['next'] * n_next + ['later'] * n_later
        random.shuffle(date_types)

        for i in range(broj_rez):
            service = get_random_service()
            resource = get_random_resource(service)
            lang_group = lang_list[i % len(lang_list)]
            full_name, email = make_name_email(lang_group)
            start_time = gen_working_datetime(date_types[i % len(date_types)], service.duration_minutes)
            end_time = start_time + timedelta(minutes=service.duration_minutes)
            is_stored = random.choice([True, False]) if 'wheel' in service.name.lower() else False
            if date_types[i % len(date_types)] == 'past':
                is_approved = random.choice([True, False])
            else:
                is_approved = (i % 2 == 0)
            r = Reservation(
                full_name=full_name,
                phone=make_phone(),
                email=email,
                license_plate=make_license_plate(),
                service=service,
                start_time=start_time,
                end_time=end_time,
                resource=resource,
                is_stored=is_stored,
                is_approved=is_approved
            )
            rezervacije.append(r)

        for r in rezervacije:
            r.save()
            self.stdout.write(self.style.SUCCESS(
                f"Added: {r.full_name} / {r.service.name} @ {r.start_time.strftime('%a %d.%m.%Y %H:%M')} / Approved: {r.is_approved} / Stored: {r.is_stored}"
            ))

        self.stdout.write(self.style.SUCCESS(f"Gotovo! {broj_rez} rezervacija dodano."))
