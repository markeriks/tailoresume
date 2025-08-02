import os
import json
import base64
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Depends
from dotenv import load_dotenv
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

load_dotenv()
b64_secret = os.environ.get("FIREBASE_SERVICE_ACCOUNT")
decoded = base64.b64decode(b64_secret)
firebase_creds_dict = json.loads(decoded)

cred = credentials.Certificate(firebase_creds_dict)
firebase_admin.initialize_app(cred)

security = HTTPBearer()

def verify_firebase_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid or expired Firebase token")
