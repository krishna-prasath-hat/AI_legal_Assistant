"""Reporting API routes - Stub"""
from fastapi import APIRouter
from typing import List
from pydantic import BaseModel

router = APIRouter()

class Helpline(BaseModel):
    name: str
    number: str
    description: str

@router.get("/helplines", response_model=List[Helpline])
async def get_helplines():
    """Get helpline numbers"""
    return [
        Helpline(
            name="Women Helpline",
            number="1091",
            description="24x7 helpline for women in distress"
        ),
        Helpline(
            name="Cybercrime Helpline",
            number="1930",
            description="National cybercrime helpline"
        )
    ]
