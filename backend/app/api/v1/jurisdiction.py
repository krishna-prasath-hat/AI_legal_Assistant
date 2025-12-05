"""Jurisdiction API routes - Stub"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

class PoliceStation(BaseModel):
    id: str
    name: str
    address: str
    phone: str
    distance_km: float

@router.get("/police-stations", response_model=List[PoliceStation])
async def get_police_stations(lat: float, lng: float):
    """Get nearby police stations"""
    return [
        PoliceStation(
            id="ps1",
            name="Koramangala Police Station",
            address="Koramangala, Bangalore",
            phone="080-25532900",
            distance_km=2.5
        )
    ]
