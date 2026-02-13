from __future__ import annotations

from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Index, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class Settings(Base):
    __tablename__ = "settings"

    user_id = Column(String, ForeignKey("users.id"), primary_key=True)
    base_rate = Column(Float, nullable=False)
    overtime_multiplier = Column(Float, nullable=False)
    night_surcharge = Column(Float, nullable=False)
    wwv_rate = Column(Float, nullable=False)
    social_contribution_pct = Column(Float, nullable=False)
    normal_hours_threshold = Column(Float, nullable=False)


class Ride(Base):
    __tablename__ = "rides"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    date = Column(String, index=True, nullable=False)
    client_name = Column(String, nullable=False)
    car_brand = Column(String, nullable=False)
    car_model = Column(String, nullable=False)
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=False)
    extra_costs = Column(Float, default=0.0)
    wwv_km = Column(Float, default=0.0)
    wwv_amount = Column(Float, default=0.0)
    notes = Column(String, default="")
    total_hours = Column(Float, default=0.0)
    normal_hours = Column(Float, default=0.0)
    overtime_hours = Column(Float, default=0.0)
    night_hours = Column(Float, default=0.0)
    normal_pay = Column(Float, default=0.0)
    overtime_pay = Column(Float, default=0.0)
    night_pay = Column(Float, default=0.0)
    gross_pay = Column(Float, default=0.0)
    gross_total = Column(Float, default=0.0)
    social_contribution = Column(Float, default=0.0)
    net_pay = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


Index("ix_rides_user_date", Ride.user_id, Ride.date)
