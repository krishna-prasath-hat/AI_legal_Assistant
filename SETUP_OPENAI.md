# 🔑 Add Your OpenAI API Key

## Quick Setup (2 minutes)

### Step 1: Get Your OpenAI API Key

1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-...`)

### Step 2: Add the Key to Your Application

Open the file: `/Users/bavadharini_k/ai_legal_assistance/AI_legal_Assistant/backend/.env`

Find this line:
```
OPENAI_API_KEY=your-openai-api-key
```

Replace it with your actual key:
```
OPENAI_API_KEY=sk-your-actual-key-here
```

### Step 3: Restart the Backend

```bash
cd /Users/bavadharini_k/ai_legal_assistance/AI_legal_Assistant

# Kill the current backend
lsof -ti:8000 | xargs kill -9

# Start it again
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## ✅ What's Already Done

I've made the following changes so your app works with ChatGPT:

1. **Removed Authentication** - No login required to test
2. **Connected OpenAI API** - Backend uses your ChatGPT API key
3. **Beautiful Results Display** - Shows AI analysis in a stunning modal with:
   - Legal sections from ChatGPT
   - AI-generated summary
   - Classification (offense type, severity)
   - Extracted entities (names, dates, amounts)
   - Next steps recommendations
   - Required documents

---

## 🚀 How to Use

1. **Add your OpenAI key** (see Step 2 above)
2. **Restart backend** (see Step 3 above)
3. **Open frontend**: http://localhost:3000
4. **Type an incident** (minimum 50 characters)
5. **Click "Get Legal Guidance Now"**
6. **See ChatGPT's analysis** in a beautiful modal!

---

## 📝 Example Incident to Test

Try this:
```
Someone called me pretending to be from my bank and asked for my OTP. 
They said there was suspicious activity on my account. I gave them the OTP 
and they transferred Rs. 50,000 from my account without my permission. 
This happened yesterday at 3 PM.
```

---

## 🎯 What Happens When You Submit

1. **Frontend** sends your incident text to the backend
2. **Backend** processes it through:
   - Entity extraction (names, dates, amounts)
   - Classification (offense type, severity)
   - **ChatGPT API** for legal analysis
   - Legal section matching
3. **ChatGPT** generates:
   - Detailed legal summary
   - Applicable law sections with reasoning
   - Next steps recommendations
4. **Frontend** displays everything in a beautiful modal

---

## 💡 Alternative: Use Google AI (Free)

If you don't have OpenAI credits, you can use Google's Gemini (free):

1. Get free key: https://makersuite.google.com/app/apikey
2. In `.env`, comment out OpenAI and add:
```bash
# OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=your-google-key-here
AI_MODEL=gemini-pro
```

---

## 🔧 Troubleshooting

**"Failed to connect to server"**
- Make sure backend is running on port 8000
- Check: `lsof -i :8000`

**"Analysis failed"**
- Check backend logs: `tail -f backend/backend.log`
- Verify API key is correct
- Make sure you have OpenAI credits

**No results showing**
- Open browser console (F12)
- Check for JavaScript errors
- Verify frontend is on port 3000

---

**Ready to test! Just add your OpenAI key and restart the backend.** 🚀
