"""
Named Entity Recognition (NER) Model for Legal Entities
Uses spaCy with custom legal entity types
"""
import logging
from typing import List, Dict, Any
import re
from datetime import datetime

from app.ai.legal_extraction import ExtractedEntity
from app.core.exceptions import AIProcessingError

logger = logging.getLogger(__name__)


class NERModel:
    """
    NER model for extracting legal entities from text
    """
    
    def __init__(self):
        """Initialize NER model"""
        self.nlp = None
        self._load_model()
    
    def _load_model(self):
        """Load spaCy model"""
        try:
            import spacy
            
            # Try to load English model
            try:
                self.nlp = spacy.load("en_core_web_sm")
            except OSError:
                logger.warning("spaCy model not found, using rule-based extraction")
                self.nlp = None
                
            logger.info("NER model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load NER model: {e}")
            self.nlp = None
    
    async def extract_entities(self, text: str) -> List[ExtractedEntity]:
        """
        Extract entities from text
        
        Args:
            text: Input text
            
        Returns:
            List of extracted entities
        """
        entities = []
        
        # Use spaCy if available
        if self.nlp:
            entities.extend(self._extract_with_spacy(text))
        
        # Always use rule-based extraction as fallback/supplement
        entities.extend(self._extract_with_rules(text))
        
        # Deduplicate entities
        entities = self._deduplicate_entities(entities)
        
        return entities
    
    def _extract_with_spacy(self, text: str) -> List[ExtractedEntity]:
        """
        Extract entities using spaCy
        
        Args:
            text: Input text
            
        Returns:
            List of entities
        """
        entities = []
        
        try:
            doc = self.nlp(text)
            
            for ent in doc.ents:
                entity_type = self._map_spacy_entity_type(ent.label_)
                if entity_type:
                    entities.append(ExtractedEntity(
                        entity_type=entity_type,
                        entity_value=ent.text,
                        start_pos=ent.start_char,
                        end_pos=ent.end_char,
                        confidence=0.8
                    ))
        except Exception as e:
            logger.warning(f"spaCy extraction failed: {e}")
        
        return entities
    
    def _extract_with_rules(self, text: str) -> List[ExtractedEntity]:
        """
        Extract entities using rule-based patterns
        
        Args:
            text: Input text
            
        Returns:
            List of entities
        """
        entities = []
        
        # Extract money amounts
        money_pattern = r'(?:Rs\.?|INR|₹)\s*(\d+(?:,\d+)*(?:\.\d+)?)'
        for match in re.finditer(money_pattern, text, re.IGNORECASE):
            entities.append(ExtractedEntity(
                entity_type="MONEY",
                entity_value=match.group(0),
                start_pos=match.start(),
                end_pos=match.end(),
                confidence=0.9
            ))
        
        # Extract dates
        date_patterns = [
            r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}',  # DD/MM/YYYY or DD-MM-YYYY
            r'\d{4}[/-]\d{1,2}[/-]\d{1,2}',    # YYYY/MM/DD
            r'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}',
        ]
        for pattern in date_patterns:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                entities.append(ExtractedEntity(
                    entity_type="DATE",
                    entity_value=match.group(0),
                    start_pos=match.start(),
                    end_pos=match.end(),
                    confidence=0.85
                ))
        
        # Extract phone numbers
        phone_pattern = r'(?:\+91|0)?[6-9]\d{9}'
        for match in re.finditer(phone_pattern, text):
            entities.append(ExtractedEntity(
                entity_type="PHONE",
                entity_value=match.group(0),
                start_pos=match.start(),
                end_pos=match.end(),
                confidence=0.9
            ))
        
        # Extract email addresses
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        for match in re.finditer(email_pattern, text):
            entities.append(ExtractedEntity(
                entity_type="EMAIL",
                entity_value=match.group(0),
                start_pos=match.start(),
                end_pos=match.end(),
                confidence=0.95
            ))
        
        # Extract Aadhaar numbers (masked for privacy)
        aadhaar_pattern = r'\b\d{4}\s?\d{4}\s?\d{4}\b'
        for match in re.finditer(aadhaar_pattern, text):
            entities.append(ExtractedEntity(
                entity_type="AADHAAR",
                entity_value="XXXX XXXX " + match.group(0)[-4:],  # Mask for privacy
                start_pos=match.start(),
                end_pos=match.end(),
                confidence=0.8
            ))
        
        # Extract PAN numbers
        pan_pattern = r'\b[A-Z]{5}\d{4}[A-Z]\b'
        for match in re.finditer(pan_pattern, text):
            entities.append(ExtractedEntity(
                entity_type="PAN",
                entity_value=match.group(0),
                start_pos=match.start(),
                end_pos=match.end(),
                confidence=0.9
            ))
        
        # Extract vehicle numbers
        vehicle_pattern = r'\b[A-Z]{2}\s?\d{1,2}\s?[A-Z]{1,2}\s?\d{4}\b'
        for match in re.finditer(vehicle_pattern, text):
            entities.append(ExtractedEntity(
                entity_type="VEHICLE_NUMBER",
                entity_value=match.group(0),
                start_pos=match.start(),
                end_pos=match.end(),
                confidence=0.85
            ))
        
        # Extract case numbers
        case_pattern = r'\b(?:FIR|Case|Complaint)\s*(?:No\.?|Number)?\s*(\d+/\d{4}|\d+)\b'
        for match in re.finditer(case_pattern, text, re.IGNORECASE):
            entities.append(ExtractedEntity(
                entity_type="CASE_NUMBER",
                entity_value=match.group(0),
                start_pos=match.start(),
                end_pos=match.end(),
                confidence=0.9
            ))
        
        return entities
    
    def _map_spacy_entity_type(self, spacy_label: str) -> str:
        """
        Map spaCy entity labels to our custom types
        
        Args:
            spacy_label: spaCy entity label
            
        Returns:
            Custom entity type or None
        """
        mapping = {
            "PERSON": "PERSON",
            "ORG": "ORGANIZATION",
            "GPE": "LOCATION",
            "LOC": "LOCATION",
            "DATE": "DATE",
            "TIME": "TIME",
            "MONEY": "MONEY",
            "CARDINAL": "NUMBER",
            "ORDINAL": "NUMBER",
        }
        return mapping.get(spacy_label)
    
    def _deduplicate_entities(self, entities: List[ExtractedEntity]) -> List[ExtractedEntity]:
        """
        Remove duplicate entities
        
        Args:
            entities: List of entities
            
        Returns:
            Deduplicated list
        """
        seen = set()
        unique_entities = []
        
        for entity in entities:
            key = (entity.entity_type, entity.entity_value.lower())
            if key not in seen:
                seen.add(key)
                unique_entities.append(entity)
        
        return unique_entities
