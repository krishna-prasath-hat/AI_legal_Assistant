# 🎨 How to Customize ChatGPT Prompts

## 📍 Quick Start

All ChatGPT prompts are now in **ONE FILE** that you can easily edit:

**File Location:**
```
/Users/bavadharini_k/ai_legal_assistance/AI_legal_Assistant/backend/app/ai/prompts_config.py
```

---

## ✏️ How to Customize

### **Step 1: Open the Prompts File**

```bash
cd /Users/bavadharini_k/ai_legal_assistance/AI_legal_Assistant/backend/app/ai
open prompts_config.py
# or use any text editor
```

### **Step 2: Edit the Prompt**

You'll see several pre-made prompts. Choose one or create your own:

#### **Option A: Use LEGAL_ANALYSIS_PROMPT (Detailed)**
```python
LEGAL_ANALYSIS_PROMPT = """You are an expert Indian legal advisor...

[Edit this text to change what ChatGPT says]

YOUR TASK:
Provide analysis in this format:
1. [Your custom format here]
2. [Your custom format here]
"""
```

#### **Option B: Use SIMPLE_ANALYSIS_PROMPT (Brief)**
```python
SIMPLE_ANALYSIS_PROMPT = """Analyze this legal incident in India:

{incident_text}

Provide:
1. What type of crime/issue is this?
2. Which Indian laws apply?
3. What should the person do?

[Customize this to your needs]
"""
```

#### **Option C: Create Your Own Custom Prompt**
```python
CUSTOM_PROMPT_TEMPLATE = """
[Write your own prompt here]

Example:
"Analyze this incident: {incident_text}

Give me ONLY:
- One sentence summary
- Top 3 applicable laws
- Top 3 action steps

Be extremely brief."
"""
```

### **Step 3: Choose Which Prompt to Use**

Find this line in the file:
```python
ACTIVE_PROMPT = "LEGAL_ANALYSIS_PROMPT"
```

Change it to:
- `"LEGAL_ANALYSIS_PROMPT"` - For detailed analysis
- `"SIMPLE_ANALYSIS_PROMPT"` - For brief analysis  
- `"CUSTOM_PROMPT_TEMPLATE"` - For your custom format

### **Step 4: Restart Backend**

```bash
cd /Users/bavadharini_k/ai_legal_assistance/AI_legal_Assistant/backend
# Kill current backend
lsof -ti:8000 | xargs kill -9

# Start again
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 🎯 Example Customizations

### **Example 1: Get Only Bullet Points**

```python
CUSTOM_PROMPT_TEMPLATE = """Analyze this incident: {incident_text}

Respond with ONLY bullet points:

**CRIME TYPE:**
• [Type]

**LAWS:**
• [Law 1]
• [Law 2]
• [Law 3]

**ACTIONS:**
• [Action 1]
• [Action 2]
• [Action 3]

No explanations, just bullet points."""

ACTIVE_PROMPT = "CUSTOM_PROMPT_TEMPLATE"
```

### **Example 2: Get JSON Response**

```python
CUSTOM_PROMPT_TEMPLATE = """Analyze: {incident_text}

Return ONLY valid JSON:
{{
  "crime_type": "string",
  "severity": "low/medium/high",
  "laws": ["law1", "law2"],
  "actions": ["action1", "action2"],
  "summary": "brief summary"
}}"""

ACTIVE_PROMPT = "CUSTOM_PROMPT_TEMPLATE"
```

### **Example 3: Get Step-by-Step Guide**

```python
CUSTOM_PROMPT_TEMPLATE = """Incident: {incident_text}

Provide a step-by-step action plan:

STEP 1: [What to do first]
STEP 2: [What to do second]
STEP 3: [What to do third]
STEP 4: [What to do fourth]
STEP 5: [What to do fifth]

Each step should be ONE sentence."""

ACTIVE_PROMPT = "CUSTOM_PROMPT_TEMPLATE"
```

### **Example 4: Get Very Short Response**

```python
CUSTOM_PROMPT_TEMPLATE = """Incident: {incident_text}

In exactly 50 words, tell me:
1. What crime is this?
2. What law applies?
3. What to do?

Maximum 50 words total."""

ACTIVE_PROMPT = "CUSTOM_PROMPT_TEMPLATE"
```

---

## 🔧 Available Variables

You can use these variables in your prompts:

| Variable | Description | Example |
|----------|-------------|---------|
| `{incident_text}` | User's incident description | "Someone stole my phone..." |
| `{location}` | Location of incident | "Mumbai" |
| `{incident_date}` | Date of incident | "2024-01-15" |
| `{offense_type}` | AI-detected offense type | "theft" |
| `{offense_category}` | Category | "criminal" |
| `{severity}` | Severity level | "medium" |

**Usage:**
```python
CUSTOM_PROMPT_TEMPLATE = """
Incident: {incident_text}
Location: {location}
Type: {offense_type}
Severity: {severity}

[Your instructions here]
"""
```

---

## 💡 Tips for Writing Good Prompts

### ✅ **DO:**
- Be specific about format
- Use examples in your prompt
- Specify word/character limits
- Request structured output
- Use clear section headers

### ❌ **DON'T:**
- Be vague ("give me some info")
- Ask for too much at once
- Use complex language
- Forget to specify format

---

## 🎨 Prompt Templates Library

### **Template 1: Legal Brief Format**
```python
"""Analyze: {incident_text}

LEGAL BRIEF FORMAT:

I. FACTS
[Summarize facts]

II. ISSUES
[List legal issues]

III. APPLICABLE LAW
[List laws with sections]

IV. ANALYSIS
[Brief analysis]

V. RECOMMENDATION
[What to do]"""
```

### **Template 2: Q&A Format**
```python
"""Incident: {incident_text}

Answer these questions:

Q1: What type of legal issue is this?
A1: [Answer]

Q2: Which laws apply?
A2: [Answer]

Q3: What should I do immediately?
A3: [Answer]

Q4: What documents do I need?
A4: [Answer]"""
```

### **Template 3: Checklist Format**
```python
"""Incident: {incident_text}

LEGAL ACTION CHECKLIST:

☐ Crime Type: [Type]
☐ Applicable Laws: [Laws]
☐ Immediate Actions:
  ☐ [Action 1]
  ☐ [Action 2]
  ☐ [Action 3]
☐ Documents Needed:
  ☐ [Doc 1]
  ☐ [Doc 2]
☐ Where to Report: [Location]"""
```

---

## 🧪 Testing Your Prompts

1. **Edit** `prompts_config.py`
2. **Save** the file
3. **Restart** backend
4. **Test** with a sample incident:
   ```
   Someone called me pretending to be from my bank and asked for my OTP. 
   They transferred Rs. 50,000 from my account.
   ```
5. **Check** if the response format matches what you want
6. **Adjust** the prompt if needed
7. **Repeat** until perfect!

---

## 📊 Prompt Comparison

| Prompt Type | Response Length | Detail Level | Best For |
|-------------|----------------|--------------|----------|
| LEGAL_ANALYSIS | Long (500+ words) | Very detailed | Full analysis |
| SIMPLE_ANALYSIS | Medium (200 words) | Moderate | Quick guidance |
| CUSTOM | Your choice | Your choice | Specific needs |

---

## 🚀 Quick Reference

**File to edit:**
```
backend/app/ai/prompts_config.py
```

**Key sections:**
1. `LEGAL_ANALYSIS_PROMPT` - Line ~15
2. `SIMPLE_ANALYSIS_PROMPT` - Line ~60
3. `CUSTOM_PROMPT_TEMPLATE` - Line ~75
4. `ACTIVE_PROMPT` - Line ~150

**After editing:**
```bash
# Restart backend
cd backend
lsof -ti:8000 | xargs kill -9
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 💬 Example: Your Custom Format

If you want ChatGPT to respond in a specific way, just write it in the prompt:

```python
CUSTOM_PROMPT_TEMPLATE = """
Analyze this incident: {incident_text}

I want the response in THIS EXACT FORMAT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 INCIDENT TYPE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[One line description]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚖️ APPLICABLE LAWS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. [Law with section]
2. [Law with section]
3. [Law with section]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ IMMEDIATE ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ [Action 1]
→ [Action 2]
→ [Action 3]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 DOCUMENTS REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• [Document 1]
• [Document 2]
• [Document 3]

Use EXACTLY this format with the lines and emojis.
"""

ACTIVE_PROMPT = "CUSTOM_PROMPT_TEMPLATE"
```

---

**Now you have full control over ChatGPT's responses!** 🎉

Edit `prompts_config.py` to get exactly the format you want.
