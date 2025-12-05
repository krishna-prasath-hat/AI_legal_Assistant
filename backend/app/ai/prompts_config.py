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

LEGAL_ANALYSIS_PROMPT = """You are an expert Indian legal advisor. Analyze this incident and provide detailed legal guidance.

INCIDENT DESCRIPTION:
{incident_text}

LOCATION: {location}
DATE: {incident_date}

YOUR TASK:
Provide a comprehensive legal analysis in the following format:

1. INCIDENT CLASSIFICATION
   - Offense Type: (e.g., cybercrime, theft, fraud, assault)
   - Category: (criminal/civil/consumer/family)
   - Severity: (low/medium/high)
   - Confidence: (percentage)

2. APPLICABLE LAWS
   For each relevant law section, provide:
   - Act Name (IPC/CrPC/IT Act/Consumer Act/etc.)
   - Section Number
   - Section Title
   - Why it applies to this case
   - Relevance score (0-100%)

3. LEGAL SUMMARY
   Write 2-3 paragraphs explaining:
   - What legal violations occurred
   - Which laws apply and why
   - Potential consequences
   - Recommended actions

4. NEXT STEPS
   List 5-7 specific action items the person should take

5. REQUIRED DOCUMENTS
   List all documents needed to file a complaint

6. KEY INFORMATION
   Extract important details like:
   - Names mentioned
   - Dates and times
   - Amounts of money
   - Phone numbers
   - Locations

IMPORTANT:
- Use simple, clear language
- Be specific and actionable
- Focus on Indian laws only
- Provide practical guidance
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

FIR_DRAFT_PROMPT = """Draft a formal FIR (First Information Report) for an Indian police station.

COMPLAINANT DETAILS:
Name: {user_name}
Address: {user_address}
Phone: {user_phone}

INCIDENT:
{incident_text}

APPLICABLE SECTIONS:
{legal_sections}

FORMAT REQUIRED:
1. Subject line
2. Formal salutation
3. Complainant introduction
4. Detailed incident description
5. Request for action under specific sections
6. Verification statement
7. Signature block

Use formal legal language appropriate for Indian police stations."""

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

Return ONLY a JSON array:
[
  {{
    "section_number": "378",
    "act_name": "IPC",
    "relevance_score": 0.9,
    "reasoning": "This section applies because..."
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
