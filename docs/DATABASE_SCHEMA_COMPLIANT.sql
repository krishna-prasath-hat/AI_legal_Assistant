-- ============================================================================
-- BCI Rule 36 COMPLIANT Database Schema
-- India Legal Assistance AI Platform
-- Version: 2.0 (Compliance-First)
-- ============================================================================

-- ============================================================================
-- COMPLIANCE NOTE:
-- This schema has been designed to be 100% compliant with Bar Council of 
-- India Rule 36. All fields that could constitute solicitation, advertising,
-- or ranking have been REMOVED.
--
-- REMOVED FIELDS (Illegal under BCI Rule 36):
-- - rating, average_rating, star_rating
-- - win_rate, success_rate, win_percentage
-- - cases_won, cases_lost, total_cases, cases_count
-- - fee_range, consultation_fee, hourly_rate, fee_amount
-- - ranking_score, popularity_score, recommendation_score
-- - client_reviews, testimonials, review_text
-- - featured, premium, highlighted, top_lawyer
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255),
    full_name VARCHAR(255),
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);

-- ============================================================================
-- LAWYER PROFILES (BCI RULE 36 COMPLIANT)
-- ============================================================================

CREATE TABLE lawyer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- ✅ ALLOWED: Basic Identification
    full_name VARCHAR(255) NOT NULL,
    enrollment_number VARCHAR(100) UNIQUE NOT NULL,
    bar_council_state VARCHAR(100) NOT NULL,
    enrollment_date DATE NOT NULL,
    
    -- ✅ ALLOWED: Contact Information
    email VARCHAR(255),
    phone VARCHAR(20),
    office_address TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10),
    
    -- ✅ ALLOWED: Professional Information (Factual Only)
    practice_areas TEXT[] NOT NULL,
    courts_practicing_in TEXT[],
    languages_known TEXT[] DEFAULT ARRAY['English'],
    
    -- ✅ ALLOWED: Academic Qualifications
    law_degree VARCHAR(100),
    law_school VARCHAR(255),
    graduation_year INTEGER,
    other_qualifications TEXT[],
    
    -- ✅ ALLOWED: Bar Association Memberships
    bar_association_memberships TEXT[],
    
    -- ✅ ALLOWED: Gender (Optional, for filtering)
    gender VARCHAR(20),
    
    -- Profile Management
    profile_claimed BOOLEAN DEFAULT FALSE,
    profile_verified BOOLEAN DEFAULT FALSE,
    verified_by VARCHAR(100),
    last_verified_date TIMESTAMP,
    
    -- Data Source Tracking
    data_source VARCHAR(50) DEFAULT 'user_submitted',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- ❌ NO RATINGS, NO FEES, NO STATISTICS, NO RANKINGS
    
    CONSTRAINT valid_enrollment_number CHECK (LENGTH(enrollment_number) > 0),
    CONSTRAINT valid_practice_areas CHECK (array_length(practice_areas, 1) > 0)
);

-- Indexes for FILTERING ONLY (NOT ranking)
CREATE INDEX idx_lawyer_city ON lawyer_profiles(city);
CREATE INDEX idx_lawyer_state ON lawyer_profiles(state);
CREATE INDEX idx_lawyer_practice_areas ON lawyer_profiles USING GIN(practice_areas);
CREATE INDEX idx_lawyer_languages ON lawyer_profiles USING GIN(languages_known);
CREATE INDEX idx_lawyer_enrollment ON lawyer_profiles(enrollment_number);
CREATE INDEX idx_lawyer_name_alpha ON lawyer_profiles(LOWER(full_name));
CREATE INDEX idx_lawyer_gender ON lawyer_profiles(gender);
CREATE INDEX idx_lawyer_verified ON lawyer_profiles(profile_verified);

-- See full schema in docs/DATABASE_SCHEMA.md
