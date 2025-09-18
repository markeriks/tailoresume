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
    resumeContent: str

class TailorResponse(BaseModel):
    tailoredResume: str

@router.post("/tailor", response_model=TailorResponse)
@limiter.limit("5/minute")
async def tailor_resume(
    request: Request,
    body: TailorRequest,
    user=Depends(verify_firebase_token),
):
    try:
        system_prompt = (
            "You are an expert AI resume editor helping users tailor their resumes to specific job descriptions. "
            "The resume is provided in HTML format. Your task is to deeply revise the resume content to closely align with the job description — "
            "highlighting relevant skills, experience, and accomplishments to make the candidate a strong match. "
            "Make thoughtful edits by rewriting, expanding, or refining the **text content only** to emphasize fit for the role. "
            "Use natural, professional, human-sounding language — avoid robotic, overly formal, or complex phrasing. "

            "**Under no circumstance should you change the structure of the document.** "
            "You must preserve the exact HTML tag hierarchy, layout, and element count from the original resume. "
            "Do not add, remove, or reorder any HTML tags or elements — including <p>, <div>, <ul>, <li>, <section>, and others. "
            "Only edit the **text within existing tags**. If you need to add new information, it must be inserted within the existing elements. "
            
            "The number of DOM elements in the output must exactly match the input. "
            "Any deviation from the original HTML structure will break the formatting. Your changes must strictly maintain the original HTML structure."
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
