from django.utils.html import escape

email_templates = {
    "confirmation": {
        "subject": "Your reservation is pending approval / Ihre Reservierung wird überprüft",
        "html": lambda r: f"""
<p>Hello {escape(r.full_name)},</p>
<p>We received your reservation for <strong>{escape(r.service.name_en or r.service.name)}</strong> on <strong>{r.start_time.strftime('%d.%m.%Y at %H:%M')}</strong>.</p>
<p>Plate: {escape(r.license_plate)}</p>
<p>You will receive an approval email shortly.</p>

<hr>

<p>Hallo {escape(r.full_name)},</p>
<p>Wir haben Ihre Reservierung für <strong>{escape(r.service.name_de or r.service.name)}</strong> am <strong>{r.start_time.strftime('%d.%m.%Y um %H:%M')}</strong> erhalten.</p>
<p>Kennzeichen: {escape(r.license_plate)}</p>
<p>Sie erhalten bald eine Bestätigungs-E-Mail.</p>
"""
    },

    "approved": {
        "subject": "Your reservation has been approved / Ihre Reservierung wurde bestätigt",
        "html": lambda r: f"""
<p>Hello {escape(r.full_name)},</p>
<p>Your reservation for <strong>{escape(r.service.name_en or r.service.name)}</strong> on <strong>{r.start_time.strftime('%d.%m.%Y at %H:%M')}</strong> has been approved.</p>
<p>Plate: {escape(r.license_plate)}</p>
<p>We look forward to seeing you!</p>

<hr>

<p>Hallo {escape(r.full_name)},</p>
<p>Ihre Reservierung für <strong>{escape(r.service.name_de or r.service.name)}</strong> am <strong>{r.start_time.strftime('%d.%m.%Y um %H:%M')}</strong> wurde bestätigt.</p>
<p>Kennzeichen: {escape(r.license_plate)}</p>
<p>Wir freuen uns auf Sie!</p>
"""
    }
}
