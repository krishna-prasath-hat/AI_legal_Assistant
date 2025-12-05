"""
Legal AI API Routes
Handles incident analysis and legal section extraction
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
import logging

from app.database import get_db
from app.core.security import get_current_user
from app.core.exceptions import AIProcessingError, NotFoundError
from app.ai.legal_extraction import get_legal_extraction_engine, LegalAnalysisResult

logger = logging.getLogger(__name__)

router = APIRouter()


# Request/Response Models
class AnalyzeIncidentRequest(BaseModel):
    """Request model for incident analysis"""
    incident_text: str = Field(..., min_length=50, max_length=5000, description="Incident description")
    location: Optional[str] = Field(None, description="Location of incident")
    incident_date: Optional[str] = Field(None, description="Date of incident")
    is_anonymous: bool = Field(False, description="Anonymous reporting")


class LegalSectionResponse(BaseModel):
    """Response model for legal section"""
    act_name: str
    section_number: str
    section_title: str
    section_description: str
    relevance_score: float
    reasoning: str
    is_cognizable: Optional[bool]
    is_bailable: Optional[bool]
    punishment_description: Optional[str]


class EntityResponse(BaseModel):
    """Response model for extracted entity"""
    entity_type: str
    entity_value: str
    confidence: float


class ClassificationResponse(BaseModel):
    """Response model for classification"""
    offense_type: str
    offense_category: str
    severity_level: str
    confidence_score: float
    keywords: List[str]
    threat_indicators: List[str]


class AnalysisResponse(BaseModel):
    """Response model for incident analysis"""
    incident_id: str
    classification: ClassificationResponse
    entities: List[EntityResponse]
    legal_sections: List[LegalSectionResponse]
    required_documents: List[str]
    next_steps: List[str]
    ai_summary: str
    created_at: datetime


class DraftFIRRequest(BaseModel):
    """Request model for FIR draft generation"""
    incident_id: str
    user_name: str
    user_address: str
    user_phone: str


class DraftFIRResponse(BaseModel):
    """Response model for FIR draft"""
    fir_draft: str
    incident_id: str
    created_at: datetime


@router.post("/analyze", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
async def analyze_incident(
    request: AnalyzeIncidentRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Analyze an incident and extract legal information
    
    This endpoint:
    1. Extracts entities from the incident text
    2. Classifies the offense type and category
    3. Finds relevant legal sections (IPC, CrPC, IT Act, etc.)
    4. Determines required documents
    5. Generates next steps
    6. Provides AI-generated summary
    
    Args:
        request: Incident details
        background_tasks: Background task queue
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Complete legal analysis result
    """
    try:
        logger.info(f"Analyzing incident for user {current_user['id']}")
        
        # Get legal extraction engine
        engine = get_legal_extraction_engine()
        
        # Analyze incident
        analysis = await engine.analyze_incident(
            incident_text=request.incident_text,
            location=request.location,
            incident_date=request.incident_date
        )
        
        # Save to database (simplified - would use proper models)
        # This is a placeholder for the actual database operations
        incident_id = "inc_" + datetime.utcnow().strftime("%Y%m%d%H%M%S")
        
        # TODO: Save incident, classification, entities, and legal sections to database
        # incident = Incident(...)
        # db.add(incident)
        # db.commit()
        
        # Prepare response
        response = AnalysisResponse(
            incident_id=incident_id,
            classification=ClassificationResponse(
                offense_type=analysis.classification.offense_type,
                offense_category=analysis.classification.offense_category,
                severity_level=analysis.classification.severity_level,
                confidence_score=analysis.classification.confidence_score,
                keywords=analysis.classification.keywords,
                threat_indicators=analysis.classification.threat_indicators
            ),
            entities=[
                EntityResponse(
                    entity_type=e.entity_type,
                    entity_value=e.entity_value,
                    confidence=e.confidence
                )
                for e in analysis.entities
            ],
            legal_sections=[
                LegalSectionResponse(
                    act_name=s.act_name,
                    section_number=s.section_number,
                    section_title=s.section_title,
                    section_description=s.section_description,
                    relevance_score=s.relevance_score,
                    reasoning=s.reasoning,
                    is_cognizable=s.is_cognizable,
                    is_bailable=s.is_bailable,
                    punishment_description=s.punishment_description
                )
                for s in analysis.legal_sections
            ],
            required_documents=analysis.required_documents,
            next_steps=analysis.next_steps,
            ai_summary=analysis.ai_summary,
            created_at=datetime.utcnow()
        )
        
        logger.info(f"Analysis completed for incident {incident_id}")
        
        return response
        
    except AIProcessingError as e:
        logger.error(f"AI processing error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected error during analysis: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze incident"
        )


@router.get("/sections/{incident_id}", response_model=List[LegalSectionResponse])
async def get_legal_sections(
    incident_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get legal sections for a specific incident
    
    Args:
        incident_id: Incident ID
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        List of legal sections
    """
    try:
        # TODO: Fetch from database
        # incident = db.query(Incident).filter(Incident.id == incident_id).first()
        # if not incident:
        #     raise NotFoundError(f"Incident {incident_id} not found")
        
        # For now, return empty list
        return []
        
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching legal sections: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch legal sections"
        )


@router.post("/draft-fir", response_model=DraftFIRResponse)
async def draft_fir(
    request: DraftFIRRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Generate FIR draft for an incident
    
    Args:
        request: FIR draft request
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Generated FIR draft
    """
    try:
        logger.info(f"Generating FIR draft for incident {request.incident_id}")
        
        # TODO: Fetch incident and analysis from database
        # incident = db.query(Incident).filter(Incident.id == request.incident_id).first()
        # if not incident:
        #     raise NotFoundError(f"Incident {request.incident_id} not found")
        
        # Get legal extraction engine
        engine = get_legal_extraction_engine()
        
        # For demo, use placeholder data
        from app.ai.legal_extraction import IncidentClassification, LegalSection
        
        classification = IncidentClassification(
            offense_type="theft",
            offense_category="criminal",
            severity_level="medium",
            confidence_score=0.85,
            keywords=["stolen", "theft"],
            threat_indicators=[]
        )
        
        legal_sections = [
            LegalSection(
                act_name="IPC",
                section_number="378",
                section_title="Theft",
                section_description="Theft definition",
                relevance_score=0.9,
                reasoning="Applicable",
                is_cognizable=True,
                is_bailable=False,
                punishment_description="Up to 3 years"
            )
        ]
        
        # Generate FIR draft
        fir_draft = await engine.llm_client.generate_fir_draft(
            incident_text="Sample incident",  # Would fetch from DB
            classification=classification,
            legal_sections=legal_sections,
            user_details={
                "name": request.user_name,
                "address": request.user_address,
                "phone": request.user_phone
            }
        )
        
        response = DraftFIRResponse(
            fir_draft=fir_draft,
            incident_id=request.incident_id,
            created_at=datetime.utcnow()
        )
        
        logger.info(f"FIR draft generated for incident {request.incident_id}")
        
        return response
        
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating FIR draft: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate FIR draft"
        )


@router.get("/health")
async def health_check():
    """Health check endpoint for legal AI service"""
    return {
        "status": "healthy",
        "service": "legal_ai",
        "timestamp": datetime.utcnow().isoformat()
    }
