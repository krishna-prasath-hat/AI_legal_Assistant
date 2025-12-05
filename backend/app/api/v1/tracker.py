"""Tracker API routes - Stub"""
from fastapi import APIRouter

router = APIRouter()

@router.get("/fir-status")
async def get_fir_status(fir_number: str):
    """Get FIR status"""
    return {"status": "under_investigation", "fir_number": fir_number}
