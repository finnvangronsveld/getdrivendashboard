from __future__ import annotations

import asyncio
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import certifi
from sqlalchemy import select

from db import AsyncSessionLocal, engine
from models import Base, Ride, Settings, User

ROOT_DIR = Path(__file__).resolve().parents[1]
load_dotenv(ROOT_DIR / ".env")
load_dotenv(Path(__file__).resolve().parent / ".env", override=False)


def _parse_datetime(value: Optional[str]) -> datetime:
    if not value:
        return datetime.now(timezone.utc)
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return datetime.now(timezone.utc)


def _strip_mongo_id(doc: Dict[str, Any]) -> Dict[str, Any]:
    doc.pop("_id", None)
    return doc


async def _ensure_tables() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def _migrate_users(mongo_db) -> None:
    users = await mongo_db.users.find({}, {"_id": 0}).to_list(None)
    if not users:
        return

    async with AsyncSessionLocal() as session:
        for doc in users:
            doc = _strip_mongo_id(doc)
            existing = await session.get(User, doc.get("id"))
            if existing:
                continue
            user = User(
                id=doc.get("id"),
                email=doc.get("email"),
                name=doc.get("name"),
                password_hash=doc.get("password_hash"),
                created_at=_parse_datetime(doc.get("created_at")),
            )
            session.add(user)
        await session.commit()


async def _migrate_settings(mongo_db) -> None:
    settings_docs = await mongo_db.settings.find({}, {"_id": 0}).to_list(None)
    if not settings_docs:
        return

    async with AsyncSessionLocal() as session:
        for doc in settings_docs:
            doc = _strip_mongo_id(doc)
            existing = await session.get(Settings, doc.get("user_id"))
            if existing:
                continue
            settings = Settings(
                user_id=doc.get("user_id"),
                base_rate=doc.get("base_rate", 12.83),
                overtime_multiplier=doc.get("overtime_multiplier", 1.5),
                night_surcharge=doc.get("night_surcharge", 1.46),
                wwv_rate=doc.get("wwv_rate", 0.26),
                social_contribution_pct=doc.get("social_contribution_pct", 2.71),
                normal_hours_threshold=doc.get("normal_hours_threshold", 9.0),
            )
            session.add(settings)
        await session.commit()


async def _migrate_rides(mongo_db) -> None:
    rides = await mongo_db.rides.find({}, {"_id": 0}).to_list(None)
    if not rides:
        return

    async with AsyncSessionLocal() as session:
        for doc in rides:
            doc = _strip_mongo_id(doc)
            existing = await session.get(Ride, doc.get("id"))
            if existing:
                continue
            ride = Ride(
                id=doc.get("id"),
                user_id=doc.get("user_id"),
                date=doc.get("date"),
                client_name=doc.get("client_name"),
                car_brand=doc.get("car_brand"),
                car_model=doc.get("car_model"),
                start_time=doc.get("start_time"),
                end_time=doc.get("end_time"),
                extra_costs=doc.get("extra_costs", 0.0),
                wwv_km=doc.get("wwv_km", 0.0),
                wwv_amount=doc.get("wwv_amount", 0.0),
                notes=doc.get("notes", ""),
                total_hours=doc.get("total_hours", 0.0),
                normal_hours=doc.get("normal_hours", 0.0),
                overtime_hours=doc.get("overtime_hours", 0.0),
                night_hours=doc.get("night_hours", 0.0),
                normal_pay=doc.get("normal_pay", 0.0),
                overtime_pay=doc.get("overtime_pay", 0.0),
                night_pay=doc.get("night_pay", 0.0),
                gross_pay=doc.get("gross_pay", 0.0),
                gross_total=doc.get("gross_total", 0.0),
                social_contribution=doc.get("social_contribution", 0.0),
                net_pay=doc.get("net_pay", 0.0),
                created_at=_parse_datetime(doc.get("created_at")),
            )
            session.add(ride)
        await session.commit()


async def _show_counts() -> None:
    async with AsyncSessionLocal() as session:
        users = (await session.execute(select(User))).scalars().all()
        settings = (await session.execute(select(Settings))).scalars().all()
        rides = (await session.execute(select(Ride))).scalars().all()
        print(f"Users: {len(users)}")
        print(f"Settings: {len(settings)}")
        print(f"Rides: {len(rides)}")


async def main() -> None:
    mongo_url = os.environ.get("MONGO_URL")
    db_name = os.environ.get("DB_NAME")
    if not mongo_url or not db_name:
        raise RuntimeError("MONGO_URL and DB_NAME must be set to migrate data")

    mongo_client = AsyncIOMotorClient(
        mongo_url,
        tls=True,
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=5000,
        socketTimeoutMS=5000,
    )
    mongo_db = mongo_client[db_name]

    await _ensure_tables()
    await _migrate_users(mongo_db)
    await _migrate_settings(mongo_db)
    await _migrate_rides(mongo_db)
    await _show_counts()

    mongo_client.close()


if __name__ == "__main__":
    asyncio.run(main())
