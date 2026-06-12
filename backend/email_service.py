"""SendGrid email notifications for booking events.

Gracefully no-ops (logs a warning) if SENDGRID_API_KEY / SENDER_EMAIL are not set,
so the booking endpoint always succeeds even before keys are configured.
"""
from __future__ import annotations

import base64
import logging
import os
from datetime import datetime
from typing import Optional

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import (
    Attachment,
    Disposition,
    FileContent,
    FileName,
    FileType,
    Mail,
)

from ics_service import build_ics

logger = logging.getLogger("astrovedicvani.email")
logging.basicConfig(level=logging.INFO)


# ── Helpers ─────────────────────────────────────────────────────────────────

def _fmt_money(amount: Optional[int]) -> str:
    if amount is None:
        return "—"
    return f"₹{amount:,}"


def _fmt_dt(dt: datetime) -> str:
    return dt.strftime("%d %b %Y, %I:%M %p")


def _send(to_email: str, subject: str, html: str, text: str, ics: Optional[bytes] = None) -> bool:
    api_key = os.environ.get("SENDGRID_API_KEY")
    sender = os.environ.get("SENDER_EMAIL")

    if not api_key or not sender:
        logger.warning(
            "SendGrid not configured (missing SENDGRID_API_KEY or SENDER_EMAIL). "
            "Skipping email to %s: %s",
            to_email,
            subject,
        )
        return False

    try:
        message = Mail(
            from_email=sender,
            to_emails=to_email,
            subject=subject,
            plain_text_content=text,
            html_content=html,
        )
        if ics:
            attachment = Attachment(
                FileContent(base64.b64encode(ics).decode()),
                FileName("astrovedicvani-consultation.ics"),
                FileType("text/calendar; method=REQUEST"),
                Disposition("attachment"),
            )
            message.attachment = attachment
        sg = SendGridAPIClient(api_key)
        resp = sg.send(message)
        ok = 200 <= resp.status_code < 300
        if ok:
            logger.info("Email sent to %s (subject=%r, status=%d)", to_email, subject, resp.status_code)
        else:
            logger.error(
                "SendGrid returned non-2xx for %s: status=%d body=%r",
                to_email, resp.status_code, getattr(resp, "body", None),
            )
        return ok
    except Exception as exc:  # noqa: BLE001 — log and swallow; do not break booking flow
        logger.exception("SendGrid email failed for %s: %s", to_email, exc)
        return False


# ── Templates ───────────────────────────────────────────────────────────────

def _format_slot(b: dict) -> Optional[str]:
    pd, pt = b.get('preferred_date'), b.get('preferred_time')
    if not pd or not pt:
        return None
    try:
        local = datetime.strptime(f"{pd} {pt}", "%Y-%m-%d %H:%M")
        return local.strftime('%a, %d %b %Y · %I:%M %p IST')
    except ValueError:
        return f'{pd} · {pt} IST'


def _items_rows_html(cart_items: list[dict]) -> str:
    if not cart_items:
        return ""
    rows = "".join(
        f"<tr><td style='padding:6px 10px;border-bottom:1px solid #fde68a'>{i.get('icon','')} {i.get('title','')}</td>"
        f"<td style='padding:6px 10px;text-align:right;border-bottom:1px solid #fde68a;font-weight:600'>"
        f"{_fmt_money(i.get('unit_price') or i.get('unitPrice'))}</td></tr>"
        for i in cart_items
    )
    return (
        "<table style='width:100%;border-collapse:collapse;margin:8px 0 12px;font-size:13px;color:#78350f'>"
        f"{rows}</table>"
    )


def _admin_html(b: dict) -> str:
    items_html = _items_rows_html(b.get("cart_items") or [])
    slot = _format_slot(b)
    slot_row = (
        f'<tr><td style="padding:6px 0;color:#a16207">Preferred Slot</td>'
        f'<td style="color:#451a03;font-weight:700">{slot}</td></tr>'
    ) if slot else ''
    return f"""<!doctype html><html><body style="margin:0;padding:0;background:#fffbeb;font-family:Inter,Arial,sans-serif">
  <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #fde68a;border-radius:16px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#78350f,#b45309);padding:22px 24px;color:#fde68a">
      <div style="font-size:13px;letter-spacing:.18em;text-transform:uppercase;opacity:.8">AstroVedicVani · Admin Alert</div>
      <h1 style="margin:6px 0 0;font-size:22px;color:#fde68a">🔮 New Booking Received</h1>
    </div>
    <div style="padding:22px 24px;color:#78350f">
      <p style="margin:0 0 16px;font-size:14px">A new consultation has just been booked. Please reach out within <b>2–4 hours</b>.</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <tr><td style="padding:6px 0;color:#a16207;width:38%">Booking ID</td><td style="font-family:monospace;color:#451a03">{b.get('id','—')}</td></tr>
        <tr><td style="padding:6px 0;color:#a16207">Name</td><td style="color:#451a03;font-weight:700">{b.get('name','—')}</td></tr>
        <tr><td style="padding:6px 0;color:#a16207">Phone</td><td style="color:#451a03"><a href="tel:+91{b.get('phone','')}" style="color:#b45309;text-decoration:none">+91 {b.get('phone','')}</a></td></tr>
        <tr><td style="padding:6px 0;color:#a16207">Email</td><td style="color:#451a03">{b.get('email') or '—'}</td></tr>
        <tr><td style="padding:6px 0;color:#a16207">DOB / TOB</td><td style="color:#451a03">{b.get('dob') or '—'} {('· ' + b['tob']) if b.get('tob') else ''}</td></tr>
        <tr><td style="padding:6px 0;color:#a16207">Place</td><td style="color:#451a03">{b.get('city') or '—'}, {b.get('state') or '—'}</td></tr>
        <tr><td style="padding:6px 0;color:#a16207">Service</td><td style="color:#451a03;font-weight:700">{b.get('service','—')}</td></tr>
        <tr><td style="padding:6px 0;color:#a16207">Concern</td><td style="color:#451a03">{b.get('concern','—')}</td></tr>
        <tr><td style="padding:6px 0;color:#a16207">Mode</td><td style="color:#451a03">{b.get('mode','—')}</td></tr>
        {slot_row}
        {'<tr><td style="padding:6px 0;color:#a16207">Coupon</td><td style="color:#451a03">' + b['coupon'] + '</td></tr>' if b.get('coupon') else ''}
      </table>
      {('<div style="margin-top:18px;font-size:12px;color:#a16207;text-transform:uppercase;letter-spacing:.16em;font-weight:700">Cart</div>' + items_html) if b.get('cart_items') else ''}
      <table style="width:100%;border-collapse:collapse;margin-top:6px;font-size:13px;color:#78350f">
        <tr><td style="padding:4px 0;color:#a16207">Subtotal</td><td style="text-align:right">{_fmt_money(b.get('subtotal'))}</td></tr>
        <tr><td style="padding:4px 0;color:#a16207">Mode fee</td><td style="text-align:right">{_fmt_money(b.get('mode_fee') or b.get('modeFee'))}</td></tr>
        <tr><td style="padding:8px 0;border-top:1px solid #fde68a;color:#451a03;font-weight:700">Total</td><td style="border-top:1px solid #fde68a;text-align:right;font-weight:700;color:#b45309">{_fmt_money(b.get('total'))}</td></tr>
      </table>
      {('<div style="margin-top:14px;padding:12px;background:#fef3c7;border-radius:10px;border:1px solid #fde68a;color:#78350f;font-size:13px"><b>Message:</b><br>' + (b.get('message') or '').replace(chr(10), '<br>') + '</div>') if b.get('message') else ''}
      <p style="margin:18px 0 0;color:#a16207;font-size:12px">Received at {_fmt_dt(datetime.now())}</p>
    </div>
  </div>
</body></html>"""


def _admin_text(b: dict) -> str:
    lines = [
        "New Booking — AstroVedicVani",
        "=" * 36,
        f"Booking ID : {b.get('id','—')}",
        f"Name       : {b.get('name','—')}",
        f"Phone      : +91 {b.get('phone','')}",
        f"Email      : {b.get('email') or '—'}",
        f"DOB / TOB  : {b.get('dob') or '—'} {b.get('tob') or ''}".rstrip(),
        f"Place      : {b.get('city') or '—'}, {b.get('state') or '—'}",
        f"Service    : {b.get('service','—')}",
        f"Concern    : {b.get('concern','—')}",
        f"Mode       : {b.get('mode','—')}",
        f"Total      : {_fmt_money(b.get('total'))}",
    ]
    if b.get("coupon"):
        lines.append(f"Coupon     : {b['coupon']}")
    if b.get("cart_items"):
        lines.append("")
        lines.append("Cart:")
        for i in b["cart_items"]:
            lines.append(f"  - {i.get('title','')}  {_fmt_money(i.get('unit_price') or i.get('unitPrice'))}")
    if b.get("message"):
        lines.append("")
        lines.append(f"Message: {b['message']}")
    return "\n".join(lines)


def _coupon_block_html(b: dict) -> str:
    nc = b.get("next_coupon")
    if not nc:
        return ""
    pct = nc.get("percent")
    code = nc.get("code", "")
    return f'''
      <div style="margin-top:18px;padding:18px;background:linear-gradient(135deg,#fef9c3 0%,#fde68a 50%,#fcd34d 100%);border:2px dashed #b45309;border-radius:14px;text-align:center">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.2em;color:#92400e;font-weight:800">🎁 Thank-you Gift · Next Booking</div>
        <div style="margin:10px 0 6px;font-size:13px;color:#78350f">Use this one-time coupon on your next consultation</div>
        <div style="margin:8px 0 6px;display:inline-block;background:#451a03;color:#fde68a;font-family:monospace;font-weight:800;font-size:18px;letter-spacing:.16em;padding:10px 18px;border-radius:10px;border:1px solid #92400e">
          {code}
        </div>
        <div style="margin-top:8px;font-size:22px;color:#b45309;font-weight:900">{pct}% OFF</div>
        <div style="margin-top:6px;font-size:11px;color:#92400e;line-height:1.5">
          Valid for one-time use only · Cannot be combined with other offers
        </div>
      </div>'''


def _coupon_applied_html(b: dict) -> str:
    ca = b.get("coupon_applied")
    if not ca:
        return ""
    return (
        f'<div style="margin:10px 0;padding:10px 14px;background:#dcfce7;border:1px solid #86efac;'
        f'border-radius:10px;color:#166534;font-size:12px">'
        f'🎟️ Coupon <b style="font-family:monospace">{ca.get("code")}</b> applied — '
        f'you saved <b>₹{int(ca.get("discount", 0)):,}</b> ({ca.get("percent")}% off)'
        f'</div>'
    )


def _customer_html(b: dict) -> str:
    items_html = _items_rows_html(b.get("cart_items") or [])
    slot = _format_slot(b)
    slot_block = (
        '<div style="margin:14px 0;padding:12px 14px;background:linear-gradient(135deg,#fef9c3,#fde68a);border-radius:12px;border:1px solid #fcd34d;text-align:center">'
        f'<div style="font-size:11px;text-transform:uppercase;letter-spacing:.16em;color:#a16207;font-weight:700">Your Slot</div>'
        f'<div style="font-size:16px;color:#78350f;font-weight:800;margin-top:4px">{slot}</div>'
        '</div>'
    ) if slot else ''
    return f"""<!doctype html><html><body style="margin:0;padding:0;background:#fffbeb;font-family:Inter,Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #fde68a;border-radius:16px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#1c0a00,#4a1a05);padding:28px 24px;color:#fde68a;text-align:center">
      <div style="font-size:34px">🔮</div>
      <h1 style="margin:6px 0 4px;font-size:24px;color:#fde68a">Booking Confirmed</h1>
      <div style="font-size:13px;opacity:.85">Pt. N.R. Pathak · ज्योतिषाचार्य</div>
    </div>
    <div style="padding:24px;color:#78350f">
      <p style="margin:0 0 12px;font-size:15px">Namaste <b>{b.get('name','—')}</b>,</p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6">
        Thank you for booking your consultation with <b>AstroVedicVani</b>. Our team will reach out to you on
        <b>+91 {b.get('phone','')}</b>{' at your chosen slot' if slot else ' within <b>2–4 hours</b>'} to confirm your appointment.
      </p>

      {slot_block}

      <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:14px;margin:14px 0">
        <table style="width:100%;border-collapse:collapse;font-size:13px;color:#78350f">
          <tr><td style="padding:4px 0;color:#a16207">Service</td><td style="text-align:right;font-weight:700">{b.get('service','—')}</td></tr>
          <tr><td style="padding:4px 0;color:#a16207">Concern</td><td style="text-align:right">{b.get('concern','—')}</td></tr>
          <tr><td style="padding:4px 0;color:#a16207">Mode</td><td style="text-align:right">{b.get('mode','—')}</td></tr>
          <tr><td style="padding:8px 0;border-top:1px solid #fde68a;color:#451a03;font-weight:700">Total</td><td style="border-top:1px solid #fde68a;text-align:right;font-weight:700;color:#b45309">{_fmt_money(b.get('total'))}</td></tr>
        </table>
      </div>

      {items_html if b.get('cart_items') else ''}

      {_coupon_applied_html(b)}

      <p style="margin:14px 0 4px;font-size:13px;color:#a16207"><b>Booking ID</b></p>
      <p style="margin:0;font-family:monospace;font-size:13px;color:#451a03">{b.get('id','—')}</p>

      {_coupon_block_html(b)}

      <div style="margin-top:16px;padding:12px 14px;background:#fef3c7;border-left:4px solid #f59e0b;border-radius:8px;color:#78350f;font-size:12px;line-height:1.5">
        📅 <b>Add to Calendar</b> — open the <code style="background:#fde68a;padding:1px 6px;border-radius:4px">astrovedicvani-consultation.ics</code> attachment and your calendar app (Google Calendar, Apple Calendar, Outlook) will save a tentative 2-hour callback window. We&apos;ll move it to the exact time once we speak with you.
      </div>

      <div style="margin-top:22px;padding:14px;background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:12px;text-align:center;font-size:13px;color:#78350f">
        ॐ तत् सत् — May the stars bless your journey 🌟
      </div>

      <p style="margin:20px 0 0;font-size:12px;color:#a16207;line-height:1.6">
        Need to reschedule? Contact us at
        <a href="mailto:support@astrovedicvani.com" style="color:#b45309;text-decoration:none">support@astrovedicvani.com</a>
        or WhatsApp us at
        <a href="https://wa.me/919199191902" style="color:#b45309;text-decoration:none">+91 91991 91902</a>.
      </p>
    </div>
    <div style="background:#fef3c7;padding:14px 24px;text-align:center;font-size:11px;color:#a16207">
      © {datetime.now().year} AstroVedicVani · Pt. N.R. Pathak
    </div>
  </div>
</body></html>"""


def _customer_text(b: dict) -> str:
    slot = _format_slot(b)
    lines = [
        f"Namaste {b.get('name','—')},",
        "",
        "Thank you for booking your consultation with AstroVedicVani.",
        f"Our team will contact you on +91 {b.get('phone','')}" + (f" at your chosen slot: {slot}." if slot else " within 2–4 hours."),
        "",
        "Booking summary:",
        f"  Service : {b.get('service','—')}",
        f"  Concern : {b.get('concern','—')}",
        f"  Mode    : {b.get('mode','—')}",
    ]
    if slot:
        lines.append(f"  Slot    : {slot}")
    lines += [
        f"  Total   : {_fmt_money(b.get('total'))}",
        f"  Booking ID: {b.get('id','—')}",
    ]
    ca = b.get("coupon_applied")
    if ca:
        lines.append(f"  Coupon  : {ca.get('code')} — you saved ₹{int(ca.get('discount', 0)):,} ({ca.get('percent')}% off)")
    nc = b.get("next_coupon")
    if nc:
        lines += [
            "",
            "🎁 THANK-YOU GIFT — Your one-time coupon for the next booking:",
            f"   CODE: {nc.get('code')}    →  {nc.get('percent')}% OFF",
            "   Valid for one-time use only. Cannot be combined with other offers.",
        ]
    lines += [
        "",
        "📅 Add to Calendar: open the attached astrovedicvani-consultation.ics file to save",
        "the consultation in Google Calendar / Apple Calendar / Outlook.",
        "",
        "ॐ तत् सत् — May the stars bless your journey.",
        "",
        "— Pt. N.R. Pathak · AstroVedicVani",
        "+91 91991 91902 · support@astrovedicvani.com",
    ]
    return "\n".join(lines)


# ── Public dispatch ─────────────────────────────────────────────────────────

def send_booking_notifications(booking: dict) -> None:
    """Fire admin + customer emails. Safe to call from BackgroundTasks."""
    # Allow the admin notification recipient to be a different mailbox than
    # the admin login account. Falls back to ADMIN_EMAIL for backwards compat.
    admin_to = os.environ.get("ADMIN_NOTIFY_EMAIL") or os.environ.get("ADMIN_EMAIL")
    customer_to = booking.get("email")
    name = booking.get("name", "Guest")

    # Generate one ICS payload — attached to both admin & customer emails so the
    # consultation lands in both calendars (tentative 2–4h callback window).
    try:
        ics_payload: Optional[bytes] = build_ics(booking)
    except Exception:  # noqa: BLE001 — never let ICS failure break notifications
        logger.exception("Failed to build ICS for booking %s", booking.get("id"))
        ics_payload = None

    if admin_to:
        _send(
            to_email=admin_to,
            subject=f"🔮 New Booking — {name} · {booking.get('service','')}",
            html=_admin_html(booking),
            text=_admin_text(booking),
            ics=ics_payload,
        )
    else:
        logger.warning("ADMIN_EMAIL not configured — skipping admin notification.")

    if customer_to:
        _send(
            to_email=customer_to,
            subject="🌟 Your AstroVedicVani consultation is confirmed",
            html=_customer_html(booking),
            text=_customer_text(booking),
            ics=ics_payload,
        )
