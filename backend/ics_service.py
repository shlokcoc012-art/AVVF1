"""Generate an iCalendar (.ics) invite for a booking.

The booking flow promises "we'll call within 2–4 hours", so the event is created
as a TENTATIVE hold spanning that 2-hour callback window. Once the consultation
is confirmed by phone, the customer can move the event to the agreed time.
"""
from __future__ import annotations

import re
import uuid
from datetime import datetime, timedelta, timezone

# Mode → ICS LOCATION text
_MODE_LOCATION = {
    'Phone Call':    'Phone Call (+91 91991 91902)',
    'Video Call':    'Video Call (link will be shared via WhatsApp)',
    'In-Person':     'AstroVedicVani Center · Pt. N.R. Pathak',
    'In Person':     'AstroVedicVani Center · Pt. N.R. Pathak',
    'In-person':     'AstroVedicVani Center · Pt. N.R. Pathak',
}


def _fmt_utc(dt: datetime) -> str:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).strftime('%Y%m%dT%H%M%SZ')


def _escape(text: str) -> str:
    """RFC 5545 text-value escaping: backslash, comma, semicolon, newline."""
    if text is None:
        return ''
    out = str(text).replace('\\', '\\\\').replace(';', '\\;').replace(',', '\\,')
    out = out.replace('\r\n', '\\n').replace('\n', '\\n').replace('\r', '\\n')
    return out


def _fold_line(line: str) -> str:
    """RFC 5545 line-folding: max 75 octets per line, continuation lines start with a space."""
    if len(line) <= 75:
        return line
    parts = [line[:75]]
    rest = line[75:]
    while rest:
        parts.append(' ' + rest[:74])
        rest = rest[74:]
    return '\r\n'.join(parts)


_IST = timezone(timedelta(hours=5, minutes=30))


def _resolve_event_window(booking: dict, anchor: datetime) -> tuple[datetime, datetime, str]:
    """Return (DTSTART, DTEND, STATUS) for the VEVENT.

    If the customer picked a preferred date+time, use that as a 60-minute
    CONFIRMED event in IST. Otherwise fall back to a 2-hour TENTATIVE callback
    window starting 2 hours from the booking time (matching the SLA).
    """
    pd = booking.get("preferred_date")
    pt = booking.get("preferred_time")
    if pd and pt:
        try:
            local = datetime.strptime(f"{pd} {pt}", "%Y-%m-%d %H:%M").replace(tzinfo=_IST)
            return local, local + timedelta(hours=1), "CONFIRMED"
        except ValueError:
            pass
    return anchor + timedelta(hours=2), anchor + timedelta(hours=4), "TENTATIVE"


def build_ics(booking: dict) -> bytes:
    """Build an ICS payload (bytes) for the given booking.

    Event = a tentative 2-hour callback window starting ~2 hours after booking
    creation. Customer is added as ATTENDEE so calendar apps surface RSVP.
    """
    booking_id = str(booking.get('id') or uuid.uuid4().hex)
    name = booking.get('name') or 'Guest'
    customer_email = booking.get('email') or ''
    service = booking.get('service') or 'Consultation'
    concern = booking.get('concern') or ''
    mode = booking.get('mode') or 'Phone Call'
    phone = booking.get('phone') or ''
    total = booking.get('total')

    # Anchor: created_at if present, else "now"
    created_raw = booking.get('created_at')
    if isinstance(created_raw, datetime):
        anchor = created_raw
    elif isinstance(created_raw, str):
        try:
            anchor = datetime.fromisoformat(created_raw.replace('Z', '+00:00'))
        except ValueError:
            anchor = datetime.now(timezone.utc)
    else:
        anchor = datetime.now(timezone.utc)
    if anchor.tzinfo is None:
        anchor = anchor.replace(tzinfo=timezone.utc)

    start, end, status = _resolve_event_window(booking, anchor)
    now   = datetime.now(timezone.utc)

    location = _MODE_LOCATION.get(mode, mode)

    confirmed_slot = (status == 'CONFIRMED')
    pretty_slot = ''
    if confirmed_slot:
        pretty_slot = start.astimezone(_IST).strftime('%A, %d %b %Y · %I:%M %p IST')

    description_parts = [
        'AstroVedicVani Consultation',
        '',
        f'Service: {service}',
        f'Concern: {concern}',
        f'Mode: {mode}',
    ]
    if total is not None:
        description_parts.append(f'Total: INR {int(total):,}')
    description_parts += [
        '',
        f'Booking ID: {booking_id}',
        '',
    ]
    if confirmed_slot:
        description_parts += [
            f'Your slot: {pretty_slot}',
            f"We'll call you on +91 {phone} at this exact time.",
        ]
    else:
        ist_start = start.astimezone(_IST).strftime('%I:%M %p')
        ist_end = end.astimezone(_IST).strftime('%I:%M %p')
        description_parts.append(
            f'Our team will call you on +91 {phone} between {ist_start} and {ist_end} IST to confirm the exact slot.'
        )
    description_parts += [
        '',
        'Pt. N.R. Pathak · +91 91991 91902',
    ]
    description = _escape('\n'.join(description_parts))

    summary = _escape(f'AstroVedicVani Consultation — {service}')

    # Safe UID: alphanumeric only
    safe_id = re.sub(r'[^A-Za-z0-9]', '', booking_id) or uuid.uuid4().hex
    uid = f'{safe_id}@astrovedicvani.com'

    lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//AstroVedicVani//Booking//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:REQUEST',
        'BEGIN:VEVENT',
        f'UID:{uid}',
        f'DTSTAMP:{_fmt_utc(now)}',
        f'DTSTART:{_fmt_utc(start)}',
        f'DTEND:{_fmt_utc(end)}',
        f'SUMMARY:{summary}',
        f'DESCRIPTION:{description}',
        f'LOCATION:{_escape(location)}',
        f'STATUS:{status}',
        'TRANSP:OPAQUE',
        'SEQUENCE:0',
        'ORGANIZER;CN=Pt. N.R. Pathak:MAILTO:support@astrovedicvani.com',
    ]
    if customer_email:
        lines.append(
            f'ATTENDEE;CN={_escape(name)};ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:MAILTO:{customer_email}'
        )
    lines += [
        'BEGIN:VALARM',
        'TRIGGER:-PT30M',
        'ACTION:DISPLAY',
        'DESCRIPTION:AstroVedicVani consultation reminder',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR',
    ]

    folded = [_fold_line(ln) for ln in lines]
    payload = '\r\n'.join(folded) + '\r\n'
    return payload.encode('utf-8')
