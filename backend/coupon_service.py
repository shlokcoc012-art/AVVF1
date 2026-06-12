"""One-time coupon generation + redemption for AstroVedicVani.

Tiered auto-generated coupons (sent to customer via email after each booking,
redeemable on a single future booking):

  Booking total ≥ ₹15,000 → 33% off
  Booking total ≥ ₹5,000  → 21% off
  Booking total ≥ ₹2,500  → 11% off
  Booking total < ₹2,500  → no coupon issued

Coupons are one-time use only and tied to the customer's email.
"""
from __future__ import annotations

import secrets
import string
from datetime import datetime, timezone
from typing import Any, Optional

from bson import ObjectId
from fastapi import HTTPException


# ── Tier definition ──────────────────────────────────────────────────────────

TIERS = [
    {"min_total": 15000, "percent": 33, "label": "33% off"},
    {"min_total": 5000,  "percent": 21, "label": "21% off"},
    {"min_total": 2500,  "percent": 11, "label": "11% off"},
]


def tier_for_total(total: int | float) -> Optional[dict]:
    """Returns the highest applicable tier dict, or None."""
    try:
        t = int(total)
    except (TypeError, ValueError):
        return None
    for tier in TIERS:
        if t >= tier["min_total"]:
            return tier
    return None


# ── Code generation ──────────────────────────────────────────────────────────

_CODE_ALPHABET = string.ascii_uppercase + string.digits  # 36 chars
_CODE_PREFIX = "AVV"
_CODE_BODY_LEN = 7  # 36^7 ≈ 78 billion combinations


async def _generate_unique_code(db) -> str:
    for _ in range(8):  # retry on collision (extremely unlikely)
        body = "".join(secrets.choice(_CODE_ALPHABET) for _ in range(_CODE_BODY_LEN))
        code = f"{_CODE_PREFIX}-{body}"
        if not await db.coupons.find_one({"code": code}):
            return code
    # Fallback: append timestamp suffix
    return f"{_CODE_PREFIX}-{secrets.token_hex(6).upper()}"


# ── Create coupon after a qualifying booking ─────────────────────────────────

async def maybe_create_coupon_for_booking(
    db,
    *,
    booking_id: str,
    customer_email: Optional[str],
    booking_total: int | float,
) -> Optional[dict]:
    """Create and persist a new one-time coupon if the booking qualifies.

    Returns a serializable dict for use in the email (or None).
    Only issued when an email is present (sent over email only).
    """
    if not customer_email:
        return None
    tier = tier_for_total(booking_total)
    if not tier:
        return None

    code = await _generate_unique_code(db)
    doc = {
        "code": code,
        "discount_percent": tier["percent"],
        "issued_to_email": customer_email.strip().lower(),
        "issued_for_booking_id": booking_id,
        "issued_for_total": int(booking_total),
        "is_used": False,
        "created_at": datetime.now(timezone.utc),
        "used_at": None,
        "used_for_booking_id": None,
    }
    await db.coupons.insert_one(doc)
    return {
        "code": code,
        "percent": tier["percent"],
        "label": tier["label"],
    }


# ── Validate / preview a coupon (read-only) ──────────────────────────────────

async def find_and_validate_coupon(db, *, code: str) -> dict:
    """Returns coupon doc if valid + unused, else raises HTTPException(400)."""
    code = (code or "").strip().upper()
    if not code:
        raise HTTPException(status_code=400, detail="Coupon code is required.")
    coupon = await db.coupons.find_one({"code": code})
    if not coupon:
        raise HTTPException(status_code=400, detail="This coupon code is invalid.")
    if coupon.get("is_used"):
        raise HTTPException(status_code=400, detail="This coupon has already been used.")
    return coupon


def compute_discount(subtotal: int | float, percent: int) -> int:
    """Discount applies to the subtotal (mode fee excluded). Rounded down to whole ₹."""
    try:
        sub = int(subtotal)
    except (TypeError, ValueError):
        return 0
    return max(0, (sub * int(percent)) // 100)


# ── Atomic redemption (call inside booking creation) ─────────────────────────

async def redeem_coupon_atomic(db, *, code: str, booking_id: str) -> dict:
    """Atomically mark a coupon as used. Returns the coupon doc or raises 400."""
    code = (code or "").strip().upper()
    if not code:
        raise HTTPException(status_code=400, detail="Coupon code is required.")
    result = await db.coupons.find_one_and_update(
        {"code": code, "is_used": False},
        {
            "$set": {
                "is_used": True,
                "used_at": datetime.now(timezone.utc),
                "used_for_booking_id": booking_id,
            }
        },
    )
    if not result:
        # Either non-existent or already used
        existing = await db.coupons.find_one({"code": code})
        if not existing:
            raise HTTPException(status_code=400, detail="This coupon code is invalid.")
        raise HTTPException(status_code=400, detail="This coupon has already been used.")
    return result


def serialize_coupon(c: dict) -> dict:
    """Serialize a coupon doc for API responses (no sensitive fields)."""
    return {
        "code": c.get("code"),
        "discount_percent": c.get("discount_percent"),
        "is_used": c.get("is_used", False),
        "created_at": c["created_at"].isoformat() if isinstance(c.get("created_at"), datetime) else c.get("created_at"),
    }
