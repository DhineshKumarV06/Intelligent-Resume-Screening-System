from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
import json, PyPDF2, io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

client = Groq(api_key="GROQ_API_KEY")

def extract_pdf_text(file_bytes):
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        return " ".join(page.extract_text() or "" for page in reader.pages)
    except Exception as e:
        return ""

@app.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(None),
    resume_text: str = Form(""),
    job_description: str = Form("")
):
    text = resume_text.strip()

    # Extract text from PDF if uploaded
    if file and file.filename:
        file_bytes = await file.read()
        if file.filename.endswith(".pdf"):
            text = extract_pdf_text(file_bytes)
        else:
            text = file_bytes.decode("utf-8", errors="ignore")

    if not text:
        return {"error": "No resume text found"}

    prompt = f"""You are an expert resume analyzer. Analyze the resume below and return ONLY a valid JSON object. No markdown, no backticks, no explanation — just raw JSON.

RESUME:
{text[:4000]}

{"JOB DESCRIPTION:" + job_description[:1500] if job_description else ""}

Return this exact JSON structure:
{{
  "ats_score": <number 0-100>,
  "ats_breakdown": {{
    "formatting": <0-20>,
    "keywords": <0-25>,
    "experience": <0-25>,
    "education": <0-15>,
    "skills": <0-15>
  }},
  "summary": "<2 sentence assessment>",
  "found_skills": ["skill1", "skill2"],
  "missing_skills": ["skill1", "skill2"],
  "improvements": ["tip1", "tip2", "tip3", "tip4", "tip5"],
  "interview_questions": [
    {{"q": "<question>", "category": "Behavioral"}},
    {{"q": "<question>", "category": "Technical"}},
    {{"q": "<question>", "category": "Situational"}},
    {{"q": "<question>", "category": "Behavioral"}},
    {{"q": "<question>", "category": "Technical"}},
    {{"q": "<question>", "category": "Situational"}}
  ],
  "role_recommendations": [
    {{"title": "<role>", "match": "High", "reason": "<short reason>"}},
    {{"title": "<role>", "match": "Medium", "reason": "<short reason>"}},
    {{"title": "<role>", "match": "Good", "reason": "<short reason>"}},
    {{"title": "<role>", "match": "Medium", "reason": "<short reason>"}}
  ],
  "strengths": ["strength1", "strength2", "strength3"],
  "experience_years": <number>
}}"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000,
            temperature=0.3
        )
        raw = response.choices[0].message.content
        clean = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(clean)
    except json.JSONDecodeError as e:
        return {"error": f"JSON parse error: {str(e)}", "raw": raw[:500]}
    except Exception as e:
        return {"error": str(e)}

@app.get("/")
def root():
    return {"status": "ResumeAI running with Groq"}