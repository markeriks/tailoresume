from fastapi import APIRouter, HTTPException, Depends
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
    request: TransformRequest,
    user=Depends(verify_firebase_token),
):
    try:
        prompt = f'Please {request.action} the following text: "{request.text}"'

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You help revise and improve short snippets of resume text."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=300,
        )

        result_text = response.choices[0].message.content.strip()

        return {"result": result_text}

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
