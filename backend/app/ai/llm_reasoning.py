"""
LLM Reasoning for Legal Analysis
Uses OpenAI GPT-4 or Google Gemini for contextual reasoning
"""
import logging
from typing import List, Dict, Any
import json

from app.config import settings
from app.ai.legal_extraction import LegalSection, IncidentClassification
from app.core.exceptions import AIProcessingError

# Import customizable prompts
try:
    from app.ai.prompts_config import (
        LEGAL_ANALYSIS_PROMPT,
        SIMPLE_ANALYSIS_PROMPT,
        CUSTOM_PROMPT_TEMPLATE,
        ACTIVE_PROMPT,
        FIR_DRAFT_PROMPT,
        SECTION_REFINEMENT_PROMPT
    )
except ImportError:
    # Fallback if prompts_config doesn't exist
    LEGAL_ANALYSIS_PROMPT = None
    ACTIVE_PROMPT = "DEFAULT"

logger = logging.getLogger(__name__)


class LLMReasoning:
    """
    LLM-based reasoning for legal analysis
    """
    
    def __init__(self):
        """Initialize LLM client"""
        self.client = None
        self.model = settings.AI_MODEL
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize LLM client (OpenAI or Google AI)"""
        try:
            if settings.OPENAI_API_KEY:
                from openai import OpenAI
                self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
                self.provider = "openai"
                logger.info("Initialized OpenAI client")
            elif settings.GOOGLE_AI_API_KEY:
                import google.generativeai as genai
                genai.configure(api_key=settings.GOOGLE_AI_API_KEY)
                self.client = genai.GenerativeModel('gemini-pro')
                self.provider = "google"
                logger.info("Initialized Google AI client")
            else:
                logger.warning("No AI API key configured, LLM reasoning will use fallback")
                self.provider = "fallback"
        except Exception as e:
            logger.error(f"Failed to initialize LLM client: {e}")
            self.provider = "fallback"
    
    async def refine_legal_sections(
        self,
        incident_text: str,
        classification: IncidentClassification,
        vector_results: List[Dict[str, Any]]
    ) -> List[LegalSection]:
        """
        Refine and explain legal sections using LLM
        
        Args:
            incident_text: Incident description
            classification: Classification result
            vector_results: Results from vector search
            
        Returns:
            List of refined legal sections with reasoning
        """
        if self.provider == "fallback":
            return self._fallback_refine_sections(vector_results)
        
        try:
            # Prepare prompt
            prompt = self._create_section_refinement_prompt(
                incident_text,
                classification,
                vector_results
            )
            
            # Get LLM response
            if self.provider == "openai":
                response = await self._call_openai(prompt)
            else:
                response = await self._call_google(prompt)
            
            # Parse response
            sections = self._parse_section_response(response, vector_results)
            
            return sections
            
        except Exception as e:
            logger.error(f"LLM refinement failed: {e}")
            return self._fallback_refine_sections(vector_results)
    
    async def generate_analysis_summary(
        self,
        incident_text: str,
        classification: IncidentClassification,
        legal_sections: List[LegalSection]
    ) -> str:
        """
        Generate AI summary of legal analysis
        
        Args:
            incident_text: Incident description
            classification: Classification result
            legal_sections: Legal sections found
            
        Returns:
            AI-generated summary
        """
        if self.provider == "fallback":
            return self._fallback_summary(classification, legal_sections)
        
        try:
            prompt = self._create_summary_prompt(incident_text, classification, legal_sections)
            
            if self.provider == "openai":
                summary = await self._call_openai(prompt)
            else:
                summary = await self._call_google(prompt)
            
            return summary
            
        except Exception as e:
            logger.error(f"Summary generation failed: {e}")
            return self._fallback_summary(classification, legal_sections)
    
    async def generate_fir_draft(
        self,
        incident_text: str,
        classification: IncidentClassification,
        legal_sections: List[LegalSection],
        user_details: Dict[str, Any]
    ) -> str:
        """
        Generate FIR draft
        
        Args:
            incident_text: Incident description
            classification: Classification result
            legal_sections: Legal sections
            user_details: User information
            
        Returns:
            FIR draft text
        """
        if self.provider == "fallback":
            return self._fallback_fir_draft(incident_text, user_details)
        
        try:
            prompt = self._create_fir_draft_prompt(
                incident_text,
                classification,
                legal_sections,
                user_details
            )
            
            if self.provider == "openai":
                fir_draft = await self._call_openai(prompt)
            else:
                fir_draft = await self._call_google(prompt)
            
            return fir_draft
            
        except Exception as e:
            logger.error(f"FIR draft generation failed: {e}")
            return self._fallback_fir_draft(incident_text, user_details)
    
    def _create_section_refinement_prompt(
        self,
        incident_text: str,
        classification: IncidentClassification,
        vector_results: List[Dict[str, Any]]
    ) -> str:
        """Create prompt for section refinement"""
        sections_text = "\n".join([
            f"{i+1}. {r['payload']['act_name']} Section {r['payload']['section_number']}: "
            f"{r['payload']['section_title']}"
            for i, r in enumerate(vector_results[:10])
        ])
        
        return f"""You are a legal expert analyzing an incident under Indian law.

Incident: {incident_text}

Classification: {classification.offense_type} ({classification.offense_category})
Severity: {classification.severity_level}

Potentially relevant legal sections:
{sections_text}

For each relevant section, provide:
1. Why it applies to this incident
2. Relevance score (0.0 to 1.0)

Return ONLY a JSON array with this structure:
[
  {{
    "section_number": "378",
    "act_name": "IPC",
    "relevance_score": 0.9,
    "reasoning": "This section applies because..."
  }}
]

Focus on the most relevant 3-5 sections."""
    
    def _create_summary_prompt(
        self,
        incident_text: str,
        classification: IncidentClassification,
        location: str = None,
        incident_date: str = None
    ) -> str:
        """Create prompt for summary generation using customizable template"""
        
        # Use custom prompt if available
        if ACTIVE_PROMPT == "LEGAL_ANALYSIS_PROMPT" and LEGAL_ANALYSIS_PROMPT:
            return LEGAL_ANALYSIS_PROMPT.format(
                incident_text=incident_text,
                location=location or "Not specified",
                incident_date=incident_date or "Not specified",
                offense_type=classification.offense_type,
                offense_category=classification.offense_category,
                severity=classification.severity_level
            )
        elif ACTIVE_PROMPT == "SIMPLE_ANALYSIS_PROMPT" and SIMPLE_ANALYSIS_PROMPT:
            return SIMPLE_ANALYSIS_PROMPT.format(
                incident_text=incident_text
            )
        elif ACTIVE_PROMPT == "CUSTOM_PROMPT_TEMPLATE" and CUSTOM_PROMPT_TEMPLATE:
            return CUSTOM_PROMPT_TEMPLATE.format(
                incident_text=incident_text,
                location=location or "Not specified",
                incident_date=incident_date or "Not specified",
                offense_type=classification.offense_type,
                offense_category=classification.offense_category,
                severity=classification.severity_level
            )
        
        # Default fallback prompt
        sections_text = "Analysis in progress"
        
        return f"""Provide a brief legal analysis summary (2-3 paragraphs) for this incident:

Incident: {incident_text}

Offense Type: {classification.offense_type}
Category: {classification.offense_category}
Severity: {classification.severity_level}

Write a clear, professional summary explaining:
1. What legal violations occurred
2. Which laws apply and why
3. Potential legal consequences
4. Recommended immediate actions

Keep it concise and user-friendly."""
    
    def _create_fir_draft_prompt(
        self,
        incident_text: str,
        classification: IncidentClassification,
        legal_sections: List[LegalSection],
        user_details: Dict[str, Any]
    ) -> str:
        """Create prompt for FIR draft"""
        sections_text = ", ".join([
            f"{s.act_name} {s.section_number}"
            for s in legal_sections[:5]
        ])
        
        return f"""Draft a formal FIR (First Information Report) in proper format:

Complainant Details:
Name: {user_details.get('name', '[Name]')}
Address: {user_details.get('address', '[Address]')}
Phone: {user_details.get('phone', '[Phone]')}

Incident Details:
{incident_text}

Applicable Sections: {sections_text}

Format the FIR professionally with:
1. Subject line
2. Formal complaint text
3. Details of the incident
4. Request for action under relevant sections
5. Verification statement

Use formal legal language appropriate for Indian police stations."""
    
    async def _call_openai(self, prompt: str) -> str:
        """Call OpenAI API"""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a legal expert specializing in Indian law."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=2000
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"OpenAI API call failed: {e}")
            raise
    
    async def _call_google(self, prompt: str) -> str:
        """Call Google AI API"""
        try:
            response = self.client.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Google AI API call failed: {e}")
            raise
    
    def _parse_section_response(
        self,
        response: str,
        vector_results: List[Dict[str, Any]]
    ) -> List[LegalSection]:
        """Parse LLM response into legal sections"""
        try:
            # Extract JSON from response
            json_start = response.find('[')
            json_end = response.rfind(']') + 1
            json_str = response[json_start:json_end]
            
            parsed = json.loads(json_str)
            
            sections = []
            for item in parsed:
                # Find matching section from vector results
                matching = next(
                    (r for r in vector_results 
                     if r['payload']['section_number'] == item['section_number']),
                    None
                )
                
                if matching:
                    payload = matching['payload']
                    sections.append(LegalSection(
                        act_name=payload['act_name'],
                        section_number=payload['section_number'],
                        section_title=payload.get('section_title', ''),
                        section_description=payload.get('section_description', ''),
                        relevance_score=item.get('relevance_score', 0.7),
                        reasoning=item.get('reasoning', ''),
                        is_cognizable=payload.get('is_cognizable'),
                        is_bailable=payload.get('is_bailable'),
                        punishment_description=payload.get('punishment_description')
                    ))
            
            return sections
            
        except Exception as e:
            logger.warning(f"Failed to parse LLM response: {e}")
            return self._fallback_refine_sections(vector_results)
    
    def _fallback_refine_sections(
        self,
        vector_results: List[Dict[str, Any]]
    ) -> List[LegalSection]:
        """Fallback section refinement without LLM"""
        sections = []
        
        for result in vector_results[:5]:
            payload = result['payload']
            sections.append(LegalSection(
                act_name=payload['act_name'],
                section_number=payload['section_number'],
                section_title=payload.get('section_title', ''),
                section_description=payload.get('section_description', ''),
                relevance_score=result['score'],
                reasoning="This section may be relevant based on similarity to your incident.",
                is_cognizable=payload.get('is_cognizable'),
                is_bailable=payload.get('is_bailable'),
                punishment_description=payload.get('punishment_description')
            ))
        
        return sections
    
    def _fallback_summary(
        self,
        classification: IncidentClassification,
        legal_sections: List[LegalSection]
    ) -> str:
        """Fallback summary without LLM"""
        summary = f"Based on the incident description, this appears to be a case of {classification.offense_type} "
        summary += f"under {classification.offense_category} law with {classification.severity_level} severity.\n\n"
        
        if legal_sections:
            summary += "The following legal sections may apply:\n"
            for section in legal_sections[:3]:
                summary += f"- {section.act_name} Section {section.section_number}: {section.section_title}\n"
        
        summary += "\nPlease consult with a legal professional for detailed advice specific to your situation."
        
        return summary
    
    def _fallback_fir_draft(
        self,
        incident_text: str,
        user_details: Dict[str, Any]
    ) -> str:
        """Fallback FIR draft without LLM"""
        return f"""FIRST INFORMATION REPORT

To,
The Station House Officer,
[Police Station Name]
[Address]

Subject: Complaint regarding incident

Respected Sir/Madam,

I, {user_details.get('name', '[Your Name]')}, resident of {user_details.get('address', '[Your Address]')}, 
would like to bring to your notice the following incident:

{incident_text}

I request you to kindly register an FIR and take necessary legal action against the accused.

Thanking you,

Date: [Date]
Place: [Place]

Signature
{user_details.get('name', '[Your Name]')}
Contact: {user_details.get('phone', '[Phone Number]')}
"""
