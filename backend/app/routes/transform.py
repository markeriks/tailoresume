from fastapi import APIRouter, HTTPException, Depends, Request
from app.firebase_auth import verify_firebase_token
from app.rate_limit import limiter
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
import os

router = APIRouter()

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=api_key)

class TransformRequest(BaseModel):
    action: str
    text: str

class TransformResponse(BaseModel):
    result: str

@router.post("/transform", response_model=TransformResponse)
@limiter.limit("5/minute")
async def transform_text(
    request: Request,
    body: TransformRequest,
    user=Depends(verify_firebase_token),
):
    try:
        prompt = f"""
        You are a resume text editor. The user will give you:
        1. A short snippet of resume text.
        2. An action or instruction. This might be one of the following keywords:
        'improve', 'shorter', 'longer', 'make the tone more formal', 
        'make the tone more casual', 'make the tone more professional', 
        'make the tone more friendly'
        OR a freeform request.
        Rules:
        - If the action is gibberish, irrelevant to the snippet, or cannot be applied meaningfully, return the original snippet exactly as given.
        - If the action is valid, revise the snippet accordingly.
        - Use clear, simple, natural language that sounds like a real person, not overly formal or AI-generated.
        - Keep the revised snippet concise, professional, and easy to read.
        - Output ONLY the final snippet, with no added commentary, explanation, or formatting.
        - Do NOT add quotes or any extra characters before or after the snippet.

        Action: {body.action}
        Resume Snippet: "{body.text}"
        Return only the revised snippet or the original snippet if no valid change is possible.
        """

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You revise short resume snippets. Always follow the user instructions exactly. "
                        "Use natural, straightforward language. "
                        "Never add explanations, introductions, or extra text. "
                        "Output only the final snippet with no quotes or extra formatting."
                    )
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=100,
        )


        result_text = response.choices[0].message.content.strip()

        return {"result": result_text}

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
