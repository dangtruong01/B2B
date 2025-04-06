from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class UserProfileBase(BaseModel):
    username: str
    display_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    favorite_genres: Optional[List[str]] = None

class UserProfileUpdate(BaseModel):
    username: Optional[str] = None
    display_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    favorite_genres: Optional[List[str]] = None

class UserProfile(UserProfileBase):
    id: str
    email: Optional[EmailStr] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True