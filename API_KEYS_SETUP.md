# 🔑 API Keys Setup Guide
## Required Keys to Make AI Features Work

**Last Updated:** December 5, 2025

---

## 🎯 Overview

To make the AI features of JustiFly work, you need to configure several API keys. This guide will walk you through obtaining and configuring each one.

---

## 📋 REQUIRED API KEYS

### **Priority 1: Essential for Core AI Features**

| Service | Purpose | Cost | Required For |
|---------|---------|------|--------------|
| **OpenAI** or **Google AI** | Legal text analysis, section extraction | Paid | ✅ CRITICAL |
| **PostgreSQL** | Database | Free (local) | ✅ CRITICAL |
| **Redis** | Caching | Free (local) | ✅ CRITICAL |

### **Priority 2: Important for Full Functionality**

| Service | Purpose | Cost | Required For |
|---------|---------|------|--------------|
| **Google Maps** | Jurisdiction finder, court locator | Paid | Recommended |
| **Qdrant** | Vector search for legal sections | Free (local) | Recommended |

### **Priority 3: Optional Enhancements**

| Service | Purpose | Cost | Required For |
|---------|---------|------|--------------|
| **eCourts API** | Case tracking | Free | Optional |
| **Sentry** | Error monitoring | Free tier | Optional |

---

## 🚀 STEP-BY-STEP SETUP

### **Step 1: Create Environment File**

```bash
cd /Users/krishna_prasath/Workspace/AI_legal_Assistant/backend
cp .env.example .env
```

If `.env.example` doesn't exist, create `.env` with:

```bash
touch .env
```

---

### **Step 2: Configure Database (CRITICAL)**

#### **PostgreSQL Setup**

**Option A: Local PostgreSQL (Recommended for Development)**

```bash
# Install PostgreSQL (macOS)
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Create database
createdb legal_assistant

# Create user
psql postgres -c "CREATE USER legal_user WITH PASSWORD 'your_secure_password';"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE legal_assistant TO legal_user;"
```

**Add to `.env`:**
```env
DATABASE_URL=postgresql://legal_user:your_secure_password@localhost:5432/legal_assistant
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10
```

**Option B: Cloud PostgreSQL (Production)**

Use services like:
- **Supabase** (Free tier): https://supabase.com
- **Neon** (Free tier): https://neon.tech
- **Railway** (Free tier): https://railway.app

Get connection string and add to `.env`:
```env
DATABASE_URL=postgresql://user:password@host:port/database
```

---

### **Step 3: Configure Redis (CRITICAL)**

#### **Redis Setup**

**Option A: Local Redis**

```bash
# Install Redis (macOS)
brew install redis

# Start Redis
brew services start redis

# Test connection
redis-cli ping
# Should return: PONG
```

**Add to `.env`:**
```env
REDIS_URL=redis://localhost:6379/0
REDIS_CACHE_TTL=3600
```

**Option B: Cloud Redis (Production)**

Use services like:
- **Upstash** (Free tier): https://upstash.com
- **Redis Cloud** (Free tier): https://redis.com/try-free

Get connection URL and add to `.env`:
```env
REDIS_URL=redis://default:password@host:port
```

---

### **Step 4: Configure AI Service (CRITICAL)**

You need **either** OpenAI **or** Google AI (Gemini). Choose one:

#### **Option A: OpenAI (Recommended)**

1. **Get API Key:**
   - Go to: https://platform.openai.com/api-keys
   - Sign up / Log in
   - Click "Create new secret key"
   - Copy the key (starts with `sk-`)

2. **Add to `.env`:**
```env
OPENAI_API_KEY=sk-your-actual-key-here
AI_MODEL=gpt-4-turbo-preview
EMBEDDING_MODEL=text-embedding-3-small
```

3. **Pricing:**
   - GPT-4 Turbo: ~$0.01 per 1K tokens (input), ~$0.03 per 1K tokens (output)
   - Embeddings: ~$0.0001 per 1K tokens
   - Estimated cost: $5-20/month for moderate usage

#### **Option B: Google AI (Gemini) - FREE Tier Available**

1. **Get API Key:**
   - Go to: https://makersuite.google.com/app/apikey
   - Sign in with Google account
   - Click "Create API Key"
   - Copy the key

2. **Add to `.env`:**
```env
GOOGLE_AI_API_KEY=your-google-ai-key-here
AI_MODEL=gemini-pro
EMBEDDING_MODEL=embedding-001
```

3. **Pricing:**
   - **FREE tier**: 60 requests per minute
   - Paid tier: Much cheaper than OpenAI
   - Recommended for development

---

### **Step 5: Configure Google Maps (Recommended)**

**Purpose:** Find nearby police stations, courts, and jurisdiction

1. **Get API Key:**
   - Go to: https://console.cloud.google.com/
   - Create new project or select existing
   - Enable APIs:
     - Maps JavaScript API
     - Geocoding API
     - Places API
   - Go to "Credentials" → "Create Credentials" → "API Key"
   - Copy the key

2. **Add to `.env`:**
```env
GOOGLE_MAPS_API_KEY=your-google-maps-key-here
```

3. **Pricing:**
   - $200 free credit per month
   - Geocoding: $5 per 1000 requests (after free tier)
   - Usually free for small projects

---

### **Step 6: Configure Qdrant Vector Database (Recommended)**

**Purpose:** Fast semantic search for legal sections

#### **Option A: Local Qdrant (Development)**

```bash
# Using Docker
docker run -p 6333:6333 qdrant/qdrant

# Or install locally
brew install qdrant
qdrant
```

**Add to `.env`:**
```env
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=
QDRANT_COLLECTION_NAME=legal_sections
```

#### **Option B: Qdrant Cloud (Production)**

1. Go to: https://cloud.qdrant.io
2. Create free cluster
3. Get API key and URL

**Add to `.env`:**
```env
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your-qdrant-key
QDRANT_COLLECTION_NAME=legal_sections
```

---

### **Step 7: Configure Security Keys (CRITICAL)**

```bash
# Generate secure secret key
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Add to `.env`:**
```env
SECRET_KEY=your-generated-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ENCRYPTION_KEY=another-generated-key-here
```

---

### **Step 8: Configure Optional Services**

#### **eCourts API (Optional)**

**Note:** eCourts API is not publicly available. You may need to:
- Contact eCourts team for access
- Use web scraping (check legal compliance)
- Build your own case tracking system

```env
ECOURTS_API_KEY=your-ecourts-key-if-available
ECOURTS_API_URL=https://services.ecourts.gov.in/ecourtindia_v6/
```

#### **Sentry (Error Monitoring - Optional)**

1. Go to: https://sentry.io
2. Create free account
3. Create new project
4. Copy DSN

```env
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

---

## 📄 COMPLETE `.env` FILE TEMPLATE

```env
# ============================================================================
# JustiFly AI Legal Assistant - Environment Configuration
# ============================================================================

# Application
APP_NAME=JustiFly Legal Assistant
APP_VERSION=1.0.0
DEBUG=True
ENVIRONMENT=development

# ============================================================================
# DATABASE (CRITICAL - Required)
# ============================================================================
DATABASE_URL=postgresql://legal_user:your_password@localhost:5432/legal_assistant
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10

# ============================================================================
# REDIS CACHE (CRITICAL - Required)
# ============================================================================
REDIS_URL=redis://localhost:6379/0
REDIS_CACHE_TTL=3600

# ============================================================================
# AI SERVICE (CRITICAL - Choose ONE)
# ============================================================================

# Option A: OpenAI (Paid, more powerful)
OPENAI_API_KEY=sk-your-openai-key-here
AI_MODEL=gpt-4-turbo-preview
EMBEDDING_MODEL=text-embedding-3-small

# Option B: Google AI (Free tier available)
# GOOGLE_AI_API_KEY=your-google-ai-key-here
# AI_MODEL=gemini-pro
# EMBEDDING_MODEL=embedding-001

# ============================================================================
# VECTOR DATABASE (Recommended)
# ============================================================================
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=
QDRANT_COLLECTION_NAME=legal_sections

# ============================================================================
# GOOGLE MAPS (Recommended for jurisdiction finder)
# ============================================================================
GOOGLE_MAPS_API_KEY=your-google-maps-key-here

# ============================================================================
# SECURITY (CRITICAL - Required)
# ============================================================================
SECRET_KEY=your-generated-secret-key-32-chars-minimum
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ENCRYPTION_KEY=another-generated-key-32-chars-minimum
ANONYMOUS_SESSION_EXPIRE_HOURS=24

# ============================================================================
# FILE STORAGE
# ============================================================================
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=10485760
ALLOWED_EXTENSIONS=pdf,jpg,jpeg,png,doc,docx

# ============================================================================
# CORS (Frontend URL)
# ============================================================================
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# ============================================================================
# LOGGING
# ============================================================================
LOG_LEVEL=INFO
LOG_FORMAT=json

# ============================================================================
# OPTIONAL SERVICES
# ============================================================================

# Celery (Background Tasks)
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# eCourts API (if available)
ECOURTS_API_KEY=
ECOURTS_API_URL=https://services.ecourts.gov.in/ecourtindia_v6/

# Sentry (Error Monitoring)
SENTRY_DSN=

# Prometheus (Metrics)
PROMETHEUS_PORT=9090

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000
```

---

## 🧪 TESTING YOUR CONFIGURATION

### **Step 1: Test Database Connection**

```bash
cd backend

# Test PostgreSQL
python3 -c "
from sqlalchemy import create_engine
from app.config import settings
engine = create_engine(settings.DATABASE_URL)
conn = engine.connect()
print('✅ Database connection successful!')
conn.close()
"
```

### **Step 2: Test Redis Connection**

```bash
python3 -c "
import redis
from app.config import settings
r = redis.from_url(settings.REDIS_URL)
r.ping()
print('✅ Redis connection successful!')
"
```

### **Step 3: Test AI Service**

**For OpenAI:**
```bash
python3 -c "
from openai import OpenAI
from app.config import settings
client = OpenAI(api_key=settings.OPENAI_API_KEY)
response = client.chat.completions.create(
    model='gpt-3.5-turbo',
    messages=[{'role': 'user', 'content': 'Hello'}],
    max_tokens=10
)
print('✅ OpenAI connection successful!')
print(response.choices[0].message.content)
"
```

**For Google AI:**
```bash
python3 -c "
import google.generativeai as genai
from app.config import settings
genai.configure(api_key=settings.GOOGLE_AI_API_KEY)
model = genai.GenerativeModel('gemini-pro')
response = model.generate_content('Hello')
print('✅ Google AI connection successful!')
print(response.text)
"
```

### **Step 4: Start Backend**

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Visit: http://localhost:8000/docs

### **Step 5: Test API Endpoint**

```bash
curl -X POST http://localhost:8000/api/v1/legal/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer demo_token" \
  -d '{
    "incident_text": "Someone hacked my email and stole money from my bank account",
    "is_anonymous": true
  }'
```

---

## 💰 COST ESTIMATION

### **Minimal Setup (Development)**
- PostgreSQL: **FREE** (local)
- Redis: **FREE** (local)
- Google AI (Gemini): **FREE** (60 req/min)
- Qdrant: **FREE** (local)
- **Total: $0/month**

### **Recommended Setup (Production)**
- PostgreSQL (Supabase): **FREE** (500MB)
- Redis (Upstash): **FREE** (10K commands/day)
- OpenAI (GPT-4): **~$10-30/month** (moderate usage)
- Google Maps: **FREE** ($200 credit)
- Qdrant Cloud: **FREE** (1GB)
- **Total: ~$10-30/month**

### **Full Production Setup**
- PostgreSQL (Supabase Pro): **$25/month**
- Redis (Upstash Pro): **$10/month**
- OpenAI (GPT-4): **$50-100/month** (high usage)
- Google Maps: **$20/month** (after free tier)
- Qdrant Cloud: **$25/month**
- Sentry: **FREE** (5K errors/month)
- **Total: ~$130-180/month**

---

## 🚨 TROUBLESHOOTING

### **Issue: Database connection failed**

```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Restart PostgreSQL
brew services restart postgresql@15

# Check connection
psql -U legal_user -d legal_assistant -h localhost
```

### **Issue: Redis connection failed**

```bash
# Check if Redis is running
brew services list | grep redis

# Restart Redis
brew services restart redis

# Test connection
redis-cli ping
```

### **Issue: OpenAI API key invalid**

```bash
# Test key directly
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### **Issue: Import errors**

```bash
# Reinstall dependencies
cd backend
pip install --upgrade -r requirements.txt
```

---

## 📚 NEXT STEPS

After configuring all keys:

1. **Initialize Database:**
   ```bash
   cd backend
   alembic upgrade head
   ```

2. **Seed Legal Sections Data:**
   ```bash
   python scripts/seed_legal_sections.py
   ```

3. **Start Backend:**
   ```bash
   uvicorn app.main:app --reload
   ```

4. **Start Frontend:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

5. **Test the Application:**
   - Visit: http://localhost:3000
   - Describe an incident
   - Click "Get Legal Guidance"
   - Check if AI analysis works

---

## 🔐 SECURITY BEST PRACTICES

1. **Never commit `.env` to git**
   ```bash
   # Already in .gitignore, but verify:
   cat .gitignore | grep .env
   ```

2. **Use different keys for dev/prod**
   - Development: `.env.development`
   - Production: `.env.production`

3. **Rotate keys regularly**
   - Change SECRET_KEY every 90 days
   - Rotate API keys if compromised

4. **Use environment-specific keys**
   - Don't use production keys in development
   - Use separate OpenAI projects for dev/prod

5. **Monitor API usage**
   - Set up billing alerts on OpenAI/Google Cloud
   - Monitor unusual spikes in usage

---

## 📞 SUPPORT

### **For API Key Issues:**
- **OpenAI**: https://help.openai.com
- **Google AI**: https://ai.google.dev/docs
- **Google Maps**: https://developers.google.com/maps/support

### **For Database Issues:**
- **PostgreSQL**: https://www.postgresql.org/support/
- **Supabase**: https://supabase.com/docs

### **For Application Issues:**
- Check: `/backend/logs/`
- Review: `BCI_COMPLIANCE_GUIDELINES.md`
- Contact: Development team

---

**Document Version:** 1.0  
**Last Updated:** December 5, 2025  
**Maintained By:** Development Team
