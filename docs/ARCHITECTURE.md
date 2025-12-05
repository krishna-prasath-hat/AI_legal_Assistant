# India Legal Assistance AI Platform - System Architecture

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  React/Next.js Frontend (Port 3000)                              │  │
│  │  - Incident Input UI (Chat-based)                                │  │
│  │  - Legal Sections Display                                        │  │
│  │  - Jurisdiction Map View                                         │  │
│  │  - Lawyer Finder & Comparison                                    │  │
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
│  │   Auth     │  │  Legal AI  │  │Jurisdiction│  │  Lawyers   │        │
│  │  Service   │  │   Engine   │  │   Finder   │  │  Service   │        │
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
│  │  Lawyer Recommendation Engine                                  │    │
│  │  - Case Similarity Matching                                    │    │
│  │  - Collaborative Filtering                                     │    │
│  │  - Rating-based Ranking                                        │    │
│  └────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────┘
```

## 2. Technology Stack

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

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes (optional)
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)

## 3. Data Flow

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
    ├─► IPC Sections
    ├─► CrPC Sections
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
[Lawyer Recommendation]
    │
    ├─► Case Type Matching
    ├─► Location Filter
    ├─► Experience & Win Rate
    └─► Fee Range
    │
    ▼
[Case Creation & Tracking]
```

## 4. Database Schema

### Core Tables
- **users**: User accounts (anonymous supported)
- **incidents**: Incident descriptions
- **incident_classification**: AI classification results
- **legal_sections**: Extracted legal sections
- **jurisdiction_results**: Jurisdiction mapping
- **lawyer_profiles**: Lawyer information
- **lawyer_case_history**: Past cases & outcomes
- **user_cases**: Active cases
- **case_updates**: Timeline & status updates
- **documents**: Uploaded documents
- **case_hearings**: Court hearing dates
- **fir_records**: FIR tracking

## 5. API Endpoints

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/anonymous`
- `POST /api/auth/refresh`

### Legal AI
- `POST /api/legal/analyze` - Analyze incident
- `GET /api/legal/sections/{incident_id}` - Get legal sections
- `POST /api/legal/draft-fir` - Generate FIR draft

### Jurisdiction
- `POST /api/jurisdiction/find` - Find jurisdiction
- `GET /api/jurisdiction/police-stations` - Nearby police stations
- `GET /api/jurisdiction/courts` - Nearby courts

### Lawyers
- `GET /api/lawyers/search` - Search lawyers
- `GET /api/lawyers/{id}` - Lawyer profile
- `GET /api/lawyers/{id}/cases` - Lawyer case history
- `GET /api/lawyers/{id}/analytics` - Performance analytics

### Cases
- `POST /api/cases` - Create case
- `GET /api/cases/{id}` - Get case details
- `PUT /api/cases/{id}` - Update case
- `GET /api/cases/{id}/timeline` - Case timeline

### Tracker
- `GET /api/tracker/fir-status` - Check FIR status
- `GET /api/tracker/hearings` - Upcoming hearings
- `POST /api/tracker/update` - Add case update

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/{id}` - Get document
- `DELETE /api/documents/{id}` - Delete document

### Reporting
- `GET /api/reporting/helplines` - Get helpline numbers
- `GET /api/reporting/portals` - Get online portals
- `POST /api/reporting/generate-notice` - Generate legal notice

## 6. Security Architecture

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Anonymous mode with limited access
- Session management with Redis

### Data Protection
- End-to-end encryption for sensitive data
- PII anonymization
- GDPR-compliant data handling
- Secure document storage (encrypted S3)

### API Security
- Rate limiting
- CORS configuration
- Input validation & sanitization
- SQL injection prevention
- XSS protection

## 7. Deployment Architecture

### Development
```
Docker Compose
├── frontend (Next.js)
├── backend (FastAPI)
├── postgres
├── qdrant
├── redis
└── nginx
```

### Production (Kubernetes)
```
Kubernetes Cluster
├── Ingress (NGINX)
├── Frontend Deployment (3 replicas)
├── Backend Deployment (5 replicas)
├── PostgreSQL StatefulSet
├── Qdrant StatefulSet
├── Redis StatefulSet
├── Celery Workers (3 replicas)
└── Monitoring Stack
```

## 8. AI Pipeline Architecture

### Legal Section Extraction Pipeline
1. **Input Processing**: Clean and normalize text
2. **Entity Recognition**: Extract names, dates, locations, amounts
3. **Offense Classification**: Categorize incident type
4. **Section Matching**: Match to IPC/CrPC/IT Act sections
5. **Precedent Search**: Find similar cases
6. **LLM Analysis**: Contextual reasoning
7. **Output Generation**: Structured legal analysis

### Lawyer Recommendation Pipeline
1. **Case Feature Extraction**: Extract case characteristics
2. **Lawyer Pool Filtering**: Location, specialization, availability
3. **Similarity Scoring**: Match case type to lawyer experience
4. **Performance Ranking**: Win rate, reviews, experience
5. **Fee Optimization**: Balance quality and cost
6. **Output Ranking**: Top 10 recommended lawyers

## 9. External Integrations

### Google Maps API
- Geocoding user location
- Finding nearby police stations
- Finding nearby courts
- Distance calculation

### eCourts India API
- Case status lookup
- Hearing date retrieval
- Court information
- Judge information

### Cybercrime Portal
- Deep linking to complaint form
- Status tracking (if API available)

### Bar Council Registry
- Lawyer verification
- License validation
- Disciplinary records

## 10. Monitoring & Observability

### Metrics
- API response times
- Error rates
- User engagement
- AI model performance
- Database query performance

### Logging
- Structured logging (JSON)
- Centralized log aggregation
- Error tracking (Sentry)
- Audit logs for compliance

### Alerting
- System health alerts
- Performance degradation
- Security incidents
- Data quality issues
