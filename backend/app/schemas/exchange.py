from pydantic import BaseModel
from typing import Literal

class ExchangeCreate(BaseModel):
    book_id: str

class ExchangeStatusUpdate(BaseModel):
    status: Literal["accepted", "rejected"]

class ExchangeResponse(BaseModel):
    id: str
    book_id: str
    from_user_id: str
    to_user_id: str
    status: str
    created_at: str