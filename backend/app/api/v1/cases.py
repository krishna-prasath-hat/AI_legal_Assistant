"""
Cases API Routes
Handles case management for users and lawyers
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
import logging
import uuid

from app.database import get_db
from app.models import Case, CaseUpdate, CaseDocument, CaseStatus, CaseType, CaseFollowUp, FollowUpType, FollowUpStatus

logger = logging.getLogger(__name__)

router = APIRouter()


# Pydantic Models
class CaseCreate(BaseModel):
    """Request model for creating a case"""
    title: str = Field(..., min_length=10, max_length=500)
    description: str = Field(..., min_length=20)  # Reduced from 50 to 20
    case_type: CaseType
    incident_date: Optional[str] = None  # Accept string, will convert to datetime
    location: Optional[str] = None
    police_station: Optional[str] = None
    fir_number: Optional[str] = None


class CaseUpdateCreate(BaseModel):
    """Request model for creating a case update"""
    title: str = Field(..., min_length=5, max_length=300)
    description: str = Field(..., min_length=10)
    update_type: str = "general"


class CaseResponse(BaseModel):
    """Response model for a case"""
    id: int
    case_number: str
    title: str
    description: str
    case_type: str
    status: str
    user_name: str
    user_email: str
    incident_date: Optional[datetime]
    location: Optional[str]
    police_station: Optional[str]
    fir_number: Optional[str]
    lawyer_name: Optional[str]
    lawyer_email: Optional[str]
    court_name: Optional[str]
    next_hearing_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CaseUpdateResponse(BaseModel):
    """Response model for a case update"""
    id: int
    title: str
    description: str
    update_type: str
    created_by_name: str
    created_by_role: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class CaseListResponse(BaseModel):
    """Response model for case list"""
    cases: List[CaseResponse]
    total: int
    page: int
    pages: int


class CaseFollowUpCreate(BaseModel):
    """Request model for creating a case follow-up"""
    title: str = Field(..., min_length=5, max_length=300)
    description: Optional[str] = None
    followup_type: FollowUpType
    scheduled_date: str  # Will be converted to datetime
    court_name: Optional[str] = None
    judge_name: Optional[str] = None
    hearing_type: Optional[str] = None
    case_number: Optional[str] = None
    location: Optional[str] = None
    room_number: Optional[str] = None


class CaseFollowUpUpdate(BaseModel):
    """Request model for updating a case follow-up"""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[FollowUpStatus] = None
    scheduled_date: Optional[str] = None
    completed_date: Optional[str] = None
    court_name: Optional[str] = None
    judge_name: Optional[str] = None
    hearing_type: Optional[str] = None
    location: Optional[str] = None
    room_number: Optional[str] = None
    outcome: Optional[str] = None
    next_steps: Optional[str] = None


class CaseFollowUpResponse(BaseModel):
    """Response model for a case follow-up"""
    id: int
    case_id: int
    title: str
    description: Optional[str]
    followup_type: str
    status: str
    scheduled_date: datetime
    completed_date: Optional[datetime]
    court_name: Optional[str]
    judge_name: Optional[str]
    hearing_type: Optional[str]
    case_number: Optional[str]
    location: Optional[str]
    room_number: Optional[str]
    outcome: Optional[str]
    next_steps: Optional[str]
    created_by_name: str
    created_by_role: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Helper function to get current user (simplified - replace with actual auth)
def get_current_user_simple():
    """Get current user from token - simplified version"""
    # TODO: Replace with actual JWT token validation
    return {
        "id": "user_demo_123",
        "name": "Demo User",
        "email": "demo@example.com",
        "phone": "+91 9876543210",
        "role": "user"
    }


@router.post("/", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
async def create_case(
    case_data: CaseCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new case
    
    Args:
        case_data: Case creation data
        db: Database session
        
    Returns:
        Created case
    """
    try:
        # Get current user (simplified)
        user = get_current_user_simple()
        
        # Generate unique case number
        case_number = f"CASE-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        
        # Parse incident_date if provided
        incident_datetime = None
        if case_data.incident_date:
            try:
                # Try parsing ISO format (YYYY-MM-DD)
                incident_datetime = datetime.fromisoformat(case_data.incident_date)
            except:
                try:
                    # Try parsing common formats
                    from dateutil import parser
                    incident_datetime = parser.parse(case_data.incident_date)
                except:
                    logger.warning(f"Could not parse incident_date: {case_data.incident_date}")
        
        # Create case
        new_case = Case(
            case_number=case_number,
            user_id=user["id"],
            user_name=user["name"],
            user_email=user["email"],
            user_phone=user.get("phone"),
            title=case_data.title,
            description=case_data.description,
            case_type=case_data.case_type,
            status=CaseStatus.DRAFT,
            incident_date=incident_datetime,
            location=case_data.location,
            police_station=case_data.police_station,
            fir_number=case_data.fir_number
        )
        
        db.add(new_case)
        db.commit()
        db.refresh(new_case)
        
        logger.info(f"Case created: {case_number}")
        
        return new_case
        
    except Exception as e:
        logger.error(f"Error creating case: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create case"
        )


@router.get("/", response_model=CaseListResponse)
async def get_cases(
    page: int = 1,
    limit: int = 20,
    status_filter: Optional[CaseStatus] = None,
    db: Session = Depends(get_db)
):
    """
    Get all cases for current user
    
    Args:
        page: Page number
        limit: Items per page
        status_filter: Filter by status
        db: Database session
        
    Returns:
        List of cases
    """
    try:
        # Get current user
        user = get_current_user_simple()
        
        # Build query
        query = db.query(Case).filter(Case.user_id == user["id"])
        
        if status_filter:
            query = query.filter(Case.status == status_filter)
        
        # Get total count
        total = query.count()
        
        # Paginate
        cases = query.order_by(Case.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
        
        return {
            "cases": cases,
            "total": total,
            "page": page,
            "pages": (total + limit - 1) // limit
        }
        
    except Exception as e:
        logger.error(f"Error fetching cases: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch cases"
        )


@router.get("/{case_id}", response_model=CaseResponse)
async def get_case(
    case_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific case by ID
    
    Args:
        case_id: Case ID
        db: Database session
        
    Returns:
        Case details
    """
    try:
        user = get_current_user_simple()
        
        case = db.query(Case).filter(
            Case.id == case_id,
            Case.user_id == user["id"]
        ).first()
        
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case not found"
            )
        
        return case
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching case: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch case"
        )


@router.put("/{case_id}/status")
async def update_case_status(
    case_id: int,
    new_status: CaseStatus,
    db: Session = Depends(get_db)
):
    """
    Update case status
    
    Args:
        case_id: Case ID
        new_status: New status
        db: Database session
        
    Returns:
        Updated case
    """
    try:
        user = get_current_user_simple()
        
        case = db.query(Case).filter(
            Case.id == case_id,
            Case.user_id == user["id"]
        ).first()
        
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case not found"
            )
        
        case.status = new_status
        case.updated_at = datetime.utcnow()
        
        if new_status == CaseStatus.CLOSED:
            case.closed_at = datetime.utcnow()
        
        db.commit()
        db.refresh(case)
        
        logger.info(f"Case {case.case_number} status updated to {new_status}")
        
        return case
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating case status: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update case status"
        )


@router.post("/{case_id}/updates", response_model=CaseUpdateResponse)
async def add_case_update(
    case_id: int,
    update_data: CaseUpdateCreate,
    db: Session = Depends(get_db)
):
    """
    Add an update/note to a case
    
    Args:
        case_id: Case ID
        update_data: Update data
        db: Database session
        
    Returns:
        Created update
    """
    try:
        user = get_current_user_simple()
        
        # Verify case exists and user has access
        case = db.query(Case).filter(
            Case.id == case_id,
            Case.user_id == user["id"]
        ).first()
        
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case not found"
            )
        
        # Create update
        new_update = CaseUpdate(
            case_id=case_id,
            title=update_data.title,
            description=update_data.description,
            update_type=update_data.update_type,
            created_by_id=user["id"],
            created_by_name=user["name"],
            created_by_role=user["role"]
        )
        
        db.add(new_update)
        
        # Update case's updated_at timestamp
        case.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(new_update)
        
        logger.info(f"Update added to case {case.case_number}")
        
        return new_update
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding case update: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add case update"
        )


@router.get("/{case_id}/updates", response_model=List[CaseUpdateResponse])
async def get_case_updates(
    case_id: int,
    db: Session = Depends(get_db)
):
    """
    Get all updates for a case
    
    Args:
        case_id: Case ID
        db: Database session
        
    Returns:
        List of updates
    """
    try:
        user = get_current_user_simple()
        
        # Verify case exists and user has access
        case = db.query(Case).filter(
            Case.id == case_id,
            Case.user_id == user["id"]
        ).first()
        
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case not found"
            )
        
        updates = db.query(CaseUpdate).filter(
            CaseUpdate.case_id == case_id
        ).order_by(CaseUpdate.created_at.desc()).all()
        
        return updates
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching case updates: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch case updates"
        )


@router.delete("/{case_id}")
async def delete_case(
    case_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a case
    
    Args:
        case_id: Case ID
        db: Database session
        
    Returns:
        Success message
    """
    try:
        user = get_current_user_simple()
        
        case = db.query(Case).filter(
            Case.id == case_id,
            Case.user_id == user["id"]
        ).first()
        
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case not found"
            )
        
        db.delete(case)
        db.commit()
        
        logger.info(f"Case {case.case_number} deleted")
        
        return {"message": "Case deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting case: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete case"
        )


# ============================================================================
# FOLLOW-UP ENDPOINTS
# ============================================================================

@router.post("/{case_id}/followups", response_model=CaseFollowUpResponse, status_code=status.HTTP_201_CREATED)
async def create_followup(
    case_id: int,
    followup_data: CaseFollowUpCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new follow-up for a case
    
    Args:
        case_id: Case ID
        followup_data: Follow-up creation data
        db: Database session
        
    Returns:
        Created follow-up
    """
    try:
        user = get_current_user_simple()
        
        # Verify case exists and user has access
        case = db.query(Case).filter(
            Case.id == case_id,
            Case.user_id == user["id"]
        ).first()
        
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case not found"
            )
        
        # Parse scheduled_date
        scheduled_datetime = None
        if followup_data.scheduled_date:
            try:
                scheduled_datetime = datetime.fromisoformat(followup_data.scheduled_date.replace('Z', '+00:00'))
            except:
                try:
                    from dateutil import parser
                    scheduled_datetime = parser.parse(followup_data.scheduled_date)
                except:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid scheduled_date format"
                    )
        
        # Create follow-up
        new_followup = CaseFollowUp(
            case_id=case_id,
            title=followup_data.title,
            description=followup_data.description,
            followup_type=followup_data.followup_type,
            scheduled_date=scheduled_datetime,
            court_name=followup_data.court_name,
            judge_name=followup_data.judge_name,
            hearing_type=followup_data.hearing_type,
            case_number=followup_data.case_number,
            location=followup_data.location,
            room_number=followup_data.room_number,
            created_by_id=user["id"],
            created_by_name=user["name"],
            created_by_role=user["role"]
        )
        
        db.add(new_followup)
        
        # Update case's next_hearing_date if this is a hearing
        if followup_data.followup_type in [FollowUpType.HEARING, FollowUpType.COURT_DATE]:
            if not case.next_hearing_date or scheduled_datetime < case.next_hearing_date:
                case.next_hearing_date = scheduled_datetime
                if followup_data.court_name:
                    case.court_name = followup_data.court_name
        
        case.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(new_followup)
        
        logger.info(f"Follow-up created for case {case.case_number}")
        
        return new_followup
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating follow-up: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create follow-up"
        )


@router.get("/{case_id}/followups", response_model=List[CaseFollowUpResponse])
async def get_case_followups(
    case_id: int,
    status_filter: Optional[FollowUpStatus] = None,
    upcoming_only: bool = False,
    db: Session = Depends(get_db)
):
    """
    Get all follow-ups for a case
    
    Args:
        case_id: Case ID
        status_filter: Filter by status
        upcoming_only: Only return upcoming follow-ups
        db: Database session
        
    Returns:
        List of follow-ups
    """
    try:
        user = get_current_user_simple()
        
        # Verify case exists and user has access
        case = db.query(Case).filter(
            Case.id == case_id,
            Case.user_id == user["id"]
        ).first()
        
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case not found"
            )
        
        query = db.query(CaseFollowUp).filter(CaseFollowUp.case_id == case_id)
        
        if status_filter:
            query = query.filter(CaseFollowUp.status == status_filter)
        
        if upcoming_only:
            query = query.filter(
                CaseFollowUp.scheduled_date >= datetime.utcnow(),
                CaseFollowUp.status == FollowUpStatus.SCHEDULED
            )
        
        followups = query.order_by(CaseFollowUp.scheduled_date.asc()).all()
        
        return followups
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching follow-ups: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch follow-ups"
        )


@router.get("/{case_id}/followups/{followup_id}", response_model=CaseFollowUpResponse)
async def get_followup(
    case_id: int,
    followup_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific follow-up
    
    Args:
        case_id: Case ID
        followup_id: Follow-up ID
        db: Database session
        
    Returns:
        Follow-up details
    """
    try:
        user = get_current_user_simple()
        
        # Verify case exists and user has access
        case = db.query(Case).filter(
            Case.id == case_id,
            Case.user_id == user["id"]
        ).first()
        
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case not found"
            )
        
        followup = db.query(CaseFollowUp).filter(
            CaseFollowUp.id == followup_id,
            CaseFollowUp.case_id == case_id
        ).first()
        
        if not followup:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Follow-up not found"
            )
        
        return followup
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching follow-up: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch follow-up"
        )


@router.put("/{case_id}/followups/{followup_id}", response_model=CaseFollowUpResponse)
async def update_followup(
    case_id: int,
    followup_id: int,
    followup_data: CaseFollowUpUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a follow-up
    
    Args:
        case_id: Case ID
        followup_id: Follow-up ID
        followup_data: Update data
        db: Database session
        
    Returns:
        Updated follow-up
    """
    try:
        user = get_current_user_simple()
        
        # Verify case exists and user has access
        case = db.query(Case).filter(
            Case.id == case_id,
            Case.user_id == user["id"]
        ).first()
        
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case not found"
            )
        
        followup = db.query(CaseFollowUp).filter(
            CaseFollowUp.id == followup_id,
            CaseFollowUp.case_id == case_id
        ).first()
        
        if not followup:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Follow-up not found"
            )
        
        # Update fields
        if followup_data.title is not None:
            followup.title = followup_data.title
        if followup_data.description is not None:
            followup.description = followup_data.description
        if followup_data.status is not None:
            followup.status = followup_data.status
            if followup_data.status == FollowUpStatus.COMPLETED and not followup.completed_date:
                followup.completed_date = datetime.utcnow()
        if followup_data.court_name is not None:
            followup.court_name = followup_data.court_name
        if followup_data.judge_name is not None:
            followup.judge_name = followup_data.judge_name
        if followup_data.hearing_type is not None:
            followup.hearing_type = followup_data.hearing_type
        if followup_data.location is not None:
            followup.location = followup_data.location
        if followup_data.room_number is not None:
            followup.room_number = followup_data.room_number
        if followup_data.outcome is not None:
            followup.outcome = followup_data.outcome
        if followup_data.next_steps is not None:
            followup.next_steps = followup_data.next_steps
        
        if followup_data.scheduled_date is not None:
            try:
                followup.scheduled_date = datetime.fromisoformat(followup_data.scheduled_date.replace('Z', '+00:00'))
            except:
                try:
                    from dateutil import parser
                    followup.scheduled_date = parser.parse(followup_data.scheduled_date)
                except:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid scheduled_date format"
                    )
        
        if followup_data.completed_date is not None:
            try:
                followup.completed_date = datetime.fromisoformat(followup_data.completed_date.replace('Z', '+00:00'))
            except:
                try:
                    from dateutil import parser
                    followup.completed_date = parser.parse(followup_data.completed_date)
                except:
                    pass
        
        followup.updated_at = datetime.utcnow()
        case.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(followup)
        
        logger.info(f"Follow-up {followup_id} updated")
        
        return followup
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating follow-up: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update follow-up"
        )


@router.delete("/{case_id}/followups/{followup_id}")
async def delete_followup(
    case_id: int,
    followup_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a follow-up
    
    Args:
        case_id: Case ID
        followup_id: Follow-up ID
        db: Database session
        
    Returns:
        Success message
    """
    try:
        user = get_current_user_simple()
        
        # Verify case exists and user has access
        case = db.query(Case).filter(
            Case.id == case_id,
            Case.user_id == user["id"]
        ).first()
        
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case not found"
            )
        
        followup = db.query(CaseFollowUp).filter(
            CaseFollowUp.id == followup_id,
            CaseFollowUp.case_id == case_id
        ).first()
        
        if not followup:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Follow-up not found"
            )
        
        db.delete(followup)
        db.commit()
        
        logger.info(f"Follow-up {followup_id} deleted")
        
        return {"message": "Follow-up deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting follow-up: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete follow-up"
        )

