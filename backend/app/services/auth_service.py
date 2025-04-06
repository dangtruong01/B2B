from app.database import supabase
from app.schemas.auth import SignUpRequest, SignInRequest

def sign_up(data: SignUpRequest):
    response = supabase.auth.sign_up({
        "email": data.email,
        "password": data.password
    })
    return response

def sign_in(data: SignInRequest):
    response = supabase.auth.sign_in_with_password({
        "email": data.email,
        "password": data.password
    })
    return response