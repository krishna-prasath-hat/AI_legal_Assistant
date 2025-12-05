# India Legal Assistance AI Platform - Backend

## Requirements

- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Qdrant Vector Database

## Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
alembic upgrade head

# Seed initial data
python scripts/seed_data.py

# Run the application
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Configuration management
│   ├── database.py             # Database connection
│   ├── dependencies.py         # Dependency injection
│   │
│   ├── api/                    # API routes
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── legal.py
│   │   │   ├── jurisdiction.py
│   │   │   ├── lawyers.py
│   │   │   ├── cases.py
│   │   │   ├── tracker.py
│   │   │   ├── documents.py
│   │   │   └── reporting.py
│   │
│   ├── models/                 # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── incident.py
│   │   ├── legal_section.py
│   │   ├── jurisdiction.py
│   │   ├── lawyer.py
│   │   ├── case.py
│   │   └── document.py
│   │
│   ├── schemas/                # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── incident.py
│   │   ├── legal_section.py
│   │   ├── jurisdiction.py
│   │   ├── lawyer.py
│   │   ├── case.py
│   │   └── document.py
│   │
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── legal_ai_service.py
│   │   ├── jurisdiction_service.py
│   │   ├── lawyer_service.py
│   │   ├── case_service.py
│   │   ├── document_service.py
│   │   └── reporting_service.py
│   │
│   ├── ai/                     # AI/ML modules
│   │   ├── __init__.py
│   │   ├── legal_extraction.py
│   │   ├── ner_model.py
│   │   ├── classification.py
│   │   ├── vector_search.py
│   │   ├── llm_reasoning.py
│   │   └── lawyer_recommendation.py
│   │
│   ├── core/                   # Core utilities
│   │   ├── __init__.py
│   │   ├── security.py
│   │   ├── cache.py
│   │   ├── exceptions.py
│   │   └── logging.py
│   │
│   ├── integrations/           # External API integrations
│   │   ├── __init__.py
│   │   ├── google_maps.py
│   │   ├── ecourts.py
│   │   ├── cybercrime.py
│   │   └── bar_council.py
│   │
│   └── utils/                  # Helper functions
│       ├── __init__.py
│       ├── validators.py
│       ├── formatters.py
│       └── constants.py
│
├── alembic/                    # Database migrations
│   ├── versions/
│   └── env.py
│
├── scripts/                    # Utility scripts
│   ├── seed_data.py
│   ├── import_legal_sections.py
│   └── generate_embeddings.py
│
├── tests/                      # Test suite
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_api/
│   ├── test_services/
│   └── test_ai/
│
├── requirements.txt
├── requirements-dev.txt
├── .env.example
├── alembic.ini
├── pytest.ini
└── README.md
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_api/test_legal.py
```

## Environment Variables

See `.env.example` for all required environment variables.

## License

Proprietary
