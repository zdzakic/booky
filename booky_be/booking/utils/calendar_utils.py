# calendar_utils.py
from io import BytesIO

def generate_ics_file(reservation):
    """
    Vraća .ics fajl kao BytesIO objekat za attach u email.
    """
    start = reservation.start_time.strftime('%Y%m%dT%H%M%S')
    end = reservation.end_time.strftime('%Y%m%dT%H%M%S')
    summary = reservation.service.name_en or reservation.service.name

    ics_content = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Booky//EN
BEGIN:VEVENT
SUMMARY:{summary}
DTSTART:{start}
DTEND:{end}
DESCRIPTION:Reservation for {reservation.full_name}, {reservation.license_plate}
LOCATION:Schmidicars Zurich
END:VEVENT
END:VCALENDAR
""".strip()

    buffer = BytesIO()
    buffer.write(ics_content.encode('utf-8'))
    buffer.seek(0)
    return buffer
