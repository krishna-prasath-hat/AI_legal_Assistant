"""
Vector Search for Legal Sections
Uses Qdrant for semantic similarity search
"""
import logging
from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
from sentence_transformers import SentenceTransformer
import numpy as np

from app.config import settings
from app.ai.legal_extraction import LegalSection
from app.core.exceptions import AIProcessingError

logger = logging.getLogger(__name__)


class VectorSearch:
    """
    Vector search for finding relevant legal sections
    """
    
    def __init__(self):
        """Initialize vector search"""
        self.client = None
        self.encoder = None
        self.collection_name = settings.QDRANT_COLLECTION_NAME
        self._initialize()
    
    def _initialize(self):
        """Initialize Qdrant client and encoder"""
        try:
            # Initialize Qdrant client
            self.client = QdrantClient(
                url=settings.QDRANT_URL,
                api_key=settings.QDRANT_API_KEY if settings.QDRANT_API_KEY else None
            )
            
            # Initialize sentence transformer
            self.encoder = SentenceTransformer('all-MiniLM-L6-v2')
            
            # Create collection if it doesn't exist
            self._ensure_collection_exists()
            
            logger.info("Vector search initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize vector search: {e}")
            # Don't raise - allow graceful degradation
    
    def _ensure_collection_exists(self):
        """Create collection if it doesn't exist"""
        try:
            collections = self.client.get_collections().collections
            collection_names = [c.name for c in collections]
            
            if self.collection_name not in collection_names:
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=384,  # all-MiniLM-L6-v2 dimension
                        distance=Distance.COSINE
                    )
                )
                logger.info(f"Created collection: {self.collection_name}")
        except Exception as e:
            logger.warning(f"Could not ensure collection exists: {e}")
    
    async def search_legal_sections(
        self,
        query_text: str,
        offense_type: Optional[str] = None,
        top_k: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Search for relevant legal sections
        
        Args:
            query_text: Query text (incident description)
            offense_type: Optional offense type filter
            top_k: Number of results to return
            
        Returns:
            List of legal section results with scores
        """
        if not self.client or not self.encoder:
            logger.warning("Vector search not available, returning empty results")
            return self._get_fallback_sections(offense_type)
        
        try:
            # Encode query
            query_vector = self.encoder.encode(query_text).tolist()
            
            # Build filter
            search_filter = None
            if offense_type:
                search_filter = Filter(
                    must=[
                        FieldCondition(
                            key="offense_type",
                            match=MatchValue(value=offense_type)
                        )
                    ]
                )
            
            # Search
            results = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                query_filter=search_filter,
                limit=top_k
            )
            
            # Convert to our format
            sections = []
            for result in results:
                sections.append({
                    "id": result.id,
                    "score": result.score,
                    "payload": result.payload
                })
            
            return sections
            
        except Exception as e:
            logger.error(f"Vector search failed: {e}")
            return self._get_fallback_sections(offense_type)
    
    def _get_fallback_sections(self, offense_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get fallback legal sections when vector search is unavailable
        
        Args:
            offense_type: Offense type
            
        Returns:
            List of fallback sections
        """
        # Common IPC sections by offense type
        fallback_data = {
            "theft": [
                {
                    "act_name": "IPC",
                    "section_number": "378",
                    "section_title": "Theft",
                    "section_description": "Whoever, intending to take dishonestly any movable property out of the possession of any person without that person's consent, moves that property in order to such taking, is said to commit theft.",
                    "is_cognizable": True,
                    "is_bailable": False,
                    "punishment_description": "Imprisonment up to 3 years or fine or both"
                },
                {
                    "act_name": "IPC",
                    "section_number": "379",
                    "section_title": "Punishment for theft",
                    "section_description": "Whoever commits theft shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.",
                    "is_cognizable": True,
                    "is_bailable": False,
                    "punishment_description": "Imprisonment up to 3 years or fine or both"
                }
            ],
            "fraud": [
                {
                    "act_name": "IPC",
                    "section_number": "420",
                    "section_title": "Cheating and dishonestly inducing delivery of property",
                    "section_description": "Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, or anything which is signed or sealed, and which is capable of being converted into a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.",
                    "is_cognizable": True,
                    "is_bailable": False,
                    "punishment_description": "Imprisonment up to 7 years and fine"
                }
            ],
            "assault": [
                {
                    "act_name": "IPC",
                    "section_number": "323",
                    "section_title": "Punishment for voluntarily causing hurt",
                    "section_description": "Whoever, except in the case provided for by section 334, voluntarily causes hurt, shall be punished with imprisonment of either description for a term which may extend to one year, or with fine which may extend to one thousand rupees, or with both.",
                    "is_cognizable": True,
                    "is_bailable": True,
                    "punishment_description": "Imprisonment up to 1 year or fine up to Rs. 1000 or both"
                },
                {
                    "act_name": "IPC",
                    "section_number": "325",
                    "section_title": "Punishment for voluntarily causing grievous hurt",
                    "section_description": "Whoever, except in the case provided for by section 335, voluntarily causes grievous hurt, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.",
                    "is_cognizable": True,
                    "is_bailable": False,
                    "punishment_description": "Imprisonment up to 7 years and fine"
                }
            ],
            "cybercrime": [
                {
                    "act_name": "IT Act",
                    "section_number": "66C",
                    "section_title": "Punishment for identity theft",
                    "section_description": "Whoever, fraudulently or dishonestly make use of the electronic signature, password or any other unique identification feature of any other person, shall be punished with imprisonment of either description for a term which may extend to three years and shall also be liable to fine which may extend to rupees one lakh.",
                    "is_cognizable": True,
                    "is_bailable": False,
                    "punishment_description": "Imprisonment up to 3 years and fine up to Rs. 1 lakh"
                },
                {
                    "act_name": "IT Act",
                    "section_number": "66D",
                    "section_title": "Punishment for cheating by personation by using computer resource",
                    "section_description": "Whoever, by means of any communication device or computer resource cheats by personation, shall be punished with imprisonment of either description for a term which may extend to three years and shall also be liable to fine which may extend to one lakh rupees.",
                    "is_cognizable": True,
                    "is_bailable": False,
                    "punishment_description": "Imprisonment up to 3 years and fine up to Rs. 1 lakh"
                }
            ],
            "harassment": [
                {
                    "act_name": "IPC",
                    "section_number": "354",
                    "section_title": "Assault or criminal force to woman with intent to outrage her modesty",
                    "section_description": "Whoever assaults or uses criminal force to any woman, intending to outrage or knowing it to be likely that he will thereby outrage her modesty, shall be punished with imprisonment of either description for a term which shall not be less than one year but which may extend to five years, and shall also be liable to fine.",
                    "is_cognizable": True,
                    "is_bailable": False,
                    "punishment_description": "Imprisonment 1-5 years and fine"
                },
                {
                    "act_name": "IPC",
                    "section_number": "509",
                    "section_title": "Word, gesture or act intended to insult the modesty of a woman",
                    "section_description": "Whoever, intending to insult the modesty of any woman, utters any word, makes any sound or gesture, or exhibits any object, intending that such word or sound shall be heard, or that such gesture or object shall be seen, by such woman, or intrudes upon the privacy of such woman, shall be punished with simple imprisonment for a term which may extend to three years, and also with fine.",
                    "is_cognizable": True,
                    "is_bailable": True,
                    "punishment_description": "Simple imprisonment up to 3 years and fine"
                }
            ]
        }
        
        sections_data = fallback_data.get(offense_type, [])
        
        return [
            {
                "id": f"fallback_{i}",
                "score": 0.7,
                "payload": section
            }
            for i, section in enumerate(sections_data)
        ]
    
    async def add_legal_section(
        self,
        section_id: str,
        act_name: str,
        section_number: str,
        section_title: str,
        section_description: str,
        offense_type: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Add a legal section to the vector database
        
        Args:
            section_id: Unique section ID
            act_name: Act name (IPC, CrPC, etc.)
            section_number: Section number
            section_title: Section title
            section_description: Section description
            offense_type: Offense type
            metadata: Additional metadata
        """
        if not self.client or not self.encoder:
            logger.warning("Vector search not available, cannot add section")
            return
        
        try:
            # Create text for embedding
            text = f"{act_name} Section {section_number}: {section_title}. {section_description}"
            
            # Generate embedding
            vector = self.encoder.encode(text).tolist()
            
            # Prepare payload
            payload = {
                "act_name": act_name,
                "section_number": section_number,
                "section_title": section_title,
                "section_description": section_description,
                "offense_type": offense_type,
                **(metadata or {})
            }
            
            # Add to collection
            self.client.upsert(
                collection_name=self.collection_name,
                points=[
                    PointStruct(
                        id=section_id,
                        vector=vector,
                        payload=payload
                    )
                ]
            )
            
            logger.info(f"Added legal section: {act_name} {section_number}")
            
        except Exception as e:
            logger.error(f"Failed to add legal section: {e}")
