from fastapi import APIRouter, HTTPException, Depends, Request
from app.firebase_auth import verify_firebase_token
from app.rate_limit import limiter
from pydantic import BaseModel
from openai import AsyncOpenAI
from dotenv import load_dotenv
import os

router = APIRouter()

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

client = AsyncOpenAI(api_key=api_key)

class TailorRequest(BaseModel):
    jobContent: str
    resumeContent: str  # HTML format

class TailorResponse(BaseModel):
    tailoredResume: str  # Also HTML

@router.post("/tailor", response_model=TailorResponse)
@limiter.limit("5/minute")
async def tailor_resume(
    request: Request,
    body: TailorRequest,
    user=Depends(verify_firebase_token),
):
    try:
        system_prompt = (
            "You're an expert AI resume editor tasked with aggressively tailoring resumes to match job descriptions. "
            "The resume is provided in HTML format. You must significantly revise and enhance the content to align with the job description, "
            "making meaningful changes to responsibilities, skills, achievements, and summaries wherever relevant. "
            "Do not just append generic lines — intelligently rewrite or restructure sections to reflect qualifications and experience "
            "in a way that best matches the job requirements. "
            "You must preserve the original HTML structure and tag hierarchy. "
            "Do not add or remove any HTML elements (such as <p>, <div>, <ul>, <li>, or <section>). "
            "Only edit the text content within the existing tags. "
            "If additional information needs to be added, insert it inside the existing elements without changing their structure or number. "
            "The final result should remain natural, professional, and convincingly authored by the candidate, but clearly optimized for the target role."
        )

        user_prompt = (
            f"Job description:\n{body.jobContent}\n\n"
            f"Resume HTML:\n{body.resumeContent}\n\n"
            "Please tailor the resume for the job and return the complete modified HTML. "
            "Do not wrap the response in markdown or triple backticks — only return the raw HTML. "
            "Do not add or remove any HTML elements. Only modify the text content inside existing elements."
        )


        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.4,
            max_tokens=2500,
        )

        modified_html = response.choices[0].message.content.strip()

        return {"tailoredResume": modified_html}

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
