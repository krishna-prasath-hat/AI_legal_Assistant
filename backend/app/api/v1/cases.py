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
from app.models import Case, CaseUpdate, CaseDocument, CaseStatus, CaseType

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
