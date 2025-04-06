from pydantic import BaseModel, EmailStr

class SignUpRequest(BaseModel):
    email: EmailStr
    password: str

class SignInRequest(BaseModel):
    email: EmailStr
    password: str
