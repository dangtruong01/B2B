from fastapi import UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional

# For file upload with form data
class BookCreate(BaseModel):
    title: str
    author: str
    genre: str
    condition: str
    description: Optional[str] = None
    status: str

    class Config:
        orm_mode = True

# For request handling
async def create_book_form(
    title: str = Form(...),
    author: str = Form(...),
    genre: str = Form(...),
    condition: str = Form(...),
    description: Optional[str] = Form(None),
    status: str = Form(...),
    image: Optional[UploadFile] = File(None)
) -> BookCreate:
    return BookCreate(
        title=title,
        author=author,
        genre=genre,
        condition=condition,
        description=description,
        status=status,
    ), image

class AutoFillRequest(BaseModel):
    title: str

# Add this new model for recommendations
class BookResponse(BaseModel):
    # Recommendation-specific fields
    source: Optional[str] = None
    reason: Optional[str] = None
    score: Optional[float] = None
    distance: Optional[float] = None
    matching_genre: Optional[str] = None

class StatusUpdateRequest(BaseModel):
    book_id: str
    new_status: str