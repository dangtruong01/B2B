from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, Form
from app.schemas.book import BookCreate, AutoFillRequest, StatusUpdateRequest
from app.services import book_service
from app.dependencies.auth import get_current_user
from typing import Optional

router = APIRouter(prefix="/books", tags=["Books"])

@router.post("/")
async def create_book(
    title: str = Form(...),
    author: str = Form(...),
    genre: str = Form(...),
    condition: str = Form(...),
    description: Optional[str] = Form(None),
    status: str = Form(...),
    image: Optional[UploadFile] = File(None),
    user=Depends(get_current_user)
):
    book = BookCreate(
        title=title,
        author=author,
        genre=genre,
        condition=condition,
        description=description,
        status=status,
    )
    
    created = await book_service.create_book_with_image(book, image, user["sub"])
    return created

@router.get("/")
def list_books(
    user=Depends(get_current_user),
    owner_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    genre: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    return book_service.get_filtered_books(
        user_id=user["sub"],
        owner_id=owner_id,
        search=search,
        genre=genre,
        limit=limit,
        offset=offset
    )

@router.get("/me")
def list_my_books(
    user=Depends(get_current_user)
):
    return book_service.get_my_books(user["sub"])


@router.get("/{book_id}")
def get_book(book_id: int):
    book = book_service.get_book_by_id(book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.post("/auto-fill")
async def auto_fill_book(request: AutoFillRequest, user=Depends(get_current_user)):
    try:
        return await book_service.auto_fill_book_details(request.title)
    except Exception as e:
        print("Auto-fill error:", e)
        raise HTTPException(status_code=500, detail="Failed to auto-fill book info")


@router.patch("/{book_id}/toggle-availability")
def toggle_availability(book_id: str, user=Depends(get_current_user)):
    try:
        updated_book = book_service.toggle_book_availability(book_id, user["sub"])
        return updated_book
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{book_id}")
def delete_book(book_id: str, user=Depends(get_current_user)):
    try:
        book_service.delete_book(book_id, user["sub"])
        return {"message": "Book deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/books/status")
def update_book_status(data: StatusUpdateRequest, user=Depends(get_current_user)):
    try:
        updated_book = book_service.update_book_status(
            book_id=data.book_id,
            user_id=user["sub"],
            new_status=data.new_status
        )
        return updated_book
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/books/status/admin")
def update_book_status_admin(data: StatusUpdateRequest):
    try:
        updated_book = book_service.update_book_status_admin(
            book_id=data.book_id,
            new_status=data.new_status
        )
        return updated_book
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))