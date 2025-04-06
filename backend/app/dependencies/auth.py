from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import os
from dotenv import load_dotenv

load_dotenv()  # Load from .env

security = HTTPBearer()
JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
JWT_ALGORITHM = "HS256"

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    print("Incoming token:", token)
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM], audience="authenticated")
        print("Decoded JWT payload:", payload)
        return payload
    except JWTError as e:
        print("JWT decode error:", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
