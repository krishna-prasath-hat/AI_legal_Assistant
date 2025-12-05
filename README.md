# 🏛️ India Legal Assistance AI Platform

**A Complete End-to-End AI-Powered Legal Assistance Platform for India**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Next.js](https://img.shields.io/badge/next.js-14-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/fastapi-0.109-green.svg)](https://fastapi.tiangolo.com/)

## 🎯 Overview

This platform empowers Indian citizens to understand their legal rights and navigate the legal system with AI assistance. Users can describe incidents in plain language, and the system will:

- ✅ Extract relevant legal sections (IPC, CrPC, IT Act, Evidence Act, Consumer Act)
- ✅ Determine jurisdiction (police station, court, authority)
- ✅ Suggest where to report (FIR, cyber portal, helplines)
- ✅ Recommend lawyers based on case type and past performance
- ✅ Provide case process guidance and tracking
- ✅ Generate FIR drafts and legal notices

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│  - Incident Input UI    - Lawyer Finder                     │
│  - Legal Analysis View  - Case Tracker                      │
│  - Jurisdiction Map     - Document Management               │
└─────────────────────────────────────────────────────────────┘
                            ↕ REST API
┌─────────────────────────────────────────────────────────────┐
│                   Backend (FastAPI)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Legal AI    │  │ Jurisdiction │  │   Lawyers    │      │
│  │   Engine     │  │    Finder    │  │  Recommender │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │    Qdrant    │  │    Redis     │      │
│  │   Database   │  │  Vector DB   │  │    Cache     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- (Optional) Python 3.11+ and Node.js 20+ for local development

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd AI_legal_Assistant

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env and add your API keys (optional for basic functionality)

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f backend

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Local Development

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run the development server
npm run dev
```

## 📋 Features

### 🤖 AI-Powered Legal Analysis

- **NER (Named Entity Recognition)**: Extracts entities like names, dates, amounts, phone numbers
- **Classification**: Categorizes incidents into offense types (theft, fraud, cybercrime, etc.)
- **Vector Search**: Finds similar cases and relevant legal precedents
- **LLM Reasoning**: Uses GPT-4/Gemini for contextual legal analysis

### ⚖️ Legal Section Extraction

Automatically identifies applicable sections from:
- Indian Penal Code (IPC)
- Code of Criminal Procedure (CrPC)
- Information Technology Act
- Indian Evidence Act
- Consumer Protection Act
- Family Court Act

### 📍 Jurisdiction Finder

- Locates nearest police stations
- Identifies appropriate courts
- Determines authority type (Cyber Cell, Consumer Court, RERA, etc.)
- Provides filing instructions and timelines

### 👨‍⚖️ Lawyer Recommendation

Matches users with lawyers based on:
- Case type similarity
- Past case success rate
- Experience and specialization
- Location and fees
- Reviews and ratings

### 📊 Case Tracker

- FIR status tracking
- Court hearing dates
- Case timeline and updates
- Document management
- Next action reminders

### 🔒 Privacy & Security

- Anonymous mode for sensitive cases
- End-to-end encryption for documents
- JWT-based authentication
- PII data protection
- GDPR-compliant data handling

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL 15
- **Vector DB**: Qdrant
- **Cache**: Redis 7
- **AI/ML**: 
  - OpenAI GPT-4 / Google Gemini
  - spaCy for NER
  - sentence-transformers for embeddings
  - DistilBERT for classification

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS
- **State Management**: Zustand + React Query
- **UI Components**: shadcn/ui

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **API Documentation**: OpenAPI/Swagger
- **Monitoring**: Prometheus + Grafana (optional)
- **Logging**: Structured JSON logging

## 📁 Project Structure

```
AI_legal_Assistant/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── ai/             # AI/ML modules
│   │   │   ├── legal_extraction.py
│   │   │   ├── ner_model.py
│   │   │   ├── classification.py
│   │   │   ├── vector_search.py
│   │   │   └── llm_reasoning.py
│   │   ├── api/            # API routes
│   │   │   └── v1/
│   │   │       ├── auth.py
│   │   │       ├── legal.py
│   │   │       ├── jurisdiction.py
│   │   │       ├── lawyers.py
│   │   │       ├── cases.py
│   │   │       └── tracker.py
│   │   ├── core/           # Core utilities
│   │   │   ├── security.py
│   │   │   ├── exceptions.py
│   │   │   └── logging.py
│   │   ├── config.py
│   │   ├── database.py
│   │   └── main.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx   # Home page
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   └── components/
│   ├── package.json
│   └── Dockerfile
│
├── database/
│   └── schema.sql         # PostgreSQL schema
│
├── docs/
│   ├── ARCHITECTURE.md    # System architecture
│   └── IMPLEMENTATION_GUIDE.md
│
├── docker-compose.yml
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/legal_assistance_db

# Redis
REDIS_URL=redis://localhost:6379/0

# Qdrant
QDRANT_URL=http://localhost:6333

# JWT
SECRET_KEY=your-secret-key-min-32-characters
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI APIs (Optional - system works with fallbacks)
OPENAI_API_KEY=your-openai-key
GOOGLE_AI_API_KEY=your-google-ai-key
GOOGLE_MAPS_API_KEY=your-maps-key

# Application
DEBUG=True
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000
```

#### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📖 API Documentation

Once the backend is running, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

### Key Endpoints

```
POST   /api/v1/auth/register          - Register user
POST   /api/v1/auth/login             - Login
POST   /api/v1/auth/anonymous         - Anonymous session

POST   /api/v1/legal/analyze          - Analyze incident
GET    /api/v1/legal/sections/{id}    - Get legal sections
POST   /api/v1/legal/draft-fir        - Generate FIR draft

GET    /api/v1/jurisdiction/police-stations  - Find police stations
GET    /api/v1/jurisdiction/courts           - Find courts

GET    /api/v1/lawyers/search         - Search lawyers
GET    /api/v1/lawyers/{id}           - Lawyer profile
GET    /api/v1/lawyers/{id}/analytics - Performance analytics

POST   /api/v1/cases                  - Create case
GET    /api/v1/cases                  - List cases
GET    /api/v1/cases/{id}/timeline    - Case timeline

GET    /api/v1/tracker/fir-status     - FIR status
GET    /api/v1/tracker/hearings       - Upcoming hearings

POST   /api/v1/documents/upload       - Upload document
GET    /api/v1/reporting/helplines    - Get helplines
```

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## 🚢 Deployment

### Docker Compose (Production)

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d

# Scale backend
docker-compose up -d --scale backend=3
```

### Kubernetes

See `deployment/k8s/` for Kubernetes manifests.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This platform provides general legal information and AI-assisted analysis. It is NOT a substitute for professional legal advice. For specific legal matters, please consult a qualified lawyer.

## 🙏 Acknowledgments

- Indian legal system and law databases
- Open-source AI/ML community
- FastAPI and Next.js communities

## 📞 Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Documentation: See `docs/` folder

## 🗺️ Roadmap

- [ ] Mobile apps (React Native)
- [ ] Multi-language support (Hindi, Tamil, Telugu, etc.)
- [ ] Voice input for incident reporting
- [ ] Video consultation with lawyers
- [ ] Payment integration
- [ ] Case outcome prediction ML model
- [ ] Document OCR
- [ ] 24/7 legal chatbot
- [ ] Community legal forum

---

**Made with ❤️ for India's Legal System**

*Empowering citizens with AI-powered legal assistance*
