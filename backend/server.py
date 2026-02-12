from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'get-driven-secret-key-2024')
JWT_ALGORITHM = "HS256"

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ─── Models ───

class RegisterInput(BaseModel):
    email: str
    password: str
    name: str

class LoginInput(BaseModel):
    email: str
    password: str

class RideInput(BaseModel):
    date: str
    client_name: str
    car_brand: str
    car_model: str
    start_time: str
    end_time: str
    extra_costs: float = 0.0
    wwv_km: float = 0.0
    notes: Optional[str] = ""

class SettingsInput(BaseModel):
    base_rate: Optional[float] = None
    overtime_multiplier: Optional[float] = None
    night_surcharge: Optional[float] = None
    wwv_rate: Optional[float] = None
    social_contribution_pct: Optional[float] = None
    normal_hours_threshold: Optional[float] = None

DEFAULT_SETTINGS = {
    "base_rate": 12.83,
    "overtime_multiplier": 1.5,
    "night_surcharge": 1.46,
    "wwv_rate": 0.26,
    "social_contribution_pct": 2.71,
    "normal_hours_threshold": 9.0,
}

# ─── Auth Helpers ───

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc).timestamp() + 86400 * 7
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(authorization: str = None):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ─── Salary Calculation ───

def calculate_salary(start_time_str: str, end_time_str: str, date_str: str, settings: dict):
    """Calculate salary for a ride based on Belgian rules."""
    from datetime import datetime as dt, timedelta

    start_dt = dt.fromisoformat(f"{date_str}T{start_time_str}")
    end_dt = dt.fromisoformat(f"{date_str}T{end_time_str}")

    # Handle overnight shifts
    if end_dt <= start_dt:
        end_dt += timedelta(days=1)

    total_minutes = (end_dt - start_dt).total_seconds() / 60
    total_hours = total_minutes / 60

    base_rate = settings.get("base_rate", 12.83)
    overtime_multiplier = settings.get("overtime_multiplier", 1.5)
    night_surcharge = settings.get("night_surcharge", 1.46)
    threshold = settings.get("normal_hours_threshold", 9.0)

    # Calculate normal and overtime hours
    normal_hours = min(total_hours, threshold)
    overtime_hours = max(0, total_hours - threshold)

    normal_pay = normal_hours * base_rate
    overtime_pay = overtime_hours * base_rate * overtime_multiplier

    # Calculate night hours (20:00-06:00)
    night_minutes = 0
    current = start_dt
    while current < end_dt:
        hour = current.hour
        if hour >= 20 or hour < 6:
            night_minutes += 1
        current += timedelta(minutes=1)

    night_hours = night_minutes / 60
    night_pay = night_hours * night_surcharge

    gross_pay = normal_pay + overtime_pay + night_pay

    return {
        "total_hours": round(total_hours, 2),
        "normal_hours": round(normal_hours, 2),
        "overtime_hours": round(overtime_hours, 2),
        "night_hours": round(night_hours, 2),
        "normal_pay": round(normal_pay, 2),
        "overtime_pay": round(overtime_pay, 2),
        "night_pay": round(night_pay, 2),
        "gross_pay": round(gross_pay, 2),
    }

# ─── Auth Routes ───

@api_router.post("/auth/register")
async def register(input: RegisterInput):
    existing = await db.users.find_one({"email": input.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email al in gebruik")

    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": input.email,
        "name": input.name,
        "password_hash": hash_password(input.password),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user_doc)

    # Create default settings
    settings_doc = {**DEFAULT_SETTINGS, "user_id": user_id}
    await db.settings.insert_one(settings_doc)

    token = create_token(user_id, input.email)
    return {"token": token, "user": {"id": user_id, "email": input.email, "name": input.name}}

@api_router.post("/auth/login")
async def login(input: LoginInput):
    user = await db.users.find_one({"email": input.email}, {"_id": 0})
    if not user or not verify_password(input.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Ongeldige inloggegevens")

    token = create_token(user["id"], user["email"])
    return {"token": token, "user": {"id": user["id"], "email": user["email"], "name": user["name"]}}

@api_router.get("/auth/me")
async def get_me(authorization: str = None):
    payload = await get_current_user(authorization)
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Gebruiker niet gevonden")
    return user

# ─── Rides Routes ───

@api_router.post("/rides")
async def create_ride(ride: RideInput, authorization: str = None):
    payload = await get_current_user(authorization)
    user_id = payload["user_id"]

    # Get user settings
    settings = await db.settings.find_one({"user_id": user_id}, {"_id": 0})
    if not settings:
        settings = DEFAULT_SETTINGS

    # Calculate salary
    salary = calculate_salary(ride.start_time, ride.end_time, ride.date, settings)

    # WWV reimbursement
    wwv_amount = round(ride.wwv_km * settings.get("wwv_rate", 0.26), 2)

    # Social contribution
    social_pct = settings.get("social_contribution_pct", 2.71) / 100
    social_contribution = round(salary["gross_pay"] * social_pct, 2)
    net_pay = round(salary["gross_pay"] - social_contribution + wwv_amount + ride.extra_costs, 2)

    ride_id = str(uuid.uuid4())
    ride_doc = {
        "id": ride_id,
        "user_id": user_id,
        "date": ride.date,
        "client_name": ride.client_name,
        "car_brand": ride.car_brand,
        "car_model": ride.car_model,
        "start_time": ride.start_time,
        "end_time": ride.end_time,
        "extra_costs": ride.extra_costs,
        "wwv_km": ride.wwv_km,
        "wwv_amount": wwv_amount,
        "notes": ride.notes,
        **salary,
        "social_contribution": social_contribution,
        "net_pay": net_pay,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.rides.insert_one(ride_doc)
    # Return without _id
    ride_doc.pop("_id", None)
    return ride_doc

@api_router.get("/rides")
async def get_rides(authorization: str = None, month: Optional[str] = None):
    payload = await get_current_user(authorization)
    query = {"user_id": payload["user_id"]}
    if month:
        query["date"] = {"$regex": f"^{month}"}
    rides = await db.rides.find(query, {"_id": 0}).sort("date", -1).to_list(1000)
    return rides

@api_router.put("/rides/{ride_id}")
async def update_ride(ride_id: str, ride: RideInput, authorization: str = None):
    payload = await get_current_user(authorization)
    user_id = payload["user_id"]

    existing = await db.rides.find_one({"id": ride_id, "user_id": user_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Rit niet gevonden")

    settings = await db.settings.find_one({"user_id": user_id}, {"_id": 0})
    if not settings:
        settings = DEFAULT_SETTINGS

    salary = calculate_salary(ride.start_time, ride.end_time, ride.date, settings)
    wwv_amount = round(ride.wwv_km * settings.get("wwv_rate", 0.26), 2)
    social_pct = settings.get("social_contribution_pct", 2.71) / 100
    social_contribution = round(salary["gross_pay"] * social_pct, 2)
    net_pay = round(salary["gross_pay"] - social_contribution + wwv_amount + ride.extra_costs, 2)

    update_doc = {
        "date": ride.date,
        "client_name": ride.client_name,
        "car_brand": ride.car_brand,
        "car_model": ride.car_model,
        "start_time": ride.start_time,
        "end_time": ride.end_time,
        "extra_costs": ride.extra_costs,
        "wwv_km": ride.wwv_km,
        "wwv_amount": wwv_amount,
        "notes": ride.notes,
        **salary,
        "social_contribution": social_contribution,
        "net_pay": net_pay,
    }

    await db.rides.update_one({"id": ride_id, "user_id": user_id}, {"$set": update_doc})
    updated = await db.rides.find_one({"id": ride_id}, {"_id": 0})
    return updated

@api_router.delete("/rides/{ride_id}")
async def delete_ride(ride_id: str, authorization: str = None):
    payload = await get_current_user(authorization)
    result = await db.rides.delete_one({"id": ride_id, "user_id": payload["user_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Rit niet gevonden")
    return {"message": "Rit verwijderd"}

# ─── Settings Routes ───

@api_router.get("/settings")
async def get_settings(authorization: str = None):
    payload = await get_current_user(authorization)
    settings = await db.settings.find_one({"user_id": payload["user_id"]}, {"_id": 0, "user_id": 0})
    if not settings:
        return DEFAULT_SETTINGS
    settings.pop("user_id", None)
    return settings

@api_router.put("/settings")
async def update_settings(input: SettingsInput, authorization: str = None):
    payload = await get_current_user(authorization)
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Geen gegevens om bij te werken")

    await db.settings.update_one(
        {"user_id": payload["user_id"]},
        {"$set": update_data},
        upsert=True
    )
    settings = await db.settings.find_one({"user_id": payload["user_id"]}, {"_id": 0, "user_id": 0})
    return settings

# ─── Stats Route ───

@api_router.get("/stats")
async def get_stats(authorization: str = None):
    payload = await get_current_user(authorization)
    user_id = payload["user_id"]

    rides = await db.rides.find({"user_id": user_id}, {"_id": 0}).to_list(5000)

    if not rides:
        return {
            "total_rides": 0,
            "total_hours": 0,
            "total_gross": 0,
            "total_net": 0,
            "total_wwv": 0,
            "monthly_earnings": [],
            "car_stats": [],
            "client_stats": [],
            "recent_rides": [],
        }

    total_rides = len(rides)
    total_hours = sum(r.get("total_hours", 0) for r in rides)
    total_gross = sum(r.get("gross_pay", 0) for r in rides)
    total_net = sum(r.get("net_pay", 0) for r in rides)
    total_wwv = sum(r.get("wwv_amount", 0) for r in rides)

    # Monthly earnings
    monthly = {}
    for r in rides:
        month_key = r["date"][:7]
        if month_key not in monthly:
            monthly[month_key] = {"month": month_key, "gross": 0, "net": 0, "rides": 0, "hours": 0}
        monthly[month_key]["gross"] += r.get("gross_pay", 0)
        monthly[month_key]["net"] += r.get("net_pay", 0)
        monthly[month_key]["rides"] += 1
        monthly[month_key]["hours"] += r.get("total_hours", 0)

    monthly_earnings = sorted(monthly.values(), key=lambda x: x["month"])
    for m in monthly_earnings:
        m["gross"] = round(m["gross"], 2)
        m["net"] = round(m["net"], 2)
        m["hours"] = round(m["hours"], 2)

    # Car stats
    cars = {}
    for r in rides:
        car_key = f"{r['car_brand']} {r['car_model']}"
        if car_key not in cars:
            cars[car_key] = {"car": car_key, "rides": 0, "hours": 0}
        cars[car_key]["rides"] += 1
        cars[car_key]["hours"] += r.get("total_hours", 0)

    car_stats = sorted(cars.values(), key=lambda x: x["rides"], reverse=True)
    for c in car_stats:
        c["hours"] = round(c["hours"], 2)

    # Client stats
    clients = {}
    for r in rides:
        cl = r["client_name"]
        if cl not in clients:
            clients[cl] = {"client": cl, "rides": 0, "earnings": 0}
        clients[cl]["rides"] += 1
        clients[cl]["earnings"] += r.get("net_pay", 0)

    client_stats = sorted(clients.values(), key=lambda x: x["rides"], reverse=True)
    for c in client_stats:
        c["earnings"] = round(c["earnings"], 2)

    recent_rides = sorted(rides, key=lambda x: x["date"], reverse=True)[:5]

    return {
        "total_rides": total_rides,
        "total_hours": round(total_hours, 2),
        "total_gross": round(total_gross, 2),
        "total_net": round(total_net, 2),
        "total_wwv": round(total_wwv, 2),
        "monthly_earnings": monthly_earnings,
        "car_stats": car_stats,
        "client_stats": client_stats,
        "recent_rides": recent_rides,
    }

# ─── Health ───

@api_router.get("/health")
async def health():
    return {"status": "ok"}

# Include router & middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
