# 🎯 QUICK GUIDE: Customize ChatGPT Output

## 📁 ONE FILE TO EDIT

```
backend/app/ai/prompts_config.py
```

---

## ⚡ 3-STEP PROCESS

### **STEP 1: Open the File**
```bash
cd /Users/bavadharini_k/ai_legal_assistance/AI_legal_Assistant/backend/app/ai
open prompts_config.py
```

### **STEP 2: Edit Your Prompt**

Find this section (around line 15):

```python
LEGAL_ANALYSIS_PROMPT = """You are an expert Indian legal advisor...

[EDIT THIS TEXT TO CHANGE CHATGPT'S RESPONSE]

YOUR TASK:
Provide analysis in this format:
1. [Your format here]
2. [Your format here]
"""
```

**Change it to whatever you want!** For example:

```python
LEGAL_ANALYSIS_PROMPT = """Analyze this incident: {incident_text}

Give me ONLY:
- Crime type (one word)
- Top 3 laws (IPC sections)
- Top 3 actions (bullet points)

Keep it under 100 words."""
```

### **STEP 3: Restart Backend**
```bash
cd /Users/bavadharini_k/ai_legal_assistance/AI_legal_Assistant/backend
lsof -ti:8000 | xargs kill -9
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 💡 EXAMPLE FORMATS

### **Format 1: Super Brief**
```python
CUSTOM_PROMPT_TEMPLATE = """
Incident: {incident_text}

In 3 sentences:
1. What crime is this?
2. What law applies?
3. What to do?
"""
ACTIVE_PROMPT = "CUSTOM_PROMPT_TEMPLATE"
```

### **Format 2: Bullet Points Only**
```python
CUSTOM_PROMPT_TEMPLATE = """
Incident: {incident_text}

CRIME: • [type]
LAWS: • [law1] • [law2] • [law3]
ACTIONS: • [action1] • [action2] • [action3]
"""
ACTIVE_PROMPT = "CUSTOM_PROMPT_TEMPLATE"
```

### **Format 3: Numbered Steps**
```python
CUSTOM_PROMPT_TEMPLATE = """
Incident: {incident_text}

STEP 1: [First action]
STEP 2: [Second action]
STEP 3: [Third action]
STEP 4: [Fourth action]
STEP 5: [Fifth action]

Each step = one sentence.
"""
ACTIVE_PROMPT = "CUSTOM_PROMPT_TEMPLATE"
```

---

## 🔑 VARIABLES YOU CAN USE

```python
{incident_text}      # User's description
{location}           # Location
{incident_date}      # Date
{offense_type}       # AI-detected type
{severity}           # low/medium/high
```

---

## ✅ THAT'S IT!

1. **Edit** `prompts_config.py`
2. **Save** the file
3. **Restart** backend
4. **Test** at http://localhost:3000

**Full guide:** See `CUSTOMIZE_PROMPTS.md`
