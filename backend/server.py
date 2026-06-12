from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Annotated, Any, List, Optional

from bson import ObjectId
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, BeforeValidator, ConfigDict, EmailStr, Field

from email_service import send_booking_notifications

load_dotenv()

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="AstroVedicVani API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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

    # Cart-derived (optional; present when booking is initiated from the cart)
    cart_items: List[CartItemIn] = Field(default_factory=list, alias="cartItems")
    subtotal: Optional[int] = None
    mode_fee: Optional[int] = Field(default=None, alias="modeFee")
    total: Optional[int] = None
    from_cart: bool = Field(default=False, alias="fromCart")

    model_config = ConfigDict(populate_by_name=True)


class BookingOut(BaseModel):
    id: PyObjectId = Field(alias="_id")
    name: str
    email: Optional[str] = None
    phone: str
    service: str
    concern: str
    mode: str
    total: Optional[int] = None
    status: str
    created_at: datetime

    model_config = ConfigDict(populate_by_name=True)


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok", "service": "astrovedicvani"}


@app.post("/api/bookings", status_code=201)
async def create_booking(payload: BookingCreate, background_tasks: BackgroundTasks) -> dict:
    doc = payload.model_dump(by_alias=False, exclude_none=False)
    doc["status"] = "pending"
    doc["created_at"] = datetime.now(timezone.utc)

    result = await db.bookings.insert_one(doc)
    booking_id = str(result.inserted_id)

    # Fire-and-forget email notifications (admin + optional customer copy).
    # Safe to call even when SendGrid is not configured — it logs a warning and skips.
    notification_payload = {**doc, "id": booking_id}
    notification_payload.pop("_id", None)
    notification_payload["created_at"] = doc["created_at"].isoformat()
    background_tasks.add_task(send_booking_notifications, notification_payload)

    return {
        "ok": True,
        "id": booking_id,
        "status": "pending",
        "message": "Booking confirmed. Our team will contact you within 2–4 hours.",
    }


@app.get("/api/bookings")
async def list_bookings(limit: int = 50) -> dict:
    limit = max(1, min(limit, 200))
    cursor = db.bookings.find().sort("created_at", -1).limit(limit)
    items: List[dict] = []
    async for d in cursor:
        items.append(
            {
                "id": str(d["_id"]),
                "name": d.get("name"),
                "email": d.get("email"),
                "phone": d.get("phone"),
                "service": d.get("service"),
                "concern": d.get("concern"),
                "mode": d.get("mode"),
                "total": d.get("total"),
                "status": d.get("status", "pending"),
                "from_cart": d.get("from_cart", False),
                "created_at": d["created_at"].isoformat() if d.get("created_at") else None,
            }
        )
    return {"count": len(items), "items": items}


@app.get("/api/bookings/{booking_id}")
async def get_booking(booking_id: str) -> dict:
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking id")
    doc = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Booking not found")
    doc["id"] = str(doc.pop("_id"))
    if isinstance(doc.get("created_at"), datetime):
        doc["created_at"] = doc["created_at"].isoformat()
    return doc
