"""
Legal Section Extraction Engine
Combines NER, Classification, Vector Search, and LLM Reasoning
"""
import logging
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import re

from app.config import settings
from app.core.exceptions import AIProcessingError

logger = logging.getLogger(__name__)


@dataclass
class LegalSection:
    """Legal section data structure"""
    act_name: str
    section_number: str
    section_title: str
    section_description: str
    relevance_score: float
    reasoning: str
    is_cognizable: Optional[bool] = None
    is_bailable: Optional[bool] = None
    punishment_description: Optional[str] = None
    court_fees: Optional[str] = None


@dataclass
class ExtractedEntity:
    """Extracted entity from incident text"""
    entity_type: str  # PERSON, DATE, LOCATION, MONEY, etc.
    entity_value: str
    start_pos: int
    end_pos: int
    confidence: float


@dataclass
class IncidentClassification:
    """Incident classification result"""
    offense_type: str  # theft, fraud, assault, cybercrime, etc.
    offense_category: str  # criminal, civil, cyber, consumer, family
    severity_level: str  # low, medium, high, critical
    confidence_score: float
    keywords: List[str]
    threat_indicators: List[str]


@dataclass
class LegalAnalysisResult:
    """Complete legal analysis result"""
    classification: IncidentClassification
    entities: List[ExtractedEntity]
    legal_sections: List[LegalSection]
    required_documents: List[str]
    next_steps: List[str]
    ai_summary: str


class LegalExtractionEngine:
    """
    Main engine for legal section extraction and analysis
    """
    
    def __init__(self):
        """Initialize the legal extraction engine"""
        self.ner_model = None
        self.classification_model = None
        self.vector_search = None
        self.llm_client = None
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize AI models"""
        try:
            # Import AI modules
            from app.ai.ner_model import NERModel
            from app.ai.classification import ClassificationModel
            from app.ai.vector_search import VectorSearch
            from app.ai.llm_reasoning import LLMReasoning
            
            self.ner_model = NERModel()
            self.classification_model = ClassificationModel()
            self.vector_search = VectorSearch()
            self.llm_client = LLMReasoning()
            
            logger.info("Legal extraction engine initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize legal extraction engine: {e}")
            raise AIProcessingError(f"Failed to initialize AI models: {str(e)}")
    
    async def analyze_incident(
        self,
        incident_text: str,
        location: Optional[str] = None,
        incident_date: Optional[str] = None,
        police_station_context: str = ""
    ) -> LegalAnalysisResult:
        """
        Analyze an incident and extract legal information
        
        Args:
            incident_text: Incident description in plain text
            location: Optional location information
            incident_date: Optional incident date
            
        Returns:
            LegalAnalysisResult with complete analysis
        """
        try:
            logger.info("Starting incident analysis")
            
            # Step 1: Preprocess text
            cleaned_text = self._preprocess_text(incident_text)
            
            # Step 2: Extract entities
            entities = await self._extract_entities(cleaned_text)
            logger.info(f"Extracted {len(entities)} entities")
            
            # Step 3: Classify incident
            classification = await self._classify_incident(cleaned_text, entities)
            logger.info(f"Classified as: {classification.offense_type}")
            
            # Step 4: Find relevant legal sections
            legal_sections = await self._find_legal_sections(
                cleaned_text,
                classification,
                entities
            )
            logger.info(f"Found {len(legal_sections)} relevant legal sections")
            
            # Step 5: Generate AI summary and recommendations
            ai_summary = await self._generate_summary(
                cleaned_text,
                classification,
                legal_sections
            )

            # CHECK FOR REFUSAL: If AI refuses, clear all other fields
            # Use a specific phrase that only appears in refusal, not in polite intros
            refusal_marker = "I cannot assist with general conversation"
            if refusal_marker in ai_summary:
                logger.info("AI refused to analyze non-legal query")
                legal_sections = []
                required_documents = []
                next_steps = []
                # Mark classification as invalid to prevent downstream judgment search
                classification.offense_type = "non-legal"
                classification.offense_category = "invalid"
            else:
                # Step 6 & 7: Generate practical guidance via LLM (Only if valid)
                guidance = await self.llm_client.generate_practical_guidance(
                    cleaned_text,
                    classification,
                    police_station_context
                )
                
                required_documents = guidance.get('required_documents', [])
                next_steps = guidance.get('next_steps', [])
                
                # Fallback to rule-based if LLM extraction failed
                if not required_documents:
                    required_documents = self._get_required_documents(classification, legal_sections)
                
                if not next_steps:
                    next_steps = self._generate_next_steps(classification, legal_sections)
            
            return LegalAnalysisResult(
                classification=classification,
                entities=entities,
                legal_sections=legal_sections,
                required_documents=required_documents,
                next_steps=next_steps,
                ai_summary=ai_summary
            )
            
        except Exception as e:
            logger.error(f"Error analyzing incident: {e}", exc_info=True)
            raise AIProcessingError(f"Failed to analyze incident: {str(e)}")
    
    def _preprocess_text(self, text: str) -> str:
        """
        Preprocess incident text
        
        Args:
            text: Raw incident text
            
        Returns:
            Cleaned text
        """
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep punctuation
        text = re.sub(r'[^\w\s.,!?-]', '', text)
        
        return text.strip()
    
    async def _extract_entities(self, text: str) -> List[ExtractedEntity]:
        """
        Extract named entities from text
        
        Args:
            text: Incident text
            
        Returns:
            List of extracted entities
        """
        try:
            entities = await self.ner_model.extract_entities(text)
            return entities
        except Exception as e:
            logger.warning(f"Entity extraction failed: {e}")
            return []
    
    async def _classify_incident(
        self,
        text: str,
        entities: List[ExtractedEntity]
    ) -> IncidentClassification:
        """
        Classify the incident type
        
        Args:
            text: Incident text
            entities: Extracted entities
            
        Returns:
            IncidentClassification
        """
        try:
            classification = await self.classification_model.classify(text, entities)
            return classification
        except Exception as e:
            logger.error(f"Classification failed: {e}")
            # Return default classification
            return IncidentClassification(
                offense_type="general",
                offense_category="criminal",
                severity_level="medium",
                confidence_score=0.5,
                keywords=[],
                threat_indicators=[]
            )
    
    async def _find_legal_sections(
        self,
        text: str,
        classification: IncidentClassification,
        entities: List[ExtractedEntity]
    ) -> List[LegalSection]:
        """
        Find relevant legal sections
        
        Args:
            text: Incident text
            classification: Incident classification
            entities: Extracted entities
            
        Returns:
            List of relevant legal sections
        """
        try:
            # Use vector search to find similar cases and sections
            vector_results = await self.vector_search.search_legal_sections(
                text,
                classification.offense_type,
                top_k=10
            )
            
            # Use LLM to refine and explain relevance
            refined_sections = await self.llm_client.refine_legal_sections(
                text,
                classification,
                vector_results
            )
            
            return refined_sections
            
        except Exception as e:
            logger.error(f"Legal section search failed: {e}")
            return []
    
    async def _generate_summary(
        self,
        text: str,
        classification: IncidentClassification,
        legal_sections: List[LegalSection]
    ) -> str:
        """
        Generate AI summary of the legal analysis
        
        Args:
            text: Incident text
            classification: Classification result
            legal_sections: Found legal sections
            
        Returns:
            AI-generated summary
        """
        try:
            summary = await self.llm_client.generate_analysis_summary(
                text,
                classification,
                legal_sections
            )
            return summary
        except Exception as e:
            logger.warning(f"Summary generation failed: {e}")
            return "Analysis completed. Please review the legal sections and recommendations."
    
    def _get_required_documents(
        self,
        classification: IncidentClassification,
        legal_sections: List[LegalSection]
    ) -> List[str]:
        """
        Determine required documents based on case type
        
        Args:
            classification: Incident classification
            legal_sections: Legal sections
            
        Returns:
            List of required documents
        """
        documents = [
            "Identity proof (Aadhaar/PAN/Passport)",
            "Address proof",
        ]
        
        # Add category-specific documents
        if classification.offense_category == "criminal":
            documents.extend([
                "Written complaint/FIR copy",
                "Evidence (photos, videos, screenshots)",
                "Witness statements (if any)",
                "Medical reports (if applicable)"
            ])
        elif classification.offense_category == "cyber":
            documents.extend([
                "Screenshots of incident",
                "Transaction details (if financial fraud)",
                "Email/message communications",
                "Device information"
            ])
        elif classification.offense_category == "consumer":
            documents.extend([
                "Purchase invoice/receipt",
                "Product warranty card",
                "Communication with seller/service provider",
                "Defect evidence (photos/videos)"
            ])
        elif classification.offense_category == "civil":
            documents.extend([
                "Relevant contracts/agreements",
                "Correspondence records",
                "Financial documents",
                "Property documents (if applicable)"
            ])
        
        return documents
    
    def _generate_next_steps(
        self,
        classification: IncidentClassification,
        legal_sections: List[LegalSection]
    ) -> List[str]:
        """
        Generate next steps for the user
        
        Args:
            classification: Incident classification
            legal_sections: Legal sections
            
        Returns:
            List of next steps
        """
        steps = []
        
        # Check if cognizable offense
        is_cognizable = any(s.is_cognizable for s in legal_sections if s.is_cognizable is not None)
        
        if classification.offense_category == "criminal":
            if is_cognizable:
                steps.append("File an FIR at the nearest police station immediately")
                steps.append("Request a copy of the FIR for your records")
            else:
                steps.append("File a complaint with the magistrate")
            
            steps.append("Gather and preserve all evidence")
            steps.append("Consult with a criminal lawyer")
            
        elif classification.offense_category == "cyber":
            steps.append("Report on National Cybercrime Portal (cybercrime.gov.in)")
            steps.append("File FIR at local police station or cyber cell")
            steps.append("Preserve all digital evidence")
            steps.append("Consult with a cyber law expert")
            
        elif classification.offense_category == "consumer":
            steps.append("Send a legal notice to the seller/service provider")
            steps.append("File complaint with Consumer Forum within 2 years")
            steps.append("Gather purchase proof and defect evidence")
            
        elif classification.offense_category == "civil":
            steps.append("Send a legal notice to the other party")
            steps.append("Attempt mediation if possible")
            steps.append("Consult with a civil lawyer")
            steps.append("Prepare to file a civil suit if notice is not responded to")
        
        # Add severity-based steps
        if classification.severity_level in ["high", "critical"]:
            steps.insert(0, "[URGENT] This is a serious matter - seek immediate legal assistance")
            
            if any(indicator in classification.threat_indicators 
                   for indicator in ["violence", "threat", "harassment"]):
                steps.insert(1, "Consider seeking protection order if you feel unsafe")
        
        return steps


# Singleton instance
_legal_extraction_engine: Optional[LegalExtractionEngine] = None


def get_legal_extraction_engine() -> LegalExtractionEngine:
    """
    Get singleton instance of legal extraction engine
    
    Returns:
        LegalExtractionEngine instance
    """
    global _legal_extraction_engine
    if _legal_extraction_engine is None:
        _legal_extraction_engine = LegalExtractionEngine()
    return _legal_extraction_engine
