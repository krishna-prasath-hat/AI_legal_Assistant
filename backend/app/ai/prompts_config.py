"""
Customizable ChatGPT Prompts for Legal Analysis

INSTRUCTIONS:
- Edit the prompts below to get the exact output format you want
- Use {variables} to insert dynamic data
- ChatGPT will respond based on how you structure these prompts
"""

# ============================================================================
# MAIN ANALYSIS PROMPT - This is sent to ChatGPT for incident analysis
# ============================================================================

# LEGAL_ANALYSIS_PROMPT = """You are an expert Indian legal advisor with deep knowledge of IPC, CrPC, IT Act, Consumer Protection Act, and other Indian laws.

# INCIDENT DESCRIPTION:
# {incident_text}

# LOCATION: {location}
# DATE: {incident_date}

# YOUR TASK:
# Analyze this SPECIFIC incident carefully and provide RELEVANT legal guidance. DO NOT give generic responses.

# 1. INCIDENT CLASSIFICATION
#    Based on the ACTUAL incident described:
#    - Offense Type: (Be specific - e.g., "cyber fraud via phishing", "document forgery", "theft of mobile device")
#    - Category: (criminal/civil/consumer/family/cyber)
#    - Severity: (low/medium/high based on the actual incident)
#    - Confidence: (your confidence in this classification)

# 2. APPLICABLE LAWS (ONLY RELEVANT ONES)
#    List ONLY the laws that ACTUALLY apply to THIS specific incident:
#    - Act Name and Section Number
#    - Section Title
#    - Why THIS section applies to THIS incident (be specific)
#    - Relevance score (how relevant to this case)
   
#    Examples:
#    - For cyber fraud: IT Act Section 66D (Cheating by personation using computer resource)
#    - For document issues: IPC Section 420 (Cheating), Section 467 (Forgery of valuable security)
#    - For theft: IPC Section 378 (Theft), Section 379 (Punishment for theft)

# 3. LEGAL SUMMARY
#    Write 2-3 paragraphs explaining:
#    - What SPECIFICALLY happened in this incident
#    - Which SPECIFIC laws apply and WHY they apply to THIS case
#    - Potential consequences for THIS type of incident
#    - Recommended actions for THIS specific situation

# 4. NEXT STEPS (SPECIFIC TO THIS INCIDENT)
#    List 5-7 SPECIFIC action items for THIS incident:
#    - First immediate action
#    - Where to file complaint (specific authority)
#    - What evidence to collect for THIS case
#    - Legal remedies available for THIS incident
#    - Timeline expectations
   
#    DO NOT include generic steps. Make them specific to the incident.

# 5. REQUIRED DOCUMENTS (ONLY RELEVANT ONES)
#    List ONLY documents needed for THIS specific type of incident:
#    - For cyber fraud: Bank statements, transaction records, screenshots, email/SMS evidence
#    - For document issues: Original documents, copies, affidavits
#    - For theft: FIR copy, purchase receipts, photos
#    - For consumer issues: Bills, warranty cards, correspondence
   
#    DO NOT list irrelevant documents like "Medical reports" for a document fraud case.

# 6. KEY INFORMATION
#    Extract SPECIFIC details from the incident:
#    - Names mentioned
#    - Dates and times
#    - Amounts of money (if any)
#    - Phone numbers/emails (if any)
#    - Locations
#    - Any other relevant details

# 7. FOLLOW-UP ACTIONS
#    Suggest SPECIFIC follow-ups for THIS incident:
#    - What to do after filing complaint
#    - How to track progress
#    - When to expect response
#    - Additional legal remedies available

# 8. DRAFT COMPLAINT (if applicable)
#    Provide a BRIEF draft complaint text specific to this incident that the user can use.

# IMPORTANT RULES:
# - Be SPECIFIC to the actual incident described
# - DO NOT give generic advice
# - ONLY suggest relevant laws and documents
# - Make recommendations actionable and practical
# - Use simple, clear language
# - Focus on Indian laws only
# - If the incident is unclear, ask for clarification rather than guessing

# EXAMPLE OF GOOD vs BAD:
# BAD: "File a complaint with the magistrate" (too generic)
# GOOD: "File a cyber crime complaint at cybercrime.gov.in portal within 24 hours, including all transaction screenshots"

# BAD: "Medical reports (if applicable)" (not relevant to document fraud)
# GOOD: "Certified copies of the original documents and affidavit stating the loss"
# """

LEGAL_ANALYSIS_PROMPT = """
You are a senior Indian Legal Advisor. Provide a comprehensive, actionable legal analysis.

INCIDENT DESCRIPTION:
{incident_text}

YOUR TASK:
Analyze the incident and generate a structured report in the EXACT format below. Use Markdown.

---

### 1. APPLICABLE LAWS
**IPC (Indian Penal Code)**
- **Section [Number] – [Offense Name]**
  [Explanation of why it applies]
- [Repeat for other sections]

**IT Act (Information Technology Act, 2000)** (If applicable)
- **Section [Number] – [Offense Name]**
  [Explanation]

**CrPC (Procedure)**
- [Relevant procedures, e.g., Filing FIR]

### 2. CIVIL REMEDIES (Optional)
- **[Remedy Name]** (e.g., Cease & Desist Notice)
  [Explanation of how it helps]

### 3. COURT OPTIONS & APPROX COSTS
Provide realistic Indian market estimates:
1. **Criminal Case (FIR + Police Investigation)**
   - Cost: [e.g., Free for FIR, Lawyer fees if involved]
2. **Civil Notice (Cease & Desist)**
   - Lawyer Draft Cost: [Range in ₹]
3. **[Other Options]**
   - Cost: [Range in ₹]

### 4. FIRST STEPS IMMEDIATELY AFTER THE INCIDENT
Step 1: [Action]
Step 2: [Action]
Step 3: [Action]
...

---

**Rules:**
- Be HIGHLY SPECIFIC to the incident.
- Suggest REAL SECTIONS (e.g., IPC 379, IT Act 66D).
- Provide REALISTIC COST ESTIMATES in INR.
- Include URLs for reporting (e.g., cybercrime.gov.in) if relevant.
"""

# ============================================================================
# ALTERNATIVE: SIMPLE PROMPT (if you want shorter responses)
# ============================================================================

SIMPLE_ANALYSIS_PROMPT = """Analyze this legal incident in India:

{incident_text}

Provide:
1. What type of crime/issue is this?
2. Which Indian laws apply? (IPC sections, IT Act, etc.)
3. What should the person do immediately?
4. What documents are needed?

Keep it brief and practical."""

# ============================================================================
# CUSTOM PROMPT TEMPLATE (Design your own format)
# ============================================================================

CUSTOM_PROMPT_TEMPLATE = """
[EDIT THIS SECTION TO CREATE YOUR OWN PROMPT]

You can use these variables:
- {incident_text} - The user's incident description
- {location} - Location of incident (if provided)
- {incident_date} - Date of incident (if provided)
- {classification} - AI classification result
- {offense_type} - Type of offense detected
- {severity} - Severity level

Example custom prompt:

"I need you to analyze this legal case in India:

Incident: {incident_text}

Please respond in this EXACT format:

**CASE TYPE:** [criminal/civil/consumer/other]

**APPLICABLE LAWS:**
1. [Act Name] Section [Number] - [Reason]
2. [Act Name] Section [Number] - [Reason]

**WHAT TO DO:**
- Step 1: [Action]
- Step 2: [Action]
- Step 3: [Action]

**DOCUMENTS NEEDED:**
- [Document 1]
- [Document 2]

Keep it simple and actionable."
"""

# ============================================================================
# FIR DRAFT PROMPT - For generating FIR documents
# ============================================================================

FIR_DRAFT_PROMPT = """Draft a formal FIR (First Information Report) for an Indian police station based on the following details.

COMPLAINANT DETAILS:
Name: {user_name}
Address: {user_address}
Phone: {user_phone}

INCIDENT DESCRIPTION:
{incident_text}

PROVIDED LEGAL SECTIONS (Reference Only):
{legal_sections}

INSTRUCTIONS:
1. Subject Line: Create a specific subject line mentioning the offense type (e.g., "Complaint regarding Theft of Mobile Phone and Cyber Harassment"). Do NOT use "general" unless absolutely necessary.
2. Applicable Sections: If the 'PROVIDED LEGAL SECTIONS' list is empty, generic, or insufficient, YOU MUST DETERMINE the relevant IPC/IT Act sections based on the incident description and cite them in the request for action.
3. Content: Draft a professional, detailed complaint addressed to the Station House Officer (SHO).
4. Structure:
   - To Address
   - Subject
   - Body (Incident details, specific allegations)
   - Request for Action (Cite specific laws like IPC 379, IT Act 66, etc.)
   - Conclusion (Signature block)

Use formal legal language appropriate for Indian police stations."""

# ============================================================================
# NEXT STEPS PROMPT - For structured JSON guidance
# ============================================================================

NEXT_STEPS_PROMPT = """Analyze the following incident and provide structured practical guidance.

INCIDENT: {incident_text}

CLASSIFICATION: {classification}

CONTEXT: {police_station_context}

TASK:
1. List 3-5 IMMEDIATE NEXT STEPS based on the specific incident.
   - CRITICAL: If a police station is named in the CONTEXT, you MUST mention it explicitly in Step 1 (e.g., "File an FIR at [Station Name]").
   - Be practical and specific (e.g., "Block credit card", "Change passwords").
2. List REQUIRED DOCUMENTS specific to this case.

OUTPUT FORMAT (JSON ONLY):
{{
  "next_steps": [
    "Step 1...",
    "Step 2..."
  ],
  "required_documents": [
    "Doc 1...",
    "Doc 2..."
  ]
}}
"""

# ============================================================================
# SECTION REFINEMENT PROMPT - For analyzing legal sections
# ============================================================================

SECTION_REFINEMENT_PROMPT = """You are a legal expert analyzing an incident under Indian law.

INCIDENT: {incident_text}

CLASSIFICATION: {offense_type} ({offense_category})
SEVERITY: {severity_level}

POTENTIALLY RELEVANT LEGAL SECTIONS:
{sections_list}

For each relevant section, provide:
1. Why it applies to this incident
2. Relevance score (0.0 to 1.0)
3. Approximate court fees or filing costs (in INR). If criminal/FIR, mention "Free".

Return ONLY a JSON array:
[
  {{
    "section_number": "378",
    "act_name": "IPC",
    "relevance_score": 0.9,
    "reasoning": "This section applies because...",
    "court_fees": "Free (FIR) / ₹2500 approx"
  }}
]

Focus on the most relevant 3-5 sections."""

# ============================================================================
# CONFIGURATION - Choose which prompt to use
# ============================================================================

# Set this to the prompt you want to use:
# Options: "LEGAL_ANALYSIS_PROMPT", "SIMPLE_ANALYSIS_PROMPT", "CUSTOM_PROMPT_TEMPLATE"
ACTIVE_PROMPT = "LEGAL_ANALYSIS_PROMPT"

# ============================================================================
# RESPONSE FORMAT INSTRUCTIONS
# ============================================================================

RESPONSE_FORMAT_INSTRUCTIONS = """
IMPORTANT: Structure your response clearly with:
- Clear headings
- Bullet points for lists
- Numbered steps for actions
- Bold text for important terms
- Simple language (avoid complex legal jargon)
"""

# ============================================================================
# HOW TO USE THIS FILE
# ============================================================================

"""
TO CUSTOMIZE YOUR CHATGPT RESPONSES:

1. Edit the prompts above to match your desired output format
2. Change ACTIVE_PROMPT to select which prompt to use
3. Restart the backend server
4. Test with an incident description

TIPS FOR WRITING GOOD PROMPTS:
- Be specific about the format you want
- Use examples in your prompt
- Request structured output (JSON, markdown, etc.)
- Specify the level of detail needed
- Include constraints (word count, number of items, etc.)

EXAMPLE: If you want only 3 bullet points:
"Provide exactly 3 bullet points:
- [Point 1]
- [Point 2]  
- [Point 3]"
"""
