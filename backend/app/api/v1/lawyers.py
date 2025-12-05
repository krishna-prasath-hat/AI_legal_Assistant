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
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date
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
    id: str
    
    # ✅ ALLOWED: Basic Identification
    full_name: str
    enrollment_number: str
    bar_council_state: str
    enrollment_date: date
    
    # ✅ ALLOWED: Contact Information
    email: Optional[str] = None
    phone: Optional[str] = None
    office_address: Optional[str] = None
    city: str
    state: str
    pincode: Optional[str] = None
    
    # ✅ ALLOWED: Professional Information (Factual Only)
    practice_areas: List[str]
    courts_practicing_in: Optional[List[str]] = []
    languages_known: List[str] = ["English"]
    
    # ✅ ALLOWED: Academic Qualifications
    law_degree: Optional[str] = None
    law_school: Optional[str] = None
    graduation_year: Optional[int] = None
    other_qualifications: Optional[List[str]] = []
    
    # ✅ ALLOWED: Bar Association Memberships
    bar_association_memberships: Optional[List[str]] = []
    
    # ✅ ALLOWED: Gender (for filtering)
    gender: Optional[str] = None
    
    # Profile Status
    profile_verified: bool = False
    profile_claimed: bool = False
    
    # ❌ NO ratings, fees, statistics, or rankings
    
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
    verification_document: Optional[str] = None  # Base64 encoded Bar Council ID


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
    sort: str = Query("name_asc", pattern="^(name_asc|name_desc)$", description="Sort order (alphabetical only)"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=50, description="Results per page"),
    db: Session = Depends(get_db)
):
    """
    Get lawyer directory with neutral, factual listings.
    
    COMPLIANCE NOTES:
    - NO ranking or recommendation logic
    - ONLY alphabetical sorting (name_asc or name_desc)
    - User-driven filters only (city, practice area, language, gender)
    - All results presented uniformly
    - Mandatory disclaimer included
    
    Returns:
        LawyerDirectoryResponse with alphabetically sorted lawyers
    """
    
    # Import here to avoid circular imports
    from app.models import LawyerProfile
    
    # Build filter conditions
    filters = [LawyerProfile.is_active == True]
    
    if city:
        filters.append(func.lower(LawyerProfile.city) == func.lower(city))
    
    if state:
        filters.append(func.lower(LawyerProfile.state) == func.lower(state))
    
    if practice_area:
        filters.append(LawyerProfile.practice_areas.contains([practice_area]))
    
    if language:
        filters.append(LawyerProfile.languages_known.contains([language]))
    
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
    lawyer_responses = [
        LawyerProfileResponse.from_orm(lawyer) for lawyer in lawyers
    ]
    
    return LawyerDirectoryResponse(
        lawyers=lawyer_responses,
        total=total,
        page=page,
        pages=pages,
        disclaimer=MANDATORY_DISCLAIMER
    )


@router.get("/{lawyer_id}", response_model=LawyerProfileResponse)
async def get_lawyer_profile(
    lawyer_id: str,
    db: Session = Depends(get_db)
):
    """
    Get individual lawyer profile (factual information only).
    
    COMPLIANCE NOTES:
    - NO ratings, reviews, or testimonials
    - NO case statistics or win rates
    - NO fee information
    - ONLY verifiable factual data
    
    Returns:
        LawyerProfileResponse with factual information and disclaimer
    """
    
    from app.models import LawyerProfile
    
    lawyer = db.query(LawyerProfile).filter(
        LawyerProfile.id == lawyer_id,
        LawyerProfile.is_active == True
    ).first()
    
    if not lawyer:
        raise HTTPException(status_code=404, detail="Lawyer profile not found")
    
    # Log profile view for audit (compliance tracking)
    # TODO: Add audit log entry
    
    return LawyerProfileResponse.from_orm(lawyer)


@router.get("/practice-areas/list", response_model=PracticeAreaResponse)
async def get_practice_areas(db: Session = Depends(get_db)):
    """
    Get standardized list of practice areas for filtering.
    
    Returns:
        List of practice area names
    """
    
    from app.models import PracticeArea
    
    practice_areas = db.query(PracticeArea).filter(
        PracticeArea.is_active == True
    ).order_by(PracticeArea.display_order, PracticeArea.name).all()
    
    return PracticeAreaResponse(
        practice_areas=[pa.name for pa in practice_areas]
    )


@router.post("/claim-profile")
async def claim_lawyer_profile(
    claim_request: LawyerProfileClaimRequest,
    db: Session = Depends(get_db)
):
    """
    Allow lawyers to claim their profile for verification and updates.
    
    This enables lawyers to:
    - Verify their profile information
    - Update contact details
    - Correct any inaccuracies
    
    Returns:
        Claim request confirmation
    """
    
    from app.models import LawyerProfile, LawyerProfileClaim
    
    # Find lawyer by enrollment number
    lawyer = db.query(LawyerProfile).filter(
        LawyerProfile.enrollment_number == claim_request.enrollment_number,
        LawyerProfile.is_active == True
    ).first()
    
    if not lawyer:
        raise HTTPException(
            status_code=404,
            detail="No profile found with this enrollment number"
        )
    
    if lawyer.profile_claimed:
        raise HTTPException(
            status_code=400,
            detail="This profile has already been claimed"
        )
    
    # Create claim request
    claim = LawyerProfileClaim(
        lawyer_profile_id=lawyer.id,
        claimant_email=claim_request.email,
        claimant_phone=claim_request.phone,
        enrollment_number=claim_request.enrollment_number,
        status='pending'
    )
    
    db.add(claim)
    db.commit()
    db.refresh(claim)
    
    # TODO: Send verification email to claimant
    # TODO: Notify admin for manual verification
    
    return {
        "message": "Profile claim request submitted successfully",
        "claim_id": str(claim.id),
        "status": "pending",
        "next_steps": "You will receive a verification email. Please submit your Bar Council ID for verification."
    }


@router.get("/cities/list")
async def get_cities(
    state: Optional[str] = Query(None, description="Filter cities by state"),
    db: Session = Depends(get_db)
):
    """
    Get list of cities where lawyers are available (for filtering).
    
    Returns:
        List of cities
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
    
    Returns:
        List of states
    """
    
    from app.models import LawyerProfile
    
    states = db.query(LawyerProfile.state).filter(
        LawyerProfile.is_active == True
    ).distinct().order_by(LawyerProfile.state).all()
    
    return {
        "states": [state[0] for state in states if state[0]]
    }


@router.get("/languages/list")
async def get_languages(db: Session = Depends(get_db)):
    """
    Get list of languages spoken by lawyers (for filtering).
    
    Returns:
        List of languages
    """
    
    from app.models import LawyerProfile
    
    # Get all unique languages from all lawyers
    lawyers = db.query(LawyerProfile.languages_known).filter(
        LawyerProfile.is_active == True
    ).all()
    
    languages = set()
    for lawyer in lawyers:
        if lawyer.languages_known:
            languages.update(lawyer.languages_known)
    
    return {
        "languages": sorted(list(languages))
    }


# ============================================================================
# COMPLIANCE VALIDATION
# ============================================================================

def validate_response_compliance(response_data: dict) -> bool:
    """
    Validate that API response contains no prohibited fields.
    
    This is a safeguard to ensure BCI Rule 36 compliance.
    
    Args:
        response_data: Dictionary of response data
        
    Returns:
        True if compliant
        
    Raises:
        ValueError if prohibited fields detected
    """
    for field in PROHIBITED_FIELDS:
        if field in response_data:
            raise ValueError(
                f"BCI Rule 36 Violation: Prohibited field '{field}' detected in response"
            )
    return True


# ============================================================================
# REMOVED ENDPOINTS (Non-Compliant)
# ============================================================================

# ❌ REMOVED: GET /api/lawyers/recommended
# ❌ REMOVED: GET /api/lawyers/top-rated
# ❌ REMOVED: GET /api/lawyers/{id}/analytics
# ❌ REMOVED: GET /api/lawyers/{id}/reviews
# ❌ REMOVED: GET /api/lawyers/{id}/statistics
# ❌ REMOVED: GET /api/lawyers/compare
# ❌ REMOVED: POST /api/lawyers/{id}/rate
# ❌ REMOVED: POST /api/lawyers/{id}/review

# These endpoints violated BCI Rule 36 by providing:
# - Rankings and recommendations
# - Ratings and reviews
# - Performance statistics
# - Fee comparisons
# - Promotional content
