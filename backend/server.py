from __future__ import annotations

import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import bcrypt
import jwt
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.middleware.cors import CORSMiddleware

from db import engine, get_session
from models import Base, Ride, Settings, User

ROOT_DIR = Path(__file__).resolve().parents[1]
load_dotenv(ROOT_DIR / ".env")
load_dotenv(Path(__file__).resolve().parent / ".env", override=False)

JWT_SECRET = os.environ.get("JWT_SECRET", "get-driven-secret-key-2024")
JWT_ALGORITHM = "HS256"

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


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


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def create_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc).timestamp() + 86400 * 7,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(authorization: Optional[str] = Header(None)):
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


def user_to_dict(user: User) -> dict:
    return {"id": user.id, "email": user.email, "name": user.name}


def settings_to_dict(settings: Settings) -> dict:
    return {
        "base_rate": settings.base_rate,
        "overtime_multiplier": settings.overtime_multiplier,
        "night_surcharge": settings.night_surcharge,
        "wwv_rate": settings.wwv_rate,
        "social_contribution_pct": settings.social_contribution_pct,
        "normal_hours_threshold": settings.normal_hours_threshold,
    }


def ride_to_dict(ride: Ride) -> dict:
    return {
        "id": ride.id,
        "user_id": ride.user_id,
        "date": ride.date,
        "client_name": ride.client_name,
        "car_brand": ride.car_brand,
        "car_model": ride.car_model,
        "start_time": ride.start_time,
        "end_time": ride.end_time,
        "extra_costs": ride.extra_costs,
        "wwv_km": ride.wwv_km,
        "wwv_amount": ride.wwv_amount,
        "notes": ride.notes,
        "total_hours": ride.total_hours,
        "normal_hours": ride.normal_hours,
        "overtime_hours": ride.overtime_hours,
        "night_hours": ride.night_hours,
        "normal_pay": ride.normal_pay,
        "overtime_pay": ride.overtime_pay,
        "night_pay": ride.night_pay,
        "gross_pay": ride.gross_pay,
        "gross_total": ride.gross_total,
        "social_contribution": ride.social_contribution,
        "net_pay": ride.net_pay,
        "created_at": ride.created_at.isoformat() if ride.created_at else None,
    }


def calculate_salary(start_time_str: str, end_time_str: str, date_str: str, settings: dict):
    """Calculate salary for a ride based on Belgian rules."""
    from datetime import datetime as dt, timedelta

    start_dt = dt.fromisoformat(f"{date_str}T{start_time_str}")
    end_dt = dt.fromisoformat(f"{date_str}T{end_time_str}")

    if end_dt <= start_dt:
        end_dt += timedelta(days=1)

    total_minutes = (end_dt - start_dt).total_seconds() / 60
    total_hours = total_minutes / 60

    base_rate = settings.get("base_rate", 12.83)
    overtime_multiplier = settings.get("overtime_multiplier", 1.5)
    night_surcharge = settings.get("night_surcharge", 1.46)
    threshold = settings.get("normal_hours_threshold", 9.0)

    normal_hours = min(total_hours, threshold)
    overtime_hours = max(0, total_hours - threshold)

    normal_pay = normal_hours * base_rate
    overtime_pay = overtime_hours * base_rate * overtime_multiplier

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


@api_router.post("/auth/register")
async def register(input: RegisterInput, session: AsyncSession = Depends(get_session)):
    existing = (await session.execute(select(User).where(User.email == input.email))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email al in gebruik")

    user_id = str(uuid.uuid4())
    user = User(
        id=user_id,
        email=input.email,
        name=input.name,
        password_hash=hash_password(input.password),
        created_at=datetime.now(timezone.utc),
    )

    settings = Settings(user_id=user_id, **DEFAULT_SETTINGS)

    session.add(user)
    await session.flush()
    session.add(settings)
    await session.commit()

    token = create_token(user_id, input.email)
    return {"token": token, "user": user_to_dict(user)}


@api_router.post("/auth/login")
async def login(input: LoginInput, session: AsyncSession = Depends(get_session)):
    user = (await session.execute(select(User).where(User.email == input.email))).scalar_one_or_none()
    if not user or not verify_password(input.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Ongeldige inloggegevens")

    token = create_token(user.id, user.email)
    return {"token": token, "user": user_to_dict(user)}


@api_router.get("/auth/me")
async def get_me(
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    user = await session.get(User, current_user["user_id"])
    if not user:
        raise HTTPException(status_code=404, detail="Gebruiker niet gevonden")
    return user_to_dict(user)


@api_router.post("/rides", status_code=201)
async def create_ride(
    ride: RideInput,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    user_id = current_user["user_id"]

    settings_row = await session.get(Settings, user_id)
    settings = settings_to_dict(settings_row) if settings_row else DEFAULT_SETTINGS

    salary = calculate_salary(ride.start_time, ride.end_time, ride.date, settings)

    wwv_amount = round(ride.wwv_km * settings.get("wwv_rate", 0.26), 2)

    wage_pay = salary["gross_pay"]
    social_pct = settings.get("social_contribution_pct", 2.71) / 100
    social_contribution = round(wage_pay * social_pct, 2)
    gross_total = round(wage_pay + wwv_amount + ride.extra_costs + social_contribution, 2)
    net_pay = round(gross_total - social_contribution, 2)

    ride_doc = Ride(
        id=str(uuid.uuid4()),
        user_id=user_id,
        date=ride.date,
        client_name=ride.client_name,
        car_brand=ride.car_brand,
        car_model=ride.car_model,
        start_time=ride.start_time,
        end_time=ride.end_time,
        extra_costs=ride.extra_costs,
        wwv_km=ride.wwv_km,
        wwv_amount=wwv_amount,
        notes=ride.notes,
        **salary,
        gross_total=gross_total,
        social_contribution=social_contribution,
        net_pay=net_pay,
        created_at=datetime.now(timezone.utc),
    )

    session.add(ride_doc)
    await session.commit()

    return ride_to_dict(ride_doc)


@api_router.get("/rides")
async def get_rides(
    current_user: dict = Depends(get_current_user),
    month: Optional[str] = None,
    session: AsyncSession = Depends(get_session),
):
    query = select(Ride).where(Ride.user_id == current_user["user_id"])
    if month:
        query = query.where(Ride.date.like(f"{month}%"))
    query = query.order_by(Ride.date.desc())
    rides = (await session.execute(query)).scalars().all()
    return [ride_to_dict(r) for r in rides]


@api_router.put("/rides/{ride_id}")
async def update_ride(
    ride_id: str,
    ride: RideInput,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    user_id = current_user["user_id"]

    ride_row = (
        await session.execute(select(Ride).where(Ride.id == ride_id, Ride.user_id == user_id))
    ).scalar_one_or_none()
    if not ride_row:
        raise HTTPException(status_code=404, detail="Rit niet gevonden")

    settings_row = await session.get(Settings, user_id)
    settings = settings_to_dict(settings_row) if settings_row else DEFAULT_SETTINGS

    salary = calculate_salary(ride.start_time, ride.end_time, ride.date, settings)
    wwv_amount = round(ride.wwv_km * settings.get("wwv_rate", 0.26), 2)
    wage_pay = salary["gross_pay"]
    social_pct = settings.get("social_contribution_pct", 2.71) / 100
    social_contribution = round(wage_pay * social_pct, 2)
    gross_total = round(wage_pay + wwv_amount + ride.extra_costs + social_contribution, 2)
    net_pay = round(gross_total - social_contribution, 2)

    ride_row.date = ride.date
    ride_row.client_name = ride.client_name
    ride_row.car_brand = ride.car_brand
    ride_row.car_model = ride.car_model
    ride_row.start_time = ride.start_time
    ride_row.end_time = ride.end_time
    ride_row.extra_costs = ride.extra_costs
    ride_row.wwv_km = ride.wwv_km
    ride_row.wwv_amount = wwv_amount
    ride_row.notes = ride.notes
    ride_row.total_hours = salary["total_hours"]
    ride_row.normal_hours = salary["normal_hours"]
    ride_row.overtime_hours = salary["overtime_hours"]
    ride_row.night_hours = salary["night_hours"]
    ride_row.normal_pay = salary["normal_pay"]
    ride_row.overtime_pay = salary["overtime_pay"]
    ride_row.night_pay = salary["night_pay"]
    ride_row.gross_pay = salary["gross_pay"]
    ride_row.gross_total = gross_total
    ride_row.social_contribution = social_contribution
    ride_row.net_pay = net_pay

    await session.commit()

    return ride_to_dict(ride_row)


@api_router.delete("/rides/{ride_id}")
async def delete_ride(
    ride_id: str,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    ride_row = (
        await session.execute(
            select(Ride).where(Ride.id == ride_id, Ride.user_id == current_user["user_id"])
        )
    ).scalar_one_or_none()
    if not ride_row:
        raise HTTPException(status_code=404, detail="Rit niet gevonden")

    await session.delete(ride_row)
    await session.commit()
    return {"message": "Rit verwijderd"}


@api_router.get("/settings")
async def get_settings(
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    settings_row = await session.get(Settings, current_user["user_id"])
    if not settings_row:
        return DEFAULT_SETTINGS
    return settings_to_dict(settings_row)


@api_router.put("/settings")
async def update_settings(
    input: SettingsInput,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Geen gegevens om bij te werken")

    settings_row = await session.get(Settings, current_user["user_id"])
    if not settings_row:
        merged = {**DEFAULT_SETTINGS, **update_data}
        settings_row = Settings(user_id=current_user["user_id"], **merged)
        session.add(settings_row)
    else:
        for key, value in update_data.items():
            setattr(settings_row, key, value)

    await session.commit()
    return settings_to_dict(settings_row)


@api_router.get("/stats")
async def get_stats(
    current_user: dict = Depends(get_current_user),
    month: Optional[str] = None,
    client_name: Optional[str] = None,
    car_brand: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    session: AsyncSession = Depends(get_session),
):
    user_id = current_user["user_id"]

    query = select(Ride).where(Ride.user_id == user_id)
    if month:
        query = query.where(Ride.date.like(f"{month}%"))
    if client_name:
        query = query.where(Ride.client_name.ilike(f"%{client_name}%"))
    if car_brand:
        query = query.where(Ride.car_brand.ilike(f"%{car_brand}%"))
    if date_from and date_to:
        query = query.where(Ride.date >= date_from, Ride.date <= date_to)
    elif date_from:
        query = query.where(Ride.date >= date_from)
    elif date_to:
        query = query.where(Ride.date <= date_to)

    rides = (await session.execute(query)).scalars().all()
    all_rides = (
        await session.execute(select(Ride).where(Ride.user_id == user_id))
    ).scalars().all()

    rides_list = [ride_to_dict(r) for r in rides]
    all_rides_list = [ride_to_dict(r) for r in all_rides]

    def get_gross_total(r):
        if r.get("gross_total") is not None:
            return r["gross_total"]
        wage = r.get("gross_pay", 0)
        wwv = r.get("wwv_amount", 0)
        extra = r.get("extra_costs", 0)
        social = r.get("social_contribution", 0)
        return wage + wwv + extra + social

    empty_response = {
        "total_rides": 0,
        "total_hours": 0,
        "total_gross": 0,
        "total_net": 0,
        "total_wwv": 0,
        "total_overtime_hours": 0,
        "total_night_hours": 0,
        "total_social": 0,
        "total_extra_costs": 0,
        "avg_per_ride": 0,
        "avg_per_hour": 0,
        "monthly_earnings": [],
        "weekly_earnings": [],
        "car_stats": [],
        "client_stats": [],
        "brand_stats": [],
        "hourly_distribution": [],
        "day_of_week_stats": [],
        "recent_rides": [],
        "available_months": [],
        "available_clients": [],
        "available_brands": [],
    }

    if not rides_list:
        if all_rides_list:
            empty_response["available_months"] = sorted(
                {r["date"][:7] for r in all_rides_list}, reverse=True
            )
            empty_response["available_clients"] = sorted({r["client_name"] for r in all_rides_list})
            empty_response["available_brands"] = sorted({r["car_brand"] for r in all_rides_list})
        return empty_response

    total_rides = len(rides_list)
    total_hours = sum(r.get("total_hours", 0) for r in rides_list)
    total_gross = sum(get_gross_total(r) for r in rides_list)
    total_net = sum(r.get("net_pay", 0) for r in rides_list)
    total_wwv = sum(r.get("wwv_amount", 0) for r in rides_list)
    total_overtime = sum(r.get("overtime_hours", 0) for r in rides_list)
    total_night = sum(r.get("night_hours", 0) for r in rides_list)
    total_social = sum(r.get("social_contribution", 0) for r in rides_list)
    total_extra = sum(r.get("extra_costs", 0) for r in rides_list)
    avg_per_ride = total_net / total_rides if total_rides > 0 else 0
    avg_per_hour = total_net / total_hours if total_hours > 0 else 0

    monthly = {}
    for r in rides_list:
        mk = r["date"][:7]
        if mk not in monthly:
            monthly[mk] = {
                "month": mk,
                "gross": 0,
                "net": 0,
                "rides": 0,
                "hours": 0,
                "overtime": 0,
                "night": 0,
            }
        monthly[mk]["gross"] += get_gross_total(r)
        monthly[mk]["net"] += r.get("net_pay", 0)
        monthly[mk]["rides"] += 1
        monthly[mk]["hours"] += r.get("total_hours", 0)
        monthly[mk]["overtime"] += r.get("overtime_hours", 0)
        monthly[mk]["night"] += r.get("night_hours", 0)
    monthly_earnings = sorted(monthly.values(), key=lambda x: x["month"])
    for m in monthly_earnings:
        for k in ["gross", "net", "hours", "overtime", "night"]:
            m[k] = round(m[k], 2)

    from datetime import datetime as dt

    weekly = {}
    for r in rides_list:
        d = dt.fromisoformat(r["date"])
        wk = d.strftime("%Y-W%W")
        if wk not in weekly:
            weekly[wk] = {"week": wk, "net": 0, "rides": 0, "hours": 0}
        weekly[wk]["net"] += r.get("net_pay", 0)
        weekly[wk]["rides"] += 1
        weekly[wk]["hours"] += r.get("total_hours", 0)
    weekly_earnings = sorted(weekly.values(), key=lambda x: x["week"])[-12:]
    for w in weekly_earnings:
        w["net"] = round(w["net"], 2)
        w["hours"] = round(w["hours"], 2)

    cars = {}
    for r in rides_list:
        car_key = f"{r['car_brand']} {r['car_model']}"
        if car_key not in cars:
            cars[car_key] = {
                "car": car_key,
                "brand": r["car_brand"],
                "rides": 0,
                "hours": 0,
                "earnings": 0,
            }
        cars[car_key]["rides"] += 1
        cars[car_key]["hours"] += r.get("total_hours", 0)
        cars[car_key]["earnings"] += r.get("net_pay", 0)
    car_stats = sorted(cars.values(), key=lambda x: x["rides"], reverse=True)
    for c in car_stats:
        c["hours"] = round(c["hours"], 2)
        c["earnings"] = round(c["earnings"], 2)

    brands = {}
    for r in rides_list:
        b = r["car_brand"]
        if b not in brands:
            brands[b] = {"brand": b, "rides": 0, "hours": 0, "earnings": 0}
        brands[b]["rides"] += 1
        brands[b]["hours"] += r.get("total_hours", 0)
        brands[b]["earnings"] += r.get("net_pay", 0)
    brand_stats = sorted(brands.values(), key=lambda x: x["rides"], reverse=True)
    for b in brand_stats:
        b["hours"] = round(b["hours"], 2)
        b["earnings"] = round(b["earnings"], 2)

    clients = {}
    for r in rides_list:
        cl = r["client_name"]
        if cl not in clients:
            clients[cl] = {"client": cl, "rides": 0, "earnings": 0, "hours": 0}
        clients[cl]["rides"] += 1
        clients[cl]["earnings"] += r.get("net_pay", 0)
        clients[cl]["hours"] += r.get("total_hours", 0)
    client_stats = sorted(clients.values(), key=lambda x: x["earnings"], reverse=True)
    for c in client_stats:
        c["earnings"] = round(c["earnings"], 2)
        c["hours"] = round(c["hours"], 2)

    hourly = {str(h).zfill(2): 0 for h in range(24)}
    for r in rides_list:
        try:
            sh = int(r["start_time"].split(":")[0])
            eh = int(r["end_time"].split(":")[0])
            if eh <= sh:
                eh += 24
            for h in range(sh, eh):
                hourly[str(h % 24).zfill(2)] += 1
        except (ValueError, IndexError):
            pass
    hourly_distribution = [{"hour": h, "count": c} for h, c in sorted(hourly.items())]

    day_names = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"]
    dow = {i: {"day": day_names[i], "rides": 0, "hours": 0, "earnings": 0} for i in range(7)}
    for r in rides_list:
        try:
            d = dt.fromisoformat(r["date"])
            di = d.weekday()
            dow[di]["rides"] += 1
            dow[di]["hours"] += r.get("total_hours", 0)
            dow[di]["earnings"] += r.get("net_pay", 0)
        except (ValueError, IndexError):
            pass
    day_of_week_stats = [dow[i] for i in range(7)]
    for d in day_of_week_stats:
        d["hours"] = round(d["hours"], 2)
        d["earnings"] = round(d["earnings"], 2)

    recent_rides = sorted(rides_list, key=lambda x: x["date"], reverse=True)[:5]

    available_months = sorted({r["date"][:7] for r in all_rides_list}, reverse=True)
    available_clients = sorted({r["client_name"] for r in all_rides_list})
    available_brands = sorted({r["car_brand"] for r in all_rides_list})

    return {
        "total_rides": total_rides,
        "total_hours": round(total_hours, 2),
        "total_gross": round(total_gross, 2),
        "total_net": round(total_net, 2),
        "total_wwv": round(total_wwv, 2),
        "total_overtime_hours": round(total_overtime, 2),
        "total_night_hours": round(total_night, 2),
        "total_social": round(total_social, 2),
        "total_extra_costs": round(total_extra, 2),
        "avg_per_ride": round(avg_per_ride, 2),
        "avg_per_hour": round(avg_per_hour, 2),
        "monthly_earnings": monthly_earnings,
        "weekly_earnings": weekly_earnings,
        "car_stats": car_stats,
        "brand_stats": brand_stats,
        "client_stats": client_stats,
        "hourly_distribution": hourly_distribution,
        "day_of_week_stats": day_of_week_stats,
        "recent_rides": recent_rides,
        "available_months": available_months,
        "available_clients": available_clients,
        "available_brands": available_brands,
    }


@api_router.get("/health")
async def health():
    return {"status": "ok"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.on_event("shutdown")
async def shutdown_db_client():
    await engine.dispose()
