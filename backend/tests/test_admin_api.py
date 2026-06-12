"""Backend tests for AstroVedicVani admin dashboard and auth endpoints."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://67428743-fd50-462c-8127-eb7d41d1f21f.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@astrovedicvani.com"
ADMIN_PASSWORD = "Nrp@1912"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data
    return data["access_token"]


@pytest.fixture(scope="module")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# ── Health ──
def test_health(session):
    r = session.get(f"{API}/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


# ── Auth ──
def test_login_success(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200
    d = r.json()
    assert d["token_type"] == "bearer"
    assert d["user"]["email"] == ADMIN_EMAIL
    assert d["user"]["role"] == "admin"
    assert isinstance(d["access_token"], str) and len(d["access_token"]) > 20


def test_login_wrong_password(session):
    # Use a unique email so we don't trigger brute-force on the real admin
    r = session.post(f"{API}/auth/login", json={"email": "noone-xyz@astrovedicvani.com", "password": "WrongPass!"})
    assert r.status_code == 401


def test_me_no_token(session):
    r = requests.get(f"{API}/auth/me")
    assert r.status_code == 401


def test_me_with_token(auth_headers):
    r = requests.get(f"{API}/auth/me", headers=auth_headers)
    assert r.status_code == 200
    d = r.json()
    assert d["email"] == ADMIN_EMAIL
    assert d["role"] == "admin"


def test_me_bad_token():
    r = requests.get(f"{API}/auth/me", headers={"Authorization": "Bearer not.a.real.jwt"})
    assert r.status_code == 401


# ── Admin endpoints require Bearer ──
def test_admin_bookings_no_auth():
    r = requests.get(f"{API}/admin/bookings")
    assert r.status_code == 401


def test_admin_export_no_auth():
    r = requests.get(f"{API}/admin/bookings/export")
    assert r.status_code == 401


# ── Public booking creation still works ──
def test_create_public_booking(session):
    payload = {
        "name": "TEST_QA User",
        "phone": "9000000001",
        "email": "qa-test@example.com",
        "service": "Consultation",
        "concern": "Career",
        "mode": "online",
    }
    r = session.post(f"{API}/bookings", json=payload)
    assert r.status_code == 201, r.text
    d = r.json()
    assert d["ok"] is True
    assert d["status"] == "pending"
    assert "id" in d
    pytest.created_booking_id = d["id"]


# ── List + filters + stats ──
def test_admin_list_bookings(auth_headers):
    r = requests.get(f"{API}/admin/bookings", headers=auth_headers)
    assert r.status_code == 200
    d = r.json()
    assert "count" in d and "items" in d and "stats" in d
    stats = d["stats"]
    for k in ("total", "pending", "contacted", "confirmed", "completed", "cancelled"):
        assert k in stats
    assert isinstance(d["items"], list)
    assert d["stats"]["total"] >= 1  # at least the booking we created


def test_admin_list_search_filter(auth_headers):
    r = requests.get(f"{API}/admin/bookings", headers=auth_headers, params={"search": "9000000001"})
    assert r.status_code == 200
    items = r.json()["items"]
    assert any(it["phone"] == "9000000001" for it in items)


def test_admin_list_status_filter(auth_headers):
    r = requests.get(f"{API}/admin/bookings", headers=auth_headers, params={"status": "pending"})
    assert r.status_code == 200
    for it in r.json()["items"]:
        assert it["status"] == "pending"


# ── Detail ──
def test_admin_get_booking_detail(auth_headers):
    bid = getattr(pytest, "created_booking_id", None)
    assert bid, "no created booking id from previous test"
    r = requests.get(f"{API}/admin/bookings/{bid}", headers=auth_headers)
    assert r.status_code == 200
    d = r.json()
    assert d["id"] == bid
    assert d["name"] == "TEST_QA User"
    assert d["phone"] == "9000000001"
    assert "cart_items" in d and "notes" in d


def test_admin_get_booking_invalid_id(auth_headers):
    r = requests.get(f"{API}/admin/bookings/not-an-id", headers=auth_headers)
    assert r.status_code == 400


def test_admin_get_booking_not_found(auth_headers):
    r = requests.get(f"{API}/admin/bookings/507f1f77bcf86cd799439011", headers=auth_headers)
    assert r.status_code == 404


# ── Update status + notes ──
def test_admin_update_status(auth_headers):
    bid = pytest.created_booking_id
    r = requests.patch(f"{API}/admin/bookings/{bid}", headers=auth_headers, json={"status": "contacted"})
    assert r.status_code == 200
    assert r.json()["status"] == "contacted"
    # Verify persistence via GET
    g = requests.get(f"{API}/admin/bookings/{bid}", headers=auth_headers)
    assert g.json()["status"] == "contacted"


def test_admin_update_invalid_status(auth_headers):
    bid = pytest.created_booking_id
    r = requests.patch(f"{API}/admin/bookings/{bid}", headers=auth_headers, json={"status": "bogus"})
    assert r.status_code == 400


def test_admin_update_notes(auth_headers):
    bid = pytest.created_booking_id
    r = requests.patch(f"{API}/admin/bookings/{bid}", headers=auth_headers, json={"notes": "Called customer at 10am"})
    assert r.status_code == 200
    assert r.json()["notes"] == "Called customer at 10am"
    g = requests.get(f"{API}/admin/bookings/{bid}", headers=auth_headers)
    assert g.json()["notes"] == "Called customer at 10am"


# ── CSV export ──
def test_admin_export_csv(auth_headers):
    r = requests.get(f"{API}/admin/bookings/export", headers=auth_headers)
    assert r.status_code == 200
    assert "text/csv" in r.headers.get("content-type", "")
    cd = r.headers.get("content-disposition", "")
    assert "attachment" in cd and ".csv" in cd
    body = r.text
    first_line = body.split("\n", 1)[0]
    assert "id" in first_line and "status" in first_line and "phone" in first_line


# ── Brute force: trigger 429 ──
def test_brute_force_lockout():
    # Use a unique email-like identifier so we don't lock out the real admin
    bad_email = f"bruteforce-{int(time.time())}@example.com"
    last_status = None
    for _ in range(7):
        r = requests.post(f"{API}/auth/login", json={"email": bad_email, "password": "wrong"})
        last_status = r.status_code
        if last_status == 429:
            break
    assert last_status == 429, f"Expected 429 after repeated failures, got {last_status}"


# ── Cleanup ──
def test_cleanup(auth_headers):
    """Mark the test booking as cancelled so production listings stay clean."""
    bid = getattr(pytest, "created_booking_id", None)
    if not bid:
        return
    requests.patch(f"{API}/admin/bookings/{bid}", headers=auth_headers, json={"status": "cancelled", "notes": "TEST cleanup"})
