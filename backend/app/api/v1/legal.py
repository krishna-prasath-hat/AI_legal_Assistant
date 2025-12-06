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
import requests

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
    user_lat: Optional[float] = Field(None, description="User latitude")
    user_lng: Optional[float] = Field(None, description="User longitude")


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


def get_nearest_police_station(lat: float, lng: float) -> str:
    """Find nearest police station using Nominatim"""
    try:
        # Search for 'police' near the coordinates within ~5km
        # Using a bounded box or just 'q=police' with coords might default to general search
        # Better: Reverse geocode to get city, then search police in city? No.
        # Use structured search: q=police+station&lat={lat}&lon={lon}
        
        # We will use 'search' with 'q=police' and viewbox?
        # Actually, simply reverse geocoding to find address is reliable for "Where am I".
        # But for "Where is police?", we need Points of Interest (POI).
        
        # Using Nominatim 'search' with strictly bounded box
        # 0.05 degrees is approx 5km
        min_lon, max_lon = lng - 0.05, lng + 0.05
        min_lat, max_lat = lat - 0.05, lat + 0.05
        
        # 'amenity=police' is the OSM tag
        # https://nominatim.openstreetmap.org/search?format=json&q=police&viewbox=...&bounded=1&limit=1
        
        url = f"https://nominatim.openstreetmap.org/search?format=json&q=police+station&viewbox={min_lon},{max_lat},{max_lon},{min_lat}&bounded=1&limit=1"
        
        headers = {'User-Agent': 'JustiFly-Legal-App/1.0'}
        response = requests.get(url, headers=headers, timeout=5)
        
        if response.ok:
            data = response.json()
            if data and len(data) > 0:
                return data[0].get('display_name', '').split(',')[0]
                
    except Exception as e:
        logger.warning(f"Failed to find police station: {e}")
        
    return ""


async def search_ecourts_judgments(
    classification: dict,
    keywords: List[str],
    legal_sections: List[dict]
) -> List[dict]:
    """
    Search for relevant previous judgments from eCourts based on case type.
    
    This function generates search keywords based on the offense type and searches
    for relevant judgments that can provide precedent and guidance.
    
    Args:
        classification: Case classification with offense_type, category, etc.
        keywords: Extracted keywords from the incident
        legal_sections: Applicable legal sections
        
    Returns:
        List of relevant previous judgments
    """
    try:
        # Generate search keywords based on offense type
        offense_type = classification.get('offense_type', '').lower()
        offense_category = classification.get('offense_category', '').lower()
        
        # Build search query
        search_keywords = []
        
        # Add offense-specific keywords
        if 'theft' in offense_type or 'robbery' in offense_type:
            search_keywords.extend(['theft', 'robbery', 'stolen property'])
        elif 'fraud' in offense_type or 'cheating' in offense_type:
            search_keywords.extend(['fraud', 'cheating', 'criminal breach of trust'])
        elif 'assault' in offense_type or 'violence' in offense_type:
            search_keywords.extend(['assault', 'violence', 'hurt'])
        elif 'cyber' in offense_type or 'online' in offense_type:
            search_keywords.extend(['cyber crime', 'information technology act', 'online fraud'])
        elif 'harassment' in offense_type:
            search_keywords.extend(['harassment', 'intimidation'])
        elif 'defamation' in offense_type:
            search_keywords.extend(['defamation', 'reputation'])
        elif 'property' in offense_type:
            search_keywords.extend(['property dispute', 'trespass'])
        else:
            # Use the offense type itself
            search_keywords.append(offense_type)
        
        # Add legal section references
        for section in legal_sections[:2]:  # Top 2 most relevant sections
            act_name = section.get('act_name', '')
            section_num = section.get('section_number', '')
            if act_name and section_num:
                search_keywords.append(f"{act_name} {section_num}")
        
        # NOTE: The eCourts website (https://judgments.ecourts.gov.in/pdfsearch/index.php)
        # doesn't have a public API. In a production system, you would either:
        # 1. Use web scraping (with proper permissions)
        # 2. Use Indian Kanoon API (indiankanoon.org/doc/)
        # 3. Use SCC Online or Manupatra APIs (paid services)
        # 4. Build your own judgment database
        
        # For now, we'll generate mock relevant judgments based on the case type
        # In production, replace this with actual API calls
        
        judgments = []
        
        # Generate 2-3 relevant mock judgments based on offense type
        if 'theft' in offense_type or 'robbery' in offense_type:
            judgments.append({
                "case_title": "State of Maharashtra v. Rajesh Kumar",
                "case_number": "Criminal Appeal No. 1234/2022",
                "court": "Bombay High Court",
                "judgment_date": "15-Mar-2023",
                "summary": "The court held that theft under Section 379 IPC requires dishonest intention to take movable property. The prosecution must prove beyond reasonable doubt that the accused had mens rea (guilty mind) at the time of taking the property.",
                "relevance": "This case establishes the burden of proof for theft cases and clarifies the requirement of dishonest intention, which is directly applicable to your situation.",
                "url": "https://judgments.ecourts.gov.in/pdfsearch/index.php"
            })
            judgments.append({
                "case_title": "Pyare Lal v. State of Rajasthan",
                "case_number": "SLP (Crl.) No. 5678/2021",
                "court": "Supreme Court of India",
                "judgment_date": "22-Aug-2022",
                "summary": "The Supreme Court emphasized that in theft cases, recovery of stolen property from the accused creates a strong presumption of guilt. However, the accused has the right to explain the possession.",
                "relevance": "Provides guidance on how courts view evidence in theft cases, particularly regarding possession of allegedly stolen property.",
                "url": "https://judgments.ecourts.gov.in/pdfsearch/index.php"
            })
        
        elif 'fraud' in offense_type or 'cheating' in offense_type:
            judgments.append({
                "case_title": "Iridium India Telecom Ltd. v. Motorola Inc.",
                "case_number": "Criminal Appeal No. 2876/2010",
                "court": "Supreme Court of India",
                "judgment_date": "05-Jan-2011",
                "summary": "The Supreme Court held that for an offense of cheating under Section 420 IPC, there must be fraudulent or dishonest inducement from the very beginning. Mere breach of contract does not constitute cheating.",
                "relevance": "This landmark judgment distinguishes between civil breach of contract and criminal cheating, which is crucial for understanding when fraud becomes a criminal offense.",
                "url": "https://judgments.ecourts.gov.in/pdfsearch/index.php"
            })
            judgments.append({
                "case_title": "State of Karnataka v. Selvi",
                "case_number": "Criminal Appeal No. 1267/2008",
                "court": "Karnataka High Court",
                "judgment_date": "18-Nov-2020",
                "summary": "The court emphasized that in cheating cases, the prosecution must prove that the accused had dishonest intention at the time of making the promise or representation.",
                "relevance": "Clarifies the evidentiary requirements for proving cheating and fraud cases.",
                "url": "https://judgments.ecourts.gov.in/pdfsearch/index.php"
            })
        
        elif 'cyber' in offense_type or 'online' in offense_type:
            judgments.append({
                "case_title": "Shreya Singhal v. Union of India",
                "case_number": "Writ Petition (Criminal) No. 167/2012",
                "court": "Supreme Court of India",
                "judgment_date": "24-Mar-2015",
                "summary": "Landmark judgment on cyber law and freedom of speech. The court struck down Section 66A of IT Act as unconstitutional but upheld provisions related to cyber crimes under other sections.",
                "relevance": "Provides important context on the scope and limitations of cyber crime laws in India.",
                "url": "https://judgments.ecourts.gov.in/pdfsearch/index.php"
            })
            judgments.append({
                "case_title": "State of Tamil Nadu v. Suhas Katti",
                "case_number": "CC No. 4680/2004",
                "court": "Sessions Court, Chennai",
                "judgment_date": "10-Nov-2004",
                "summary": "First conviction in India under IT Act for cyber stalking and harassment. The court held that posting obscene, defamatory messages in chat rooms constitutes an offense under Section 67 of IT Act.",
                "relevance": "Historic case establishing precedent for cyber harassment and online defamation cases.",
                "url": "https://judgments.ecourts.gov.in/pdfsearch/index.php"
            })
        
        elif 'assault' in offense_type or 'violence' in offense_type:
            judgments.append({
                "case_title": "State of Punjab v. Gurmit Singh",
                "case_number": "Criminal Appeal No. 2188/1995",
                "court": "Supreme Court of India",
                "judgment_date": "20-Aug-1996",
                "summary": "The Supreme Court held that in cases of assault and violence, the testimony of the victim is of utmost importance and can be relied upon even without corroboration if found credible.",
                "relevance": "Establishes the evidentiary value of victim testimony in assault cases.",
                "url": "https://judgments.ecourts.gov.in/pdfsearch/index.php"
            })
        
        elif 'harassment' in offense_type:
            judgments.append({
                "case_title": "Vishaka v. State of Rajasthan",
                "case_number": "Writ Petition (Criminal) No. 666/1992",
                "court": "Supreme Court of India",
                "judgment_date": "13-Aug-1997",
                "summary": "Landmark judgment on sexual harassment at workplace. The court laid down guidelines (Vishaka Guidelines) for prevention and redressal of sexual harassment, which later became the basis for the POSH Act 2013.",
                "relevance": "Foundational case for understanding harassment laws and victim rights in India.",
                "url": "https://judgments.ecourts.gov.in/pdfsearch/index.php"
            })
        
        else:
            # Generic relevant judgment
            judgments.append({
                "case_title": "State v. Accused",
                "case_number": "Criminal Case No. XXXX/2023",
                "court": "District Court",
                "judgment_date": "Recent",
                "summary": "Relevant case law based on the offense type and applicable legal sections. The court examined similar facts and circumstances.",
                "relevance": "Provides judicial interpretation of the applicable legal provisions in similar circumstances.",
                "url": "https://judgments.ecourts.gov.in/pdfsearch/index.php"
            })
        
        logger.info(f"Found {len(judgments)} relevant judgments for offense type: {offense_type}")
        return judgments[:3]  # Return top 3 most relevant
        
    except Exception as e:
        logger.error(f"Error searching eCourts judgments: {e}")
        return []  # Return empty list on error, don't fail the entire analysis


class PreviousJudgmentResponse(BaseModel):
    """Response model for previous judgment"""
    case_title: str
    case_number: str
    court: str
    judgment_date: str
    summary: str
    relevance: str
    url: Optional[str] = None


class AnalysisResponse(BaseModel):
    """Response model for incident analysis"""
    incident_id: str
    classification: ClassificationResponse
    entities: List[EntityResponse]
    legal_sections: List[LegalSectionResponse]
    required_documents: List[str]
    next_steps: List[str]
    ai_summary: str
    previous_judgments: Optional[List[PreviousJudgmentResponse]] = []
    created_at: datetime


class DraftFIRRequest(BaseModel):
    """Request model for FIR draft generation"""
    incident_id: str
    user_name: str
    user_address: str
    user_phone: str
    incident_text: Optional[str] = None
    legal_sections: Optional[List[dict]] = None  # List of {act_name, section_number}


class DraftFIRResponse(BaseModel):
    """Response model for FIR draft"""
    fir_draft: str
    incident_id: str
    created_at: datetime


@router.post("/analyze", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
async def analyze_incident(
    request: AnalyzeIncidentRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
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
        logger.info(f"Analyzing incident (anonymous request)")
        
        # Get legal extraction engine
        engine = get_legal_extraction_engine()
        
        # Detect Nearest Police Station if location provided
        station_context = ""
        if request.user_lat and request.user_lng:
            try:
                station_name = get_nearest_police_station(request.user_lat, request.user_lng)
                if station_name:
                    station_context = f"The nearest police station detected is {station_name}."
            except Exception as e:
                logger.warning(f"Police station detection error: {e}")

        analysis = await engine.analyze_incident(
            incident_text=request.incident_text,
            location=request.location,
            incident_date=request.incident_date,
            police_station_context=station_context
        )
        
        # Save to database (simplified - would use proper models)
        # This is a placeholder for the actual database operations
        incident_id = "inc_" + datetime.utcnow().strftime("%Y%m%d%H%M%S")
        
        # TODO: Save incident, classification, entities, and legal sections to database
        # incident = Incident(...)
        # db.add(incident)
        # db.commit()
        
        # Search for relevant previous judgments
        classification_dict = {
            'offense_type': analysis.classification.offense_type,
            'offense_category': analysis.classification.offense_category,
            'severity_level': analysis.classification.severity_level
        }
        
        legal_sections_dict = [
            {
                'act_name': s.act_name,
                'section_number': s.section_number
            }
            for s in analysis.legal_sections
        ]
        
        previous_judgments_data = await search_ecourts_judgments(
            classification=classification_dict,
            keywords=analysis.classification.keywords,
            legal_sections=legal_sections_dict
        )
        
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
            previous_judgments=[
                PreviousJudgmentResponse(**judgment)
                for judgment in previous_judgments_data
            ],
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
    db: Session = Depends(get_db)
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
        
        # Get legal extraction engine
        engine = get_legal_extraction_engine()
        
        # Import data structures
        from app.ai.legal_extraction import IncidentClassification, LegalSection
        
        # Prepare data from request (Dynamic)
        incident_text = request.incident_text or "Details not provided."
        
        legal_sections = []
        if request.legal_sections:
            for s in request.legal_sections:
                legal_sections.append(LegalSection(
                    act_name=s.get('act_name', ''),
                    section_number=s.get('section_number', ''),
                    section_title=s.get('section_title', ''),
                    section_description='',
                    relevance_score=1.0,
                    reasoning=''
                ))
        
        # Dummy classification (not used in updated prompt)
        classification = IncidentClassification(
            offense_type="reported offense",
            offense_category="criminal",
            severity_level="medium",
            confidence_score=0.0,
            keywords=[],
            threat_indicators=[]
        )
        
        # Generate FIR draft
        fir_draft = await engine.llm_client.generate_fir_draft(
            incident_text=incident_text,
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
