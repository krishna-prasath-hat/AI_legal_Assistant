"""
Database Models for Legal Cases
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database import Base


class CaseStatus(str, enum.Enum):
    """Case status enumeration"""
    DRAFT = "draft"
    ACTIVE = "active"
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


class CaseType(str, enum.Enum):
    """Case type enumeration"""
    CRIMINAL = "criminal"
    CIVIL = "civil"
    FAMILY = "family"
    CONSUMER = "consumer"
    CYBER = "cyber"
    PROPERTY = "property"
    OTHER = "other"


class Case(Base):
    """Legal Case Model"""
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String(100), unique=True, index=True, nullable=False)
    
    # User information
    user_id = Column(String(100), index=True, nullable=False)  # From auth system
    user_name = Column(String(200), nullable=False)
    user_email = Column(String(200), nullable=False)
    user_phone = Column(String(20))
    
    # Case details
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    case_type = Column(SQLEnum(CaseType), nullable=False)
    status = Column(SQLEnum(CaseStatus), default=CaseStatus.DRAFT, nullable=False)
    
    # Legal information
    incident_date = Column(DateTime)
    location = Column(String(500))
    police_station = Column(String(200))
    fir_number = Column(String(100))
    
    # Lawyer assignment
    lawyer_id = Column(String(100), index=True)
    lawyer_name = Column(String(200))
    lawyer_email = Column(String(200))
    lawyer_phone = Column(String(20))
    
    # Court information
    court_name = Column(String(300))
    court_case_number = Column(String(100))
    next_hearing_date = Column(DateTime)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    closed_at = Column(DateTime)
    
    # Relationships
    updates = relationship("CaseUpdate", back_populates="case", cascade="all, delete-orphan")
    documents = relationship("CaseDocument", back_populates="case", cascade="all, delete-orphan")
    followups = relationship("CaseFollowUp", back_populates="case", cascade="all, delete-orphan")


class CaseUpdate(Base):
    """Case Update/Note Model"""
    __tablename__ = "case_updates"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    
    # Update information
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=False)
    update_type = Column(String(50), default="general")  # general, hearing, document, status_change
    
    # Who created the update
    created_by_id = Column(String(100), nullable=False)
    created_by_name = Column(String(200), nullable=False)
    created_by_role = Column(String(50), nullable=False)  # user, lawyer, admin
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationship
    case = relationship("Case", back_populates="updates")


class CaseDocument(Base):
    """Case Document Model"""
    __tablename__ = "case_documents"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    
    # Document information
    title = Column(String(300), nullable=False)
    description = Column(Text)
    file_name = Column(String(500), nullable=False)
    file_path = Column(String(1000), nullable=False)
    file_size = Column(Integer)  # in bytes
    file_type = Column(String(100))  # pdf, jpg, png, doc, etc.
    document_type = Column(String(100))  # fir, evidence, court_order, etc.
    
    # Who uploaded
    uploaded_by_id = Column(String(100), nullable=False)
    uploaded_by_name = Column(String(200), nullable=False)
    uploaded_by_role = Column(String(50), nullable=False)  # user, lawyer, admin
    
    # Metadata
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationship
    case = relationship("Case", back_populates="documents")


class FollowUpType(str, enum.Enum):
    """Follow-up type enumeration"""
    HEARING = "hearing"
    COURT_DATE = "court_date"
    DOCUMENT_SUBMISSION = "document_submission"
    LAWYER_MEETING = "lawyer_meeting"
    EVIDENCE_COLLECTION = "evidence_collection"
    WITNESS_INTERVIEW = "witness_interview"
    OTHER = "other"


class FollowUpStatus(str, enum.Enum):
    """Follow-up status enumeration"""
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    POSTPONED = "postponed"
    CANCELLED = "cancelled"


class CaseFollowUp(Base):
    """Case Follow-up Model for tracking hearings and other events"""
    __tablename__ = "case_followups"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    
    # Follow-up details
    title = Column(String(300), nullable=False)
    description = Column(Text)
    followup_type = Column(SQLEnum(FollowUpType), nullable=False)
    status = Column(SQLEnum(FollowUpStatus), default=FollowUpStatus.SCHEDULED, nullable=False)
    
    # Date and time
    scheduled_date = Column(DateTime, nullable=False)
    completed_date = Column(DateTime)
    
    # Hearing-specific fields
    court_name = Column(String(300))
    judge_name = Column(String(200))
    hearing_type = Column(String(100))  # preliminary, final, evidence, arguments, etc.
    case_number = Column(String(100))  # Court case number
    
    # Location
    location = Column(String(500))
    room_number = Column(String(50))
    
    # Outcome and notes
    outcome = Column(Text)  # Result of the hearing/meeting
    next_steps = Column(Text)  # What needs to be done next
    
    # Reminders
    reminder_sent = Column(Boolean, default=False)
    
    # Who created
    created_by_id = Column(String(100), nullable=False)
    created_by_name = Column(String(200), nullable=False)
    created_by_role = Column(String(50), nullable=False)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationship
    case = relationship("Case", back_populates="followups")


class LawyerProfile(Base):
    """Lawyer Profile Model"""
    __tablename__ = "lawyer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    enrollment_number = Column(String(100), unique=True, index=True)
    bar_council_state = Column(String(100))
    enrollment_date = Column(DateTime)
    
    # Location
    city = Column(String(100), index=True)
    state = Column(String(100))
    office_address = Column(Text)
    
    # Professional
    practice_areas = Column(Text)  # Comma separated
    languages_known = Column(Text) # Comma separated
    courts_practicing_in = Column(Text)
    
    # Contact (Optional in data)
    email = Column(String(255))
    phone = Column(String(20))
    
    # Education/Other
    law_degree = Column(String(255))
    law_school = Column(String(255))
    gender = Column(String(20))
    
    # Status
    profile_verified = Column(Boolean, default=False)
    profile_claimed = Column(Boolean, default=False)
    data_source = Column(String(100))
    is_active = Column(Boolean, default=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Alias properties for consistency with frontend/API if needed
    @property
    def name(self):
        return self.full_name

    @property
    def languages(self):
        return self.languages_known

    @property
    def address(self):
        return self.office_address


class AppointmentStatus(str, enum.Enum):
    """Appointment status enumeration"""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Appointment(Base):
    """Appointment Model"""
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    
    # User info
    user_id = Column(String(100), index=True, nullable=False)
    user_name = Column(String(200), nullable=False)
    user_email = Column(String(200)) # Optional
    
    # Lawyer info
    lawyer_id = Column(Integer, ForeignKey("lawyer_profiles.id"), nullable=False)
    
    # Slot info
    appointment_date = Column(String(50), nullable=False) # Storing as string for simplicity with mock data 'Tomorrow', etc. or proper date
    slot_time = Column(String(20), nullable=False)
    appointment_type = Column(String(100), nullable=False)
    mode = Column(String(50), default="Video Call")
    
    status = Column(SQLEnum(AppointmentStatus), default=AppointmentStatus.CONFIRMED.value, nullable=False)
    
    notes = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    lawyer = relationship("LawyerProfile")

