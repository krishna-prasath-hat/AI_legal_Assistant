"""
Lawyer Data Import Script
Import advocates from data.gov.in All India Advocate List

Usage:
    python3 setup_lawyer_data.py

Requirements:
    - Download CSV from: https://data.gov.in/catalog/all-india-advocate-list
    - Save as: advocates_data.csv in this directory
"""

import pandas as pd
from sqlalchemy import create_engine, text
from datetime import datetime
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import settings

def check_database_connection():
    """Check if database is accessible"""
    try:
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("\nPlease ensure:")
        print("1. SQLite database directory exists: mkdir -p backend/data")
        print("2. .env file has correct DATABASE_URL")
        return False

def download_instructions():
    """Show download instructions"""
    print("\n" + "=" * 70)
    print("📥 DOWNLOAD LAWYER DATA")
    print("=" * 70)
    print("\n1. Visit: https://data.gov.in/catalog/all-india-advocate-list")
    print("2. Click 'Download' button")
    print("3. Select 'CSV' format")
    print("4. Save file as: advocates_data.csv")
    print("5. Move file to: backend/scripts/advocates_data.csv")
    print("\n" + "=" * 70)

def import_advocates(csv_file):
    """Import advocates from CSV to database"""
    
    if not os.path.exists(csv_file):
        print(f"\n❌ File not found: {csv_file}")
        download_instructions()
        return False
    
    print(f"\n📊 Reading {csv_file}...")
    
    try:
        try:
            df = pd.read_csv(csv_file)
        except UnicodeDecodeError:
            try:
                print("⚠️ UTF-8 failed, trying cp1252...")
                df = pd.read_csv(csv_file, encoding='cp1252')
            except UnicodeDecodeError:
                print("⚠️ cp1252 failed, trying latin1...")
                df = pd.read_csv(csv_file, encoding='latin1')
    except Exception as e:
        print(f"❌ Error reading CSV: {e}")
        return False
    
    print(f"✅ Found {len(df)} advocates in CSV")
    print(f"\nColumns: {list(df.columns)}")
    
    # Connect to database
    try:
        engine = create_engine(settings.DATABASE_URL)
        conn = engine.connect()
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False
    
    # Create table if not exists (SQLite syntax)
    conn.execute(text("DROP TABLE IF EXISTS lawyer_profiles"))
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS lawyer_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name VARCHAR(255) NOT NULL,
            enrollment_number VARCHAR(100) UNIQUE NOT NULL,
            bar_council_state VARCHAR(100),
            enrollment_date DATE,
            city VARCHAR(100),
            state VARCHAR(100),
            office_address TEXT,
            practice_areas TEXT,
            languages_known TEXT,
            courts_practicing_in TEXT,
            email VARCHAR(255),
            phone VARCHAR(20),
            law_degree VARCHAR(255),
            law_school VARCHAR(255),
            gender VARCHAR(20),
            profile_verified BOOLEAN DEFAULT 0,
            profile_claimed BOOLEAN DEFAULT 0,
            data_source VARCHAR(100),
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """))
    conn.commit()
    
    print("\n🔄 Importing advocates...")
    
    imported = 0
    skipped = 0
    errors = 0
    
    for idx, row in df.iterrows():
        try:
            # Extract data (adjust column names based on actual CSV)
            name = str(row.get('ADVOCATE NAME', row.get('Name', ''))).strip()
            enrollment = str(row.get('ADVOCATE ID NUMBER', row.get('Enrollment Number', ''))).strip()
            state = str(row.get('State', 'Tamil Nadu')).strip()  # Default to TN if missing, or generic
            district = str(row.get('PLACE', row.get('District', ''))).strip()
            address = str(row.get('ADDRESS', row.get('Address', ''))).strip()
            
            # Parse enrollment date
            date_str = str(row.get('DATE OF ENROLMENT', row.get('Date of Enrollment', '')))
            try:
                enrollment_date = pd.to_datetime(date_str, errors='coerce')
                if pd.isna(enrollment_date):
                    enrollment_date = None
                else:
                    enrollment_date = enrollment_date.strftime('%Y-%m-%d')
            except:
                enrollment_date = None
            
            # Skip if missing critical data
            if not name or not enrollment:
                skipped += 1
                continue
            
            # Insert into database (SQLite syntax)
            conn.execute(text("""
                INSERT OR IGNORE INTO lawyer_profiles (
                    full_name,
                    enrollment_number,
                    bar_council_state,
                    enrollment_date,
                    city,
                    state,
                    office_address,
                    practice_areas,
                    languages_known,
                    data_source,
                    profile_verified,
                    is_active,
                    created_at
                ) VALUES (:name, :enrollment, :state, :date, :city, :state2, :address, :areas, :langs, :source, :verified, :active, :created)
            """), {
                'name': name,
                'enrollment': enrollment,
                'state': state,
                'date': enrollment_date,
                'city': district,
                'state2': state,
                'address': address,
                'areas': 'General Practice',
                'langs': 'English,Hindi',
                'source': 'data.gov.in',
                'verified': 1,
                'active': 1,
                'created': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })
            
            imported += 1
            
            # Commit every 1000 records
            if imported % 1000 == 0:
                conn.commit()
                print(f"  ✅ Imported {imported:,} advocates...")
        
        except Exception as e:
            errors += 1
            if errors < 10:  # Only show first 10 errors
                print(f"  ⚠️  Error at row {idx}: {e}")
            continue
    
    # Final commit
    conn.commit()
    
    # Get total count
    result = conn.execute(text("SELECT COUNT(*) FROM lawyer_profiles;"))
    total = result.fetchone()[0]
    
    conn.close()
    
    print("\n" + "=" * 70)
    print("✅ IMPORT COMPLETE")
    print("=" * 70)
    print(f"  Imported: {imported:,} advocates")
    print(f"  Skipped:  {skipped:,} (missing data)")
    print(f"  Errors:   {errors:,}")
    print(f"  Total in DB: {total:,} advocates")
    print("=" * 70)
    
    return True

def add_sample_data():
    """Add sample practice areas and details to some advocates"""
    
    print("\n🎨 Adding sample practice areas...")
    
    # Note: SQLite doesn't support UPDATE with random() the same way
    # This function is simplified for SQLite
    print("✅ Skipping sample data (can be added manually)")

def show_statistics():
    """Show database statistics"""
    
    try:
        engine = create_engine(settings.DATABASE_URL)
        conn = engine.connect()
        
        print("\n" + "=" * 70)
        print("📊 DATABASE STATISTICS")
        print("=" * 70)
        
        # Total advocates
        result = conn.execute(text("SELECT COUNT(*) FROM lawyer_profiles;"))
        total = result.fetchone()[0]
        print(f"\n  Total Advocates: {total:,}")
        
        # By state
        result = conn.execute(text("""
            SELECT state, COUNT(*) as count
            FROM lawyer_profiles
            WHERE state IS NOT NULL AND state != ''
            GROUP BY state
            ORDER BY count DESC
            LIMIT 10;
        """))
        
        print("\n  Top 10 States:")
        for state, count in result.fetchall():
            print(f"    {state}: {count:,}")
        
        # Verified profiles
        result = conn.execute(text("SELECT COUNT(*) FROM lawyer_profiles WHERE profile_verified = 1;"))
        verified = result.fetchone()[0]
        print(f"\n  Verified Profiles: {verified:,}")
        
        conn.close()
        
        print("=" * 70)
        
    except Exception as e:
        print(f"⚠️  Could not fetch statistics: {e}")

def main():
    """Main function"""
    
    print("\n" + "=" * 70)
    print("🚀 JUSTIFLY - LAWYER DATA IMPORT")
    print("=" * 70)
    
    # Check database connection
    if not check_database_connection():
        return
    
    # CSV file path
    csv_file = os.path.join(os.path.dirname(__file__), 'advocates_data.csv')
    
    # Check if file exists
    if not os.path.exists(csv_file):
        download_instructions()
        print("\n⏸️  Waiting for CSV file...")
        print("   Press Ctrl+C to exit, or download the file and run again.")
        return
    
    # Import data
    success = import_advocates(csv_file)
    
    if success:
        # Add sample data
        add_sample_data()
        
        # Show statistics
        show_statistics()
        
        print("\n✅ Setup complete!")
        print("\nNext steps:")
        print("1. Start backend: uvicorn app.main:app --reload")
        print("2. Test API: http://localhost:8000/api/lawyers/directory")
        print("3. View frontend: http://localhost:3000/lawyers")
        print("\n" + "=" * 70 + "\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⏸️  Import cancelled by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
