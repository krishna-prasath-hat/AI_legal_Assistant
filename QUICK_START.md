# 🚀 Quick Start Guide
## Get JustiFly Running in 15 Minutes

---

## ✅ What You Need

- **macOS** (you have this)
- **15 minutes** of your time
- **Internet connection**
- **Terminal access**

---

## 📋 Step-by-Step Setup

### **Step 1: Install Prerequisites (5 minutes)**

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# Install Redis
brew install redis
brew services start redis

# Install Python dependencies
cd /Users/krishna_prasath/Workspace/AI_legal_Assistant/backend
pip3 install -r requirements.txt

# Install Node.js dependencies
cd ../frontend
npm install
```

---

### **Step 2: Setup Database (2 minutes)**

```bash
# Create database
createdb legal_assistant

# Create user
psql postgres << EOF
CREATE USER legal_user WITH PASSWORD 'dev_password_123';
GRANT ALL PRIVILEGES ON DATABASE legal_assistant TO legal_user;
EOF
```

---

### **Step 3: Configure API Keys (5 minutes)**

#### **Option A: Use Google AI (FREE - Recommended for Testing)**

1. Get FREE Google AI key: https://makersuite.google.com/app/apikey
2. Create `.env` file:

```bash
cd /Users/krishna_prasath/Workspace/AI_legal_Assistant/backend
cat > .env << 'EOF'
# Database
DATABASE_URL=postgresql://legal_user:dev_password_123@localhost:5432/legal_assistant

# Redis
REDIS_URL=redis://localhost:6379/0

# Google AI (FREE)
GOOGLE_AI_API_KEY=your-google-ai-key-here
AI_MODEL=gemini-pro

# Security
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
ENCRYPTION_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")

# CORS
CORS_ORIGINS=http://localhost:3000

# Other
DEBUG=True
ENVIRONMENT=development
UPLOAD_DIR=./uploads
QDRANT_URL=http://localhost:6333
EOF
```

3. **Replace `your-google-ai-key-here`** with your actual key

#### **Option B: Use OpenAI (Paid but Better)**

Get key from: https://platform.openai.com/api-keys

Replace Google AI section with:
```env
OPENAI_API_KEY=sk-your-openai-key-here
AI_MODEL=gpt-4-turbo-preview
```

---

### **Step 4: Initialize Database (1 minute)**

```bash
cd /Users/krishna_prasath/Workspace/AI_legal_Assistant/backend

# Run migrations
python3 << 'EOF'
from sqlalchemy import create_engine, text
from app.config import settings

engine = create_engine(settings.DATABASE_URL)
with engine.connect() as conn:
    # Create tables from schema
    with open('../docs/DATABASE_SCHEMA_COMPLIANT.sql', 'r') as f:
        schema = f.read()
    conn.execute(text(schema))
    conn.commit()
print("✅ Database initialized!")
EOF
```

---

### **Step 5: Start the Application (2 minutes)**

**Terminal 1 - Backend:**
```bash
cd /Users/krishna_prasath/Workspace/AI_legal_Assistant/backend
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd /Users/krishna_prasath/Workspace/AI_legal_Assistant/frontend
npm run dev
```

---

### **Step 6: Test It! (1 minute)**

1. **Open browser:** http://localhost:3000

2. **Describe an incident:**
   ```
   Someone called me pretending to be from my bank and asked for my OTP. 
   They transferred Rs. 50,000 from my account without my permission.
   ```

3. **Click:** "Get Legal Guidance"

4. **Check if AI responds** with legal sections (IPC 420, IT Act 66D, etc.)

---

## ✅ SUCCESS CHECKLIST

- [ ] PostgreSQL running: `brew services list | grep postgresql`
- [ ] Redis running: `brew services list | grep redis`
- [ ] Backend running: http://localhost:8000/docs
- [ ] Frontend running: http://localhost:3000
- [ ] AI responds to incident description
- [ ] Lawyer directory shows (http://localhost:3000/lawyers)

---

## 🚨 Quick Troubleshooting

### **Backend won't start:**
```bash
# Check Python version (need 3.11+)
python3 --version

# Reinstall dependencies
cd backend
pip3 install --upgrade -r requirements.txt
```

### **Database connection error:**
```bash
# Check PostgreSQL
brew services restart postgresql@15

# Test connection
psql -U legal_user -d legal_assistant -h localhost
```

### **Frontend won't start:**
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### **AI not responding:**
```bash
# Check API key
cd backend
python3 -c "from app.config import settings; print(settings.GOOGLE_AI_API_KEY)"

# Test Google AI
python3 << 'EOF'
import google.generativeai as genai
genai.configure(api_key="your-key-here")
model = genai.GenerativeModel('gemini-pro')
response = model.generate_content('Test')
print(response.text)
EOF
```

---

## 📚 Next Steps

After getting it running:

1. **Read:** `API_KEYS_SETUP.md` for detailed configuration
2. **Review:** `BCI_COMPLIANCE_GUIDELINES.md` for legal compliance
3. **Check:** `COMPLIANCE_COMPLETE.md` for what was changed
4. **Test:** All features (lawyer directory, case tracking, etc.)

---

## 💡 Pro Tips

### **For Development:**
- Use **Google AI (Gemini)** - it's FREE
- Keep both terminals open
- Check browser console for errors (F12)

### **For Production:**
- Use **OpenAI GPT-4** - better quality
- Set up proper database (Supabase)
- Configure Google Maps API
- Enable error monitoring (Sentry)

---

## 🎯 What Works Now

✅ **Legal Analysis:** Describe incident → Get IPC/IT Act sections  
✅ **Lawyer Directory:** BCI-compliant, alphabetical listing  
✅ **Case Tracking:** Create and manage cases  
✅ **Jurisdiction Finder:** Find nearest police station/court  
✅ **Document Management:** Upload evidence, FIRs  

---

## ⚠️ Important Notes

1. **Government Branding Removed:** We removed "Government of India" text to avoid misrepresentation
2. **BCI Compliant:** No lawyer ratings, fees, or rankings
3. **API Keys Required:** AI won't work without OpenAI or Google AI key
4. **Local Development:** This setup is for development only

---

## 📞 Need Help?

- **API Keys:** See `API_KEYS_SETUP.md`
- **Compliance:** See `BCI_COMPLIANCE_GUIDELINES.md`
- **Architecture:** See `docs/ARCHITECTURE_COMPLIANT.md`
- **Database:** See `docs/DATABASE_SCHEMA_COMPLIANT.sql`

---

**Ready to go!** 🚀

Your JustiFly AI Legal Assistant should now be running at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

---

**Document Version:** 1.0  
**Last Updated:** December 5, 2025
