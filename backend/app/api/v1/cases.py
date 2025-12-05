"""Cases API routes - Stub"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from datetime import datetime

router = APIRouter()

class Case(BaseModel):
    id: str
    title: str
    status: str
    created_at: datetime

@router.get("/", response_model=List[Case])
async def list_cases():
    """List user cases"""
    return []

@router.get("/{case_id}", response_model=Case)
async def get_case(case_id: str):
    """Get case details"""
    return Case(
        id=case_id,
        title="Sample Case",
        status="ongoing",
        created_at=datetime.utcnow()
    )
