"""
Incident Classification Model
Classifies incidents into offense types and categories
"""
import logging
from typing import List, Dict, Any
import re

from app.ai.legal_extraction import IncidentClassification, ExtractedEntity
from app.core.exceptions import AIProcessingError

logger = logging.getLogger(__name__)


class ClassificationModel:
    """
    Model for classifying incidents
    """
    
    # Offense type keywords
    OFFENSE_KEYWORDS = {
        "theft": ["steal", "stolen", "theft", "rob", "robbed", "robbery", "burglary", "shoplifting"],
        "fraud": ["fraud", "cheat", "cheated", "scam", "scammed", "deceive", "deceived", "forgery", "fake"],
        "assault": ["assault", "attacked", "beat", "beaten", "hit", "violence", "physical", "hurt"],
        "harassment": ["harass", "harassment", "stalk", "stalking", "threaten", "threat", "intimidate"],
        "sexual_offense": ["rape", "sexual", "molestation", "molest", "eve-teasing", "inappropriate touch"],
        "cybercrime": ["hack", "hacked", "phishing", "cyber", "online fraud", "identity theft", "data breach"],
        "defamation": ["defame", "defamation", "slander", "libel", "false accusation", "reputation"],
        "property_dispute": ["property", "land", "dispute", "boundary", "encroachment", "possession"],
        "consumer_complaint": ["defective", "product", "service", "refund", "warranty", "consumer"],
        "domestic_violence": ["domestic", "violence", "abuse", "dowry", "marital"],
        "corruption": ["bribe", "bribery", "corrupt", "corruption", "kickback"],
        "accident": ["accident", "collision", "hit and run", "negligence", "injury"],
        "kidnapping": ["kidnap", "kidnapping", "abduct", "abduction", "missing"],
        "murder": ["murder", "killed", "homicide", "death"],
        "drug_offense": ["drug", "narcotics", "substance", "possession", "trafficking"],
    }
    
    # Category mapping
    CATEGORY_MAPPING = {
        "theft": "criminal",
        "fraud": "criminal",
        "assault": "criminal",
        "harassment": "criminal",
        "sexual_offense": "criminal",
        "cybercrime": "cyber",
        "defamation": "civil",
        "property_dispute": "civil",
        "consumer_complaint": "consumer",
        "domestic_violence": "family",
        "corruption": "criminal",
        "accident": "civil",
        "kidnapping": "criminal",
        "murder": "criminal",
        "drug_offense": "criminal",
    }
    
    # Severity indicators
    SEVERITY_INDICATORS = {
        "critical": ["murder", "rape", "kidnap", "death", "killed", "life-threatening"],
        "high": ["assault", "violence", "weapon", "gun", "knife", "threat", "serious injury"],
        "medium": ["theft", "fraud", "harassment", "stalking"],
        "low": ["defamation", "minor dispute", "verbal"],
    }
    
    # Threat indicators
    THREAT_KEYWORDS = {
        "violence": ["violence", "violent", "attack", "assault", "beat", "weapon"],
        "abuse": ["abuse", "abusive", "torture", "cruel"],
        "harassment": ["harass", "stalk", "threaten", "intimidate"],
        "sexual": ["sexual", "rape", "molest", "inappropriate"],
    }
    
    def __init__(self):
        """Initialize classification model"""
        logger.info("Classification model initialized")
    
    async def classify(
        self,
        text: str,
        entities: List[ExtractedEntity]
    ) -> IncidentClassification:
        """
        Classify incident text
        
        Args:
            text: Incident text
            entities: Extracted entities
            
        Returns:
            IncidentClassification
        """
        text_lower = text.lower()
        
        # Classify offense type
        offense_type, confidence = self._classify_offense_type(text_lower)
        
        # Determine category
        offense_category = self.CATEGORY_MAPPING.get(offense_type, "criminal")
        
        # Determine severity
        severity_level = self._determine_severity(text_lower)
        
        # Extract keywords
        keywords = self._extract_keywords(text_lower)
        
        # Detect threat indicators
        threat_indicators = self._detect_threats(text_lower)
        
        return IncidentClassification(
            offense_type=offense_type,
            offense_category=offense_category,
            severity_level=severity_level,
            confidence_score=confidence,
            keywords=keywords,
            threat_indicators=threat_indicators
        )
    
    def _classify_offense_type(self, text: str) -> tuple[str, float]:
        """
        Classify the offense type
        
        Args:
            text: Lowercase incident text
            
        Returns:
            Tuple of (offense_type, confidence_score)
        """
        scores = {}
        
        for offense_type, keywords in self.OFFENSE_KEYWORDS.items():
            score = 0
            for keyword in keywords:
                if keyword in text:
                    # Weight longer keywords higher
                    score += len(keyword.split())
            
            if score > 0:
                scores[offense_type] = score
        
        if not scores:
            return "general", 0.5
        
        # Get offense type with highest score
        offense_type = max(scores, key=scores.get)
        max_score = scores[offense_type]
        
        # Calculate confidence (normalize to 0-1)
        confidence = min(0.5 + (max_score * 0.1), 0.95)
        
        return offense_type, confidence
    
    def _determine_severity(self, text: str) -> str:
        """
        Determine severity level
        
        Args:
            text: Lowercase incident text
            
        Returns:
            Severity level
        """
        for severity, keywords in self.SEVERITY_INDICATORS.items():
            for keyword in keywords:
                if keyword in text:
                    return severity
        
        return "medium"
    
    def _extract_keywords(self, text: str) -> List[str]:
        """
        Extract important keywords
        
        Args:
            text: Lowercase incident text
            
        Returns:
            List of keywords
        """
        keywords = []
        
        for offense_keywords in self.OFFENSE_KEYWORDS.values():
            for keyword in offense_keywords:
                if keyword in text and keyword not in keywords:
                    keywords.append(keyword)
        
        return keywords[:10]  # Limit to top 10
    
    def _detect_threats(self, text: str) -> List[str]:
        """
        Detect threat indicators
        
        Args:
            text: Lowercase incident text
            
        Returns:
            List of threat types detected
        """
        threats = []
        
        for threat_type, keywords in self.THREAT_KEYWORDS.items():
            for keyword in keywords:
                if keyword in text:
                    if threat_type not in threats:
                        threats.append(threat_type)
                    break
        
        return threats
