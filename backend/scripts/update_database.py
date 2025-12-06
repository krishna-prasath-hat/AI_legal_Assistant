#!/usr/bin/env python3
"""
Database Update Script
Adds the case_followups table to the database
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import engine, Base
from app.models import Case, CaseUpdate, CaseDocument, CaseFollowUp, LawyerProfile, Appointment
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def update_database():
    """Create all tables including the new case_followups table"""
    try:
        logger.info("Updating database schema...")
        
        # This will create any missing tables
        Base.metadata.create_all(bind=engine)
        
        logger.info("✅ Database updated successfully!")
        logger.info("New table 'case_followups' has been created.")
        
    except Exception as e:
        logger.error(f"❌ Error updating database: {e}")
        raise

if __name__ == "__main__":
    update_database()
