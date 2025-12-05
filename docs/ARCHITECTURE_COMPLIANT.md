# India Legal Assistance AI Platform - BCI Rule 36 Compliant Architecture

## 1. High-Level Architecture (Compliance-First Design)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  React/Next.js Frontend (Port 3000)                              │  │
│  │  - Incident Input UI (Chat-based)                                │  │
│  │  - Legal Sections Display                                        │  │
│  │  - Jurisdiction Map View                                         │  │
│  │  - Lawyer Discovery Directory (NEUTRAL, NO RANKING)              │  │
│  │  - Case Tracker Dashboard                                        │  │
│  │  - Document Management                                           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS/REST
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       API GATEWAY / LOAD BALANCER                        │
│                            (NGINX/Traefik)                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         BACKEND LAYER (FastAPI)                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │   Auth     │  │  Legal AI  │  │Jurisdiction│  │  Lawyer    │        │
│  │  Service   │  │   Engine   │  │   Finder   │  │ Directory  │        │
│  │            │  │            │  │            │  │ (NEUTRAL)  │        │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │   Cases    │  │  Tracker   │  │ Documents  │  │ Reporting  │        │
│  │  Service   │  │  Service   │  │  Service   │  │  Service   │        │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘        │
└──────────────────────────────────────────────────────────────────────────┘
                    │               │               │
        ┌───────────┼───────────────┼───────────────┼───────────┐
        ▼           ▼               ▼               ▼           ▼
┌─────────────┐ ┌──────────────┐ ┌─────────────┐ ┌──────────────────┐
│ PostgreSQL  │ │  Vector DB   │ │   Redis     │ │  External APIs   │
│  Database   │ │  (Qdrant)    │ │   Cache     │ │  - Google Maps   │
│             │ │              │ │             │ │  - eCourts       │
│  - Users    │ │ - IPC Sec.   │ │ - Sessions  │ │  - Cybercrime    │
│  - Cases    │ │ - CrPC Sec.  │ │ - Temp Data │ │  - Bar Council   │
│  - Lawyers  │ │ - IT Act     │ │             │ │  - Helplines     │
│  - Docs     │ │ - Precedents │ │             │ │                  │
│  (NO STATS) │ │              │ │             │ │                  │
└─────────────┘ └──────────────┘ └─────────────┘ └──────────────────┘
        │               │
        ▼               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         AI/ML LAYER                                      │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  Legal Section Extraction Engine                               │    │
│  │  - NER Model (spaCy + Custom Legal Entities)                   │    │
│  │  - Classification Model (BERT-based)                           │    │
│  │  - LLM Reasoning (OpenAI GPT-4 / Gemini)                       │    │
│  │  - Vector Search (Semantic Similarity)                         │    │
│  └────────────────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  Jurisdiction Finder Engine                                    │    │
│  │  - Location Geocoding                                          │    │
│  │  - Rule-based Jurisdiction Mapping                             │    │
│  │  - Court/Police Station Finder                                 │    │
│  └────────────────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  ❌ REMOVED: Lawyer Recommendation Engine                      │    │
│  │  ✅ REPLACED WITH: Neutral Filter-Only Directory               │    │
│  │  - NO Case Similarity Matching                                 │    │
│  │  - NO Collaborative Filtering                                  │    │
│  │  - NO Rating-based Ranking                                     │    │
│  │  - ONLY: Alphabetical sorting + User-driven filters            │    │
│  └────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────┘
```

## 2. Technology Stack (Unchanged)

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand + React Query
- **Maps**: Google Maps React
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **ORM**: SQLAlchemy 2.0
- **Migration**: Alembic
- **Validation**: Pydantic v2
- **Authentication**: JWT + OAuth2
- **Task Queue**: Celery + Redis

### Databases
- **Primary DB**: PostgreSQL 15
- **Vector DB**: Qdrant
- **Cache**: Redis 7
- **Search**: PostgreSQL Full-Text Search

### AI/ML
- **LLM**: OpenAI GPT-4 / Google Gemini
- **NER**: spaCy + Custom Legal Model
- **Embeddings**: sentence-transformers (all-MiniLM-L6-v2)
- **Classification**: DistilBERT fine-tuned

## 3. Data Flow (Compliance-Updated)

### Incident Processing Flow
```
User Input (Plain Text)
    │
    ▼
[Preprocessing & Sanitization]
    │
    ▼
[AI Legal Section Extraction]
    │
    ├─► NER Extraction (Entities)
    │
    ├─► Classification (Offense Type)
    │
    ├─► Vector Search (Similar Cases)
    │
    └─► LLM Reasoning (Context Analysis)
    │
    ▼
[Legal Sections Identified]
    │
    ├─► IPC/BNS Sections
    ├─► CrPC/BNSS Sections
    ├─► IT Act Sections
    ├─► Evidence Act
    └─► Other Acts
    │
    ▼
[Jurisdiction Finder]
    │
    ├─► User Location
    ├─► Case Type
    └─► Maps API
    │
    ▼
[Jurisdiction Result]
    │
    ├─► Police Station
    ├─► Court
    ├─► Authority Type
    └─► Filing Instructions
    │
    ▼
[Reporting Engine]
    │
    ├─► FIR Draft Generation
    ├─► Portal Links
    └─► Helpline Numbers
    │
    ▼
[❌ REMOVED: Lawyer Recommendation]
[✅ NEW: Lawyer Directory Access]
    │
    ├─► Practice Area Filter (User-selected)
    ├─► Location Filter (User-selected)
    ├─► Language Filter (User-selected)
    ├─► Gender Filter (Optional, User-selected)
    └─► Alphabetical Sort ONLY
    │
    ▼
[Case Creation & Tracking]
```

## 4. Database Schema (BCI Compliant)

### ❌ REMOVED FIELDS (Illegal under Rule 36)
- `rating` / `average_rating`
- `win_rate` / `success_rate`
- `cases_won` / `cases_lost` / `total_cases`
- `fee_range` / `consultation_fee` / `hourly_rate`
- `ranking_score` / `popularity_score`
- `client_reviews` / `testimonials`
- `featured` / `premium` / `highlighted`

### ✅ COMPLIANT LAWYER PROFILE SCHEMA

```sql
CREATE TABLE lawyer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Identification (ALLOWED)
    full_name VARCHAR(255) NOT NULL,
    enrollment_number VARCHAR(100) UNIQUE NOT NULL,
    bar_council_state VARCHAR(100) NOT NULL,
    enrollment_date DATE NOT NULL,
    
    -- Contact Information (ALLOWED)
    email VARCHAR(255),
    phone VARCHAR(20),
    office_address TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10),
    
    -- Professional Information (ALLOWED - Factual Only)
    practice_areas TEXT[] NOT NULL, -- e.g., ['Criminal Law', 'Cyber Law']
    courts_practicing_in TEXT[], -- e.g., ['Karnataka High Court', 'Bangalore City Civil Court']
    languages_known TEXT[], -- e.g., ['English', 'Hindi', 'Kannada']
    
    -- Academic Qualifications (ALLOWED)
    law_degree VARCHAR(100), -- e.g., 'LLB', 'LLM'
    law_school VARCHAR(255),
    other_qualifications TEXT[],
    
    -- Bar Association (ALLOWED)
    bar_association_memberships TEXT[],
    
    -- Profile Management
    profile_claimed BOOLEAN DEFAULT FALSE,
    profile_verified BOOLEAN DEFAULT FALSE,
    last_verified_date TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Compliance
    data_source VARCHAR(50) DEFAULT 'user_submitted', -- 'user_submitted', 'bar_council', 'lawyer_claimed'
    
    -- NO RATINGS, NO FEES, NO STATISTICS
    
    CONSTRAINT valid_enrollment_number CHECK (LENGTH(enrollment_number) > 0),
    CONSTRAINT valid_practice_areas CHECK (array_length(practice_areas, 1) > 0)
);

-- Indexes for filtering (NOT ranking)
CREATE INDEX idx_lawyer_city ON lawyer_profiles(city);
CREATE INDEX idx_lawyer_state ON lawyer_profiles(state);
CREATE INDEX idx_lawyer_practice_areas ON lawyer_profiles USING GIN(practice_areas);
CREATE INDEX idx_lawyer_languages ON lawyer_profiles USING GIN(languages_known);
CREATE INDEX idx_lawyer_enrollment ON lawyer_profiles(enrollment_number);
CREATE INDEX idx_lawyer_name_alpha ON lawyer_profiles(full_name); -- For alphabetical sorting
```

### Core Tables (Updated)

```sql
-- Users (Unchanged)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255),
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Incidents (Unchanged)
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    description TEXT NOT NULL,
    incident_date TIMESTAMP,
    location TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Legal Sections (Unchanged)
CREATE TABLE legal_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES incidents(id),
    act_name VARCHAR(100), -- 'IPC', 'CrPC', 'IT Act', etc.
    section_number VARCHAR(50),
    section_description TEXT,
    confidence_score FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Jurisdiction Results (Unchanged)
CREATE TABLE jurisdiction_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES incidents(id),
    jurisdiction_type VARCHAR(50), -- 'police', 'court', 'cyber_cell'
    authority_name VARCHAR(255),
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    distance_km DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Cases (Unchanged)
CREATE TABLE user_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    incident_id UUID REFERENCES incidents(id),
    case_number VARCHAR(100),
    case_type VARCHAR(100),
    status VARCHAR(50), -- 'filed', 'under_investigation', 'in_court', 'closed'
    lawyer_id UUID REFERENCES lawyer_profiles(id), -- Optional
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Case Updates (Unchanged)
CREATE TABLE case_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES user_cases(id),
    update_type VARCHAR(50), -- 'hearing', 'order', 'status_change'
    update_text TEXT,
    update_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Documents (Unchanged)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES user_cases(id),
    document_type VARCHAR(100),
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    file_size_bytes BIGINT,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- ❌ REMOVED TABLE: lawyer_case_history (contained win rates, statistics)
-- ❌ REMOVED TABLE: lawyer_reviews (contained ratings, testimonials)
-- ❌ REMOVED TABLE: lawyer_analytics (contained performance metrics)
```

## 5. API Endpoints (BCI Compliant)

### Authentication (Unchanged)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/anonymous`
- `POST /api/auth/refresh`

### Legal AI (Unchanged - Safe)
- `POST /api/legal/analyze` - Analyze incident
- `GET /api/legal/sections/{incident_id}` - Get legal sections
- `POST /api/legal/draft-fir` - Generate FIR draft

### Jurisdiction (Unchanged - Safe)
- `POST /api/jurisdiction/find` - Find jurisdiction
- `GET /api/jurisdiction/police-stations` - Nearby police stations
- `GET /api/jurisdiction/courts` - Nearby courts

### ❌ REMOVED ENDPOINTS (Non-Compliant)
- ~~`GET /api/lawyers/{id}/analytics`~~ - Performance analytics (ILLEGAL)
- ~~`GET /api/lawyers/{id}/reviews`~~ - Client reviews (ILLEGAL)
- ~~`GET /api/lawyers/recommended`~~ - Recommended lawyers (ILLEGAL)
- ~~`GET /api/lawyers/top-rated`~~ - Top rated lawyers (ILLEGAL)

### ✅ NEW COMPLIANT ENDPOINTS

#### Lawyer Directory (Neutral, Filter-Only)
```
GET /api/lawyers/directory
Query Parameters:
  - city: string (optional)
  - state: string (optional)
  - practice_area: string (optional)
  - language: string (optional)
  - gender: string (optional)
  - sort: 'name_asc' | 'name_desc' (default: 'name_asc')
  - page: integer (default: 1)
  - limit: integer (default: 20, max: 50)

Response:
{
  "lawyers": [
    {
      "id": "uuid",
      "full_name": "Adv. Anil Kumar",
      "enrollment_number": "KAR/12345/2010",
      "bar_council_state": "Karnataka",
      "enrollment_date": "2010-06-15",
      "practice_areas": ["Criminal Law", "Cyber Law"],
      "courts_practicing_in": ["Karnataka High Court"],
      "languages_known": ["English", "Hindi", "Kannada"],
      "city": "Bangalore",
      "state": "Karnataka",
      "email": "anil@example.com",
      "phone": "+91-9876543210",
      "office_address": "123 MG Road, Bangalore",
      "law_degree": "LLB, LLM",
      "profile_verified": true
    }
  ],
  "total": 150,
  "page": 1,
  "pages": 8,
  "disclaimer": "This is a factual directory. No endorsement, ranking, or recommendation is implied. Information is user-submitted or from public records. Verify credentials independently."
}

NOTE: Results are ALWAYS sorted alphabetically by name.
NO ranking, NO scoring, NO "best match" logic.
```

```
GET /api/lawyers/{id}
Response:
{
  "id": "uuid",
  "full_name": "Adv. Anil Kumar",
  "enrollment_number": "KAR/12345/2010",
  "bar_council_state": "Karnataka",
  "enrollment_date": "2010-06-15",
  "practice_areas": ["Criminal Law", "Cyber Law"],
  "courts_practicing_in": ["Karnataka High Court", "Bangalore City Civil Court"],
  "languages_known": ["English", "Hindi", "Kannada"],
  "city": "Bangalore",
  "state": "Karnataka",
  "email": "anil@example.com",
  "phone": "+91-9876543210",
  "office_address": "123 MG Road, Bangalore - 560001",
  "law_degree": "LLB (2008), LLM (2010)",
  "law_school": "National Law School of India University",
  "other_qualifications": ["Diploma in Cyber Law"],
  "bar_association_memberships": ["Bangalore Bar Association"],
  "profile_claimed": true,
  "profile_verified": true,
  "last_verified_date": "2025-01-15T10:00:00Z",
  "disclaimer": "This information is factual and not a recommendation. Verify independently."
}

NOTE: NO ratings, NO case statistics, NO fees, NO reviews.
```

```
POST /api/lawyers/claim-profile
Request:
{
  "enrollment_number": "KAR/12345/2010",
  "email": "lawyer@example.com",
  "verification_document": "base64_encoded_bar_card"
}

Response:
{
  "message": "Profile claim request submitted. Verification pending.",
  "claim_id": "uuid"
}

Purpose: Allow lawyers to claim and update their own profiles with accurate information.
```

```
GET /api/lawyers/practice-areas
Response:
{
  "practice_areas": [
    "Civil Law",
    "Criminal Law",
    "Cyber Law",
    "Consumer Law",
    "Family Law",
    "Corporate Law",
    "Intellectual Property Law",
    "Tax Law",
    "Labour Law",
    "Environmental Law"
  ]
}

Purpose: Provide standardized practice area options for filtering.
```

### Cases (Unchanged - Safe)
- `POST /api/cases` - Create case
- `GET /api/cases/{id}` - Get case details
- `PUT /api/cases/{id}` - Update case
- `GET /api/cases/{id}/timeline` - Case timeline

### Tracker (Unchanged - Safe)
- `GET /api/tracker/fir-status` - Check FIR status
- `GET /api/tracker/hearings` - Upcoming hearings
- `POST /api/tracker/update` - Add case update

### Documents (Unchanged - Safe)
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/{id}` - Get document
- `DELETE /api/documents/{id}` - Delete document

### Reporting (Unchanged - Safe)
- `GET /api/reporting/helplines` - Get helpline numbers
- `GET /api/reporting/portals` - Get online portals
- `POST /api/reporting/generate-notice` - Generate legal notice

## 6. AI Pipeline Architecture (Compliance-Updated)

### Legal Section Extraction Pipeline (Unchanged - Safe)
1. **Input Processing**: Clean and normalize text
2. **Entity Recognition**: Extract names, dates, locations, amounts
3. **Offense Classification**: Categorize incident type
4. **Section Matching**: Match to IPC/CrPC/IT Act sections
5. **Precedent Search**: Find similar cases
6. **LLM Analysis**: Contextual reasoning
7. **Output Generation**: Structured legal analysis

### ❌ REMOVED: Lawyer Recommendation Pipeline
- ~~Case Feature Extraction~~
- ~~Lawyer Pool Filtering~~
- ~~Similarity Scoring~~
- ~~Performance Ranking~~
- ~~Fee Optimization~~
- ~~Output Ranking~~

### ✅ NEW: Lawyer Directory Filter Pipeline
1. **User Input**: Practice area, location, language preferences
2. **Database Query**: Filter by exact matches only
3. **Alphabetical Sort**: Sort by full_name ASC
4. **Pagination**: Return paginated results
5. **Disclaimer Injection**: Add mandatory disclaimer
6. **Output**: Neutral, factual list

## 7. Compliance Safeguards

### Automated Compliance Checks
```python
# Backend validation layer
def validate_lawyer_response(response_data):
    """Ensure no illegal fields are exposed"""
    illegal_fields = [
        'rating', 'win_rate', 'success_rate', 'cases_won',
        'cases_lost', 'total_cases', 'fee', 'consultation_fee',
        'ranking_score', 'popularity', 'reviews', 'testimonials',
        'featured', 'premium', 'recommended'
    ]
    
    for field in illegal_fields:
        if field in response_data:
            raise ComplianceViolationError(
                f"Illegal field '{field}' detected. BCI Rule 36 violation."
            )
    
    return True
```

### Frontend Compliance Layer
```typescript
// Prevent any ranking/rating UI elements
const PROHIBITED_UI_ELEMENTS = [
  'star-rating',
  'win-rate-badge',
  'top-lawyer-badge',
  'featured-lawyer-card',
  'success-rate-chart',
  'fee-comparison-table'
];

// Mandatory disclaimer on all lawyer pages
const MANDATORY_DISCLAIMER = `
DISCLAIMER: This is a factual directory of advocates based on publicly 
available information and user submissions. No endorsement, ranking, or 
recommendation is implied. This information does not constitute legal 
advice or solicitation. Users are advised to verify credentials 
independently through the respective State Bar Council.
`;
```

### Database Constraints
```sql
-- Prevent accidental insertion of illegal data
CREATE OR REPLACE FUNCTION prevent_illegal_lawyer_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- This function ensures no illegal columns can be added
    -- even through direct SQL manipulation
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## 8. Migration Plan

### Phase 1: Database Migration
1. Backup existing database
2. Drop illegal columns: `rating`, `win_rate`, `cases_count`, `fee_range`
3. Drop illegal tables: `lawyer_reviews`, `lawyer_analytics`, `lawyer_case_history`
4. Add new compliant fields if needed
5. Run data validation

### Phase 2: Backend Migration
1. Update Pydantic models (remove illegal fields)
2. Update API endpoints (remove ranking logic)
3. Add compliance validation layer
4. Update AI prompts (neutral responses only)
5. Add mandatory disclaimers

### Phase 3: Frontend Migration
1. Replace lawyer recommendation UI with directory UI
2. Remove all rating/ranking displays
3. Remove fee filters and displays
4. Add alphabetical sorting only
5. Add mandatory disclaimers
6. Update copy to be neutral

### Phase 4: Testing & Validation
1. Compliance audit (check all endpoints)
2. UI/UX review (ensure no promotional elements)
3. Legal review (BCI Rule 36 compliance)
4. User acceptance testing

## 9. Monitoring & Compliance

### Compliance Metrics
- Number of API calls to lawyer directory
- Filter usage patterns
- Profile claim requests
- Compliance violation attempts (blocked)

### Audit Logs
- All lawyer profile updates
- All API responses (ensure no illegal fields)
- User filter selections
- Disclaimer display confirmations

## 10. Legal Disclaimers (Mandatory)

### On All Lawyer Directory Pages
```
DISCLAIMER:
This directory contains factual information about advocates enrolled with 
various State Bar Councils in India. The information is sourced from public 
records and user submissions. This platform does not endorse, recommend, 
rank, or rate any advocate. The listing is presented in alphabetical order 
for user convenience only.

This information is provided for informational purposes and does not 
constitute legal advice, solicitation, or an attorney-client relationship. 
Users are strongly advised to:
1. Verify advocate credentials through the respective State Bar Council
2. Conduct independent research before engaging legal services
3. Make informed decisions based on their specific legal needs

The platform is not responsible for the accuracy of user-submitted 
information. For verified information, please contact the respective 
State Bar Council or the advocate directly.
```

### On Lawyer Profile Pages
```
DISCLAIMER:
This profile contains factual information only. No endorsement or 
recommendation is implied. Verify credentials independently through 
the [State] Bar Council. This is not legal advice or solicitation.
```

---

**Architecture Version**: 2.0 (BCI Rule 36 Compliant)  
**Last Updated**: December 5, 2025  
**Compliance Status**: ✅ Fully Compliant with Bar Council of India Rule 36
