from app.firebase_auth import verify_firebase_token
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from app.rate_limit import limiter

router = APIRouter()

class TokenVerificationResponse(BaseModel):
    user_id: str
    email: str
    verified: bool

@router.post("/verify", response_model=TokenVerificationResponse)
@limiter.limit("10/minute")
async def verify_token(
    request: Request,
    user=Depends(verify_firebase_token)
):
    """
    Verify Firebase token and return user information for Stripe customer portal
    """
    try:
        # The user parameter contains the decoded token from verify_firebase_token
        user_id = user.get('uid')
        email = user.get('email')
        
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found in token")
        
        if not email:
            raise HTTPException(status_code=400, detail="User email not found in token")
        
        return TokenVerificationResponse(
            user_id=user_id,
            email=email,
            verified=True
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Token verification failed: {str(e)}")