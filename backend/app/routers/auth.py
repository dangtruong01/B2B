from fastapi import APIRouter, HTTPException, Depends
from app.schemas.auth import SignUpRequest, SignInRequest
from app.services.auth_service import sign_up, sign_in
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup")
def signup(data: SignUpRequest):
    res = sign_up(data)
    if res.user is None:
        raise HTTPException(status_code=400, detail=res)
    return {"user": res.user.email, "session": res.session}

@router.post("/signin")
def signin(data: SignInRequest):
    res = sign_in(data)
    if res.user is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"user": res.user.email, "access_token": res.session.access_token}

@router.get("/me")
def get_me(user: dict = Depends(get_current_user)):
    return user
