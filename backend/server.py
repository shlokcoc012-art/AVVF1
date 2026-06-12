from __future__ import annotations

from dotenv import load_dotenv
load_dotenv()  # Load env vars BEFORE any other imports that read them.

import csv
import io
import os
from datetime import datetime, timedelta, timezone
from typing import Annotated, Any, List, Optional

from bson import ObjectId
from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, BeforeValidator, ConfigDict, EmailStr, Field

from auth import (
    create_access_token,
    make_get_current_admin,
    seed_admin,
    verify_password,
)
from coupon_service import (
    compute_discount,
    find_and_validate_coupon,
    maybe_create_coupon_for_booking,
    redeem_coupon_atomic,
    tier_for_total,
)
from email_service import send_booking_notifications
from pymongo import ReturnDocument

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="AstroVedicVani API")

# Same-origin frontend via ingress, so `*` is fine. (We use Bearer tokens, not cookies.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

get_current_admin = make_get_current_admin(db)


# ── Startup ──────────────────────────────────────────────────────────────────

@app.on_event("startup")
async def _startup() -> None:
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.bookings.create_index("created_at")
    await db.bookings.create_index("status")
    await db.coupons.create_index("code", unique=True)
    await db.coupons.create_index("issued_to_email")
    await seed_admin(db)


# ── ObjectId helpers ─────────────────────────────────────────────────────────

def _validate_object_id(v: Any) -> str:
    if isinstance(v, ObjectId):
        return str(v)
    if isinstance(v, str) and ObjectId.is_valid(v):
        return v
    raise ValueError("Invalid ObjectId")


PyObjectId = Annotated[str, BeforeValidator(_validate_object_id)]


# ── Models ───────────────────────────────────────────────────────────────────

class CartItemIn(BaseModel):
    id: str
    section: str
    title: str
    icon: Optional[str] = None
    unit_price: int = Field(alias="unitPrice")
    was_price: Optional[int] = Field(default=None, alias="wasPrice")
    discount: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True)


class BookingCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: Optional[EmailStr] = None
    phone: str = Field(pattern=r"^\d{10}$")
    dob: Optional[str] = None
    tob: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    preferred_date: Optional[str] = Field(default=None, alias="preferred_date")
    preferred_time: Optional[str] = Field(default=None, alias="preferred_time")
    service: str = Field(min_length=1)
    concern: str = Field(min_length=1)
    mode: str = Field(min_length=1)
    message: Optional[str] = None
    coupon: Optional[str] = None

    cart_items: List[CartItemIn] = Field(default_factory=list, alias="cartItems")
    subtotal: Optional[int] = None
    mode_fee: Optional[int] = Field(default=None, alias="modeFee")
    total: Optional[int] = None
    from_cart: bool = Field(default=False, alias="fromCart")

    model_config = ConfigDict(populate_by_name=True)


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


VALID_STATUSES = {"pending", "contacted", "confirmed", "completed", "cancelled"}


class BookingUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None  # full replacement of notes field


class CouponValidateIn(BaseModel):
    code: str = Field(min_length=1, max_length=40)
    subtotal: int = Field(ge=0)


# ── Public Routes ────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok", "service": "astrovedicvani"}


@app.post("/api/coupons/validate")
async def validate_coupon(payload: CouponValidateIn) -> dict:
    coupon = await find_and_validate_coupon(db, code=payload.code)
    percent = int(coupon["discount_percent"])
    discount = compute_discount(payload.subtotal, percent)
    return {
        "ok": True,
        "code": coupon["code"],
        "discount_percent": percent,
        "discount_amount": discount,
        "message": f"{percent}% off applied — you save ₹{discount:,}",
    }


@app.post("/api/bookings", status_code=201)
async def create_booking(payload: BookingCreate, background_tasks: BackgroundTasks) -> dict:
    doc = payload.model_dump(by_alias=False, exclude_none=False)

    # ── Coupon redemption (server-side) ──────────────────────────────────────
    coupon_applied: Optional[dict] = None
    if payload.coupon:
        # Validate (read-only) before recalculating totals
        coupon_doc = await find_and_validate_coupon(db, code=payload.coupon)
        percent = int(coupon_doc["discount_percent"])
        sub = int(doc.get("subtotal") or 0)
        mode_fee_val = int(doc.get("mode_fee") or 0)
        discount = compute_discount(sub, percent)

        # Recompute total server-side so a tampered client total can't be used.
        doc["coupon"] = coupon_doc["code"]
        doc["coupon_percent"] = percent
        doc["coupon_discount"] = discount
        doc["total"] = max(0, sub - discount) + mode_fee_val
        coupon_applied = {"code": coupon_doc["code"], "percent": percent, "discount": discount}

    doc["status"] = "pending"
    doc["notes"] = ""
    doc["created_at"] = datetime.now(timezone.utc)
    doc["updated_at"] = doc["created_at"]

    result = await db.bookings.insert_one(doc)
    booking_id = str(result.inserted_id)

    # Mark coupon as used AFTER booking is created
    if coupon_applied:
        await redeem_coupon_atomic(db, code=coupon_applied["code"], booking_id=booking_id)

    # Auto-generate a NEW one-time coupon for the next booking (emailed only)
    next_coupon = await maybe_create_coupon_for_booking(
        db,
        booking_id=booking_id,
        customer_email=doc.get("email"),
        booking_total=doc.get("total") or 0,
    )

    notification_payload = {**doc, "id": booking_id}
    notification_payload.pop("_id", None)
    notification_payload["created_at"] = doc["created_at"].isoformat()
    notification_payload["updated_at"] = doc["updated_at"].isoformat()
    notification_payload["coupon_applied"] = coupon_applied
    notification_payload["next_coupon"] = next_coupon  # may be None
    background_tasks.add_task(send_booking_notifications, notification_payload)

    return {
        "ok": True,
        "id": booking_id,
        "status": "pending",
        "coupon_applied": coupon_applied,
        "message": (
            "Booking confirmed. Our team will contact you within 2–4 hours."
            + (" A special discount coupon for your next booking has been sent to your email."
               if next_coupon else "")
        ),
    }


# ── Auth Routes ──────────────────────────────────────────────────────────────

MAX_FAILED = 5
LOCKOUT_MINUTES = 15


async def _check_lockout(identifier: str) -> None:
    entry = await db.login_attempts.find_one({"identifier": identifier})
    if not entry:
        return
    locked_until = entry.get("locked_until")
    if locked_until:
        # MongoDB returns naive UTC datetimes; normalize before comparison
        if locked_until.tzinfo is None:
            locked_until = locked_until.replace(tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        if locked_until > now:
            mins = int((locked_until - now).total_seconds() / 60) + 1
            raise HTTPException(status_code=429, detail=f"Too many failed attempts. Try again in {mins} minute(s).")


async def _record_failure(identifier: str) -> None:
    now = datetime.now(timezone.utc)
    entry = await db.login_attempts.find_one({"identifier": identifier})
    fails = (entry or {}).get("count", 0) + 1
    update: dict[str, Any] = {"count": fails, "last_at": now}
    if fails >= MAX_FAILED:
        update["locked_until"] = now + timedelta(minutes=LOCKOUT_MINUTES)
        update["count"] = 0
    await db.login_attempts.update_one(
        {"identifier": identifier}, {"$set": update}, upsert=True
    )


async def _clear_attempts(identifier: str) -> None:
    await db.login_attempts.delete_one({"identifier": identifier})


@app.post("/api/auth/login")
async def login(payload: LoginIn, request: Request) -> dict:
    email = payload.email.strip().lower()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"

    await _check_lockout(identifier)

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        await _record_failure(identifier)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    await _clear_attempts(identifier)
    token = create_access_token(str(user["_id"]), user["email"], user["role"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user.get("name", ""),
            "role": user["role"],
        },
    }


@app.get("/api/auth/me")
async def me(current_admin: dict = Depends(get_current_admin)) -> dict:
    return current_admin


# ── Admin Routes (require Bearer token + admin role) ─────────────────────────

def _serialize_booking(d: dict) -> dict:
    out = {
        "id": str(d["_id"]),
        "name": d.get("name"),
        "email": d.get("email"),
        "phone": d.get("phone"),
        "dob": d.get("dob"),
        "tob": d.get("tob"),
        "state": d.get("state"),
        "city": d.get("city"),
        "preferred_date": d.get("preferred_date"),
        "preferred_time": d.get("preferred_time"),
        "service": d.get("service"),
        "concern": d.get("concern"),
        "mode": d.get("mode"),
        "message": d.get("message"),
        "coupon": d.get("coupon"),
        "subtotal": d.get("subtotal"),
        "mode_fee": d.get("mode_fee"),
        "total": d.get("total"),
        "status": d.get("status", "pending"),
        "notes": d.get("notes", ""),
        "from_cart": d.get("from_cart", False),
        "cart_items": d.get("cart_items", []),
        "created_at": d["created_at"].isoformat() if isinstance(d.get("created_at"), datetime) else d.get("created_at"),
        "updated_at": d["updated_at"].isoformat() if isinstance(d.get("updated_at"), datetime) else d.get("updated_at"),
    }
    return out


def _build_filter(
    status: Optional[str],
    service: Optional[str],
    date_from: Optional[str],
    date_to: Optional[str],
    search: Optional[str],
) -> dict:
    flt: dict[str, Any] = {}
    if status and status != "all":
        flt["status"] = status
    if service and service != "all":
        flt["service"] = service
    if date_from or date_to:
        rng: dict[str, Any] = {}
        if date_from:
            try:
                rng["$gte"] = datetime.fromisoformat(date_from).replace(tzinfo=timezone.utc)
            except ValueError:
                pass
        if date_to:
            try:
                # Inclusive: end of day
                end = datetime.fromisoformat(date_to).replace(tzinfo=timezone.utc) + timedelta(days=1)
                rng["$lt"] = end
            except ValueError:
                pass
        if rng:
            flt["created_at"] = rng
    if search:
        s = search.strip()
        if s:
            # Case-insensitive substring on name/phone/email
            flt["$or"] = [
                {"name": {"$regex": s, "$options": "i"}},
                {"phone": {"$regex": s, "$options": "i"}},
                {"email": {"$regex": s, "$options": "i"}},
            ]
    return flt


@app.get("/api/admin/bookings")
async def admin_list_bookings(
    current_admin: dict = Depends(get_current_admin),
    status: Optional[str] = Query(default=None),
    service: Optional[str] = Query(default=None),
    date_from: Optional[str] = Query(default=None),
    date_to: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    skip: int = Query(default=0, ge=0),
) -> dict:
    flt = _build_filter(status, service, date_from, date_to, search)
    total = await db.bookings.count_documents(flt)
    cursor = db.bookings.find(flt).sort("created_at", -1).skip(skip).limit(limit)
    items = [_serialize_booking(d) async for d in cursor]

    # Aggregate stats (ignore filters — these reflect the whole DB)
    pipeline = [{"$group": {"_id": "$status", "n": {"$sum": 1}}}]
    by_status = {row["_id"]: row["n"] async for row in db.bookings.aggregate(pipeline)}
    all_total = await db.bookings.count_documents({})

    return {
        "count": total,
        "items": items,
        "stats": {
            "total": all_total,
            "pending": by_status.get("pending", 0),
            "contacted": by_status.get("contacted", 0),
            "confirmed": by_status.get("confirmed", 0),
            "completed": by_status.get("completed", 0),
            "cancelled": by_status.get("cancelled", 0),
        },
    }


@app.get("/api/admin/bookings/export")
async def admin_export_bookings(
    current_admin: dict = Depends(get_current_admin),
    status: Optional[str] = Query(default=None),
    service: Optional[str] = Query(default=None),
    date_from: Optional[str] = Query(default=None),
    date_to: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
) -> StreamingResponse:
    flt = _build_filter(status, service, date_from, date_to, search)
    cursor = db.bookings.find(flt).sort("created_at", -1)

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow([
        "id", "created_at", "status", "name", "phone", "email", "service", "concern",
        "mode", "preferred_date", "preferred_time", "dob", "tob", "state", "city",
        "total", "coupon", "from_cart", "notes", "message",
    ])
    async for d in cursor:
        b = _serialize_booking(d)
        writer.writerow([
            b["id"], b["created_at"] or "", b["status"], b["name"] or "", b["phone"] or "",
            b["email"] or "", b["service"] or "", b["concern"] or "", b["mode"] or "",
            b["preferred_date"] or "", b["preferred_time"] or "", b["dob"] or "",
            b["tob"] or "", b["state"] or "", b["city"] or "", b["total"] if b["total"] is not None else "",
            b["coupon"] or "", "yes" if b["from_cart"] else "no",
            (b["notes"] or "").replace("\n", " "), (b["message"] or "").replace("\n", " "),
        ])

    buf.seek(0)
    ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="bookings_{ts}.csv"'},
    )


@app.get("/api/admin/bookings/{booking_id}")
async def admin_get_booking(
    booking_id: str,
    current_admin: dict = Depends(get_current_admin),
) -> dict:
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking id")
    d = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    if not d:
        raise HTTPException(status_code=404, detail="Booking not found")
    return _serialize_booking(d)


@app.patch("/api/admin/bookings/{booking_id}")
async def admin_update_booking(
    booking_id: str,
    payload: BookingUpdate,
    current_admin: dict = Depends(get_current_admin),
) -> dict:
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking id")

    update: dict[str, Any] = {}
    if payload.status is not None:
        if payload.status not in VALID_STATUSES:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {sorted(VALID_STATUSES)}")
        update["status"] = payload.status
    if payload.notes is not None:
        update["notes"] = payload.notes
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")

    update["updated_at"] = datetime.now(timezone.utc)
    result = await db.bookings.find_one_and_update(
        {"_id": ObjectId(booking_id)},
        {"$set": update},
        return_document=ReturnDocument.AFTER,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Booking not found")
    return _serialize_booking(result)


# ── Legacy public bookings endpoints (kept for backward compat, hidden) ─────

@app.get("/api/bookings/{booking_id}", include_in_schema=False)
async def get_booking(booking_id: str) -> dict:
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking id")
    doc = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Booking not found")
    return _serialize_booking(doc)
