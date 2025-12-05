"""
BCI Rule 36 COMPLIANT Lawyer Directory API

This module provides a neutral, factual lawyer directory with NO:
- Ratings or rankings
- Win rates or success statistics
- Fee information
- Promotional content
- Recommendations or "best match" logic

ONLY alphabetical sorting and user-driven filtering is allowed.
"""

from fastapi import APIRouter, Query, HTTPException, Depends
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import date, datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from app.database import get_db

router = APIRouter()

# ============================================================================
# COMPLIANCE CONSTANTS
# ============================================================================

MANDATORY_DISCLAIMER = """
DISCLAIMER: This is a factual directory of advocates based on publicly 
available information and user submissions. No endorsement, ranking, or 
recommendation is implied. This information does not constitute legal 
advice or solicitation. Users are advised to verify credentials 
independently through the respective State Bar Council.
"""

PROHIBITED_FIELDS = [
    'rating', 'win_rate', 'success_rate', 'cases_won', 'cases_lost',
    'total_cases', 'fee', 'consultation_fee', 'ranking_score',
    'popularity', 'reviews', 'testimonials'
]

# ============================================================================
# PYDANTIC MODELS (BCI COMPLIANT)
# ============================================================================

class LawyerProfileResponse(BaseModel):
    """
    BCI Rule 36 Compliant Lawyer Profile
    Contains ONLY factual, verifiable information
    """
    id: int
    
    # ✅ ALLOWED: Basic Identification
    full_name: str
    enrollment_number: Optional[str] = None
    bar_council_state: Optional[str] = None
    enrollment_date: Optional[datetime] = None
    
    # ✅ ALLOWED: Contact Information
    email: Optional[str] = None
    phone: Optional[str] = None
    office_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    
    # ✅ ALLOWED: Professional Information (Factual Only)
    practice_areas: List[str] = []
    courts_practicing_in: Optional[str] = None
    languages_known: List[str] = ["English"]
    
    # ✅ ALLOWED: Academic Qualifications
    law_degree: Optional[str] = None
    law_school: Optional[str] = None
    
    # Profile Status
    profile_verified: bool = False
    profile_claimed: bool = False
    
    profile_verified: bool = False
    profile_claimed: bool = False

    # Location for Map (Mock or Real)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    # Validator to convert comma-separated strings to lists
    @field_validator('practice_areas', 'languages_known', mode='before')
    @classmethod
    def parse_comma_separated_list(cls, v):
        if isinstance(v, str):
            return [item.strip() for item in v.split(',') if item.strip()]
        return v or []

    class Config:
        from_attributes = True


class LawyerDirectoryResponse(BaseModel):
    """Response model for lawyer directory listing"""
    lawyers: List[LawyerProfileResponse]
    total: int
    page: int
    pages: int
    disclaimer: str = MANDATORY_DISCLAIMER
    
    class Config:
        from_attributes = True


class LawyerProfileClaimRequest(BaseModel):
    """Request to claim a lawyer profile"""
    enrollment_number: str = Field(..., min_length=5, max_length=100)
    email: str = Field(..., pattern=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    phone: Optional[str] = None


class PracticeAreaResponse(BaseModel):
    """Standardized practice areas"""
    practice_areas: List[str]


# ============================================================================
# API ENDPOINTS (BCI COMPLIANT)
# ============================================================================

@router.get("/directory", response_model=LawyerDirectoryResponse)
async def get_lawyer_directory(
    city: Optional[str] = Query(None, description="Filter by city"),
    state: Optional[str] = Query(None, description="Filter by state"),
    practice_area: Optional[str] = Query(None, description="Filter by practice area"),
    language: Optional[str] = Query(None, description="Filter by language"),
    gender: Optional[str] = Query(None, description="Filter by gender"),
    verified_only: bool = Query(False, description="Show only verified profiles"),
    user_lat: Optional[float] = Query(None, description="User latitude for nearby search"),
    user_lng: Optional[float] = Query(None, description="User longitude for nearby search"),
    sort: str = Query("name_asc", pattern="^(name_asc|name_desc|distance)$", description="Sort order"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=50, description="Results per page"),
    db: Session = Depends(get_db)
):
    """
    Get lawyer directory with neutral, factual listings.
    """
    
    from app.models import LawyerProfile
    
    # Build filter conditions
    filters = [LawyerProfile.is_active == True]
    
    if city:
        filters.append(LawyerProfile.city.ilike(f"%{city}%"))
    
    if state:
        filters.append(LawyerProfile.state.ilike(f"%{state}%"))
    
    if practice_area:
        # Use ilike for text search in comma-separated string
        filters.append(LawyerProfile.practice_areas.ilike(f"%{practice_area}%"))
    
    if language:
        # Use ilike for text search in comma-separated string
        filters.append(LawyerProfile.languages_known.ilike(f"%{language}%"))
    
    if gender:
        filters.append(func.lower(LawyerProfile.gender) == func.lower(gender))
    
    if verified_only:
        filters.append(LawyerProfile.profile_verified == True)
    
    # Base query with filters
    query = db.query(LawyerProfile).filter(and_(*filters))
    
    # ✅ COMPLIANCE: Alphabetical sorting ONLY
    if sort == "name_desc":
        query = query.order_by(func.lower(LawyerProfile.full_name).desc())
    else:  # default: name_asc
        query = query.order_by(func.lower(LawyerProfile.full_name).asc())
    
    # Get total count
    total = query.count()
    
    # Pagination
    offset = (page - 1) * limit
    lawyers = query.offset(offset).limit(limit).all()
    
    # Calculate total pages
    pages = (total + limit - 1) // limit
    
    # Convert to response models
    # Convert to response models
    import random
    
    # City Center Coords (Approx)
    CITY_CENTERS = {
        "bangalore": (12.9716, 77.5946),
        "bengaluru": (12.9716, 77.5946),
        "mumbai": (19.0760, 72.8777),
        "delhi": (28.7041, 77.1025),
        "new delhi": (28.6139, 77.2090),
        "chennai": (13.0827, 80.2707),
        "kolkata": (22.5726, 88.3639),
        "hyderabad": (17.3850, 78.4867),
        "pune": (18.5204, 73.8567),
        "ahmedabad": (23.0225, 72.5714),
        "jaipur": (26.9124, 75.7873),
        "surat": (21.1702, 72.8311),
        "lucknow": (26.8467, 80.9462),
        "kanpur": (26.4499, 80.3319)
    }

    lawyer_responses = []
    for lawyer in lawyers:
        resp = LawyerProfileResponse.from_orm(lawyer)
        
        # Generate Mock Coords for Map Integration
        # Use user_lat/lng if provided to put them nearby, otherwise use city center
        base_lat, base_lng = None, None
        
        if user_lat and user_lng:
            base_lat, base_lng = user_lat, user_lng
        elif lawyer.city and lawyer.city.lower() in CITY_CENTERS:
            base_lat, base_lng = CITY_CENTERS[lawyer.city.lower()]
        
        if base_lat and base_lng:
            # Add random jitter (approx 1-5km radius)
            # 0.01 deg is approx 1.1km
            resp.latitude = base_lat + random.uniform(-0.03, 0.03)
            resp.longitude = base_lng + random.uniform(-0.03, 0.03)
            
        lawyer_responses.append(resp)
        
    # Sort by Distance if requested (Client-side relative to page results since it's mock coords)
    if sort == "distance" and user_lat and user_lng:
        def calculate_distance(l):
            if l.latitude and l.longitude:
                return ((l.latitude - user_lat)**2 + (l.longitude - user_lng)**2)**0.5
            return float('inf')
        
        lawyer_responses.sort(key=calculate_distance)
    
    return LawyerDirectoryResponse(
        lawyers=lawyer_responses,
        total=total,
        page=page,
        pages=pages,
        disclaimer=MANDATORY_DISCLAIMER
    )


@router.get("/languages/list")
async def get_languages(db: Session = Depends(get_db)):
    """
    Get list of languages spoken by lawyers (for filtering).
    """
    
    from app.models import LawyerProfile
    
    # Get all unique languages from all lawyers
    lawyers = db.query(LawyerProfile.languages_known).filter(
        LawyerProfile.is_active == True
    ).all()
    
    languages = set()
    for lawyer in lawyers:
        if lawyer.languages_known:
            if isinstance(lawyer.languages_known, str):
                 langs = [l.strip() for l in lawyer.languages_known.split(',')]
                 languages.update(langs)
            else:
                 # In case it's actually list/json (shouldn't be with current model)
                 languages.update(lawyer.languages_known)
    
    return {
        "languages": sorted(list(languages))
    }

@router.get("/cities/list")
async def get_cities(
    state: Optional[str] = Query(None, description="Filter cities by state"),
    db: Session = Depends(get_db)
):
    """
    Get list of cities where lawyers are available (for filtering).
    """
    
    from app.models import LawyerProfile
    
    query = db.query(LawyerProfile.city).filter(LawyerProfile.is_active == True)
    
    if state:
        query = query.filter(func.lower(LawyerProfile.state) == func.lower(state))
    
    cities = query.distinct().order_by(LawyerProfile.city).all()
    
    return {
        "cities": [city[0] for city in cities if city[0]]
    }


@router.get("/states/list")
async def get_states(db: Session = Depends(get_db)):
    """
    Get list of states where lawyers are available (for filtering).
    """
    
    from app.models import LawyerProfile
    
    states = db.query(LawyerProfile.state).filter(
        LawyerProfile.is_active == True
    ).distinct().order_by(LawyerProfile.state).all()
    
    return {
        "states": [state[0] for state in states if state[0]]
    }

@router.get("/{lawyer_id}", response_model=LawyerProfileResponse)
async def get_lawyer_profile(
    lawyer_id: int,
    db: Session = Depends(get_db)
):
    """
    Get individual lawyer profile (factual information only).
    """
    
    from app.models import LawyerProfile
    
    lawyer = db.query(LawyerProfile).filter(
        LawyerProfile.id == lawyer_id,
        LawyerProfile.is_active == True
    ).first()
    
    if not lawyer:
        raise HTTPException(status_code=404, detail="Lawyer profile not found")
    
    return LawyerProfileResponse.from_orm(lawyer)
