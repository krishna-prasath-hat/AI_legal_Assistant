"""Lawyers API routes - Stub"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

class Lawyer(BaseModel):
    id: str
    name: str
    specialization: List[str]
    experience_years: int
    rating: float
    fee: float

@router.get("/search", response_model=List[Lawyer])
async def search_lawyers(city: str = "Bangalore", case_type: str = "criminal"):
    """Search lawyers"""
    return [
        Lawyer(
            id="law1",
            name="Adv. Rajesh Kumar",
            specialization=["Criminal Law", "Cyber Law"],
            experience_years=15,
            rating=4.5,
            fee=5000.0
        )
    ]
