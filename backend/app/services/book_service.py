import os
import httpx
import uuid
import shutil
import json
from fastapi import UploadFile
from app.database import supabase
from app.schemas.book import BookCreate
from typing import List, Optional, Tuple

# Define the base URL for your uploads
UPLOAD_DIR = "uploads/book_covers"
BASE_URL = "http://localhost:8000"  # Change to your server URL

def create_book(book: BookCreate, user_id: str):
    payload = {**book.dict(), "owner_id": user_id}
    print("🚨 Payload being inserted:", payload)  # Add this
    response = supabase.table("books").insert(payload).execute()
    return response.data

def get_all_books():
    response = supabase.table("books").select("*").execute()
    return response.data

def get_book_by_id(book_id: int):
    response = supabase.table("books").select("*").eq("id", book_id).single().execute()
    return response.data

def get_my_books(user_id):
    response=supabase.table("books").select("*").eq("owner_id", user_id).execute()
    return response.data

def toggle_book_availability(book_id: str, user_id: str):
    print("Looking for book ID:", book_id)
    print("With owner ID:", user_id)

    result = supabase.table("books") \
        .select("status") \
        .eq("id", book_id) \
        .eq("owner_id", user_id) \
        .single() \
        .execute()

    if not result.data:
        raise Exception("Book not found or you don't have permission to modify it.")

    current_status = result.data["status"]

    if current_status not in ["available", "unavailable"]:
        raise Exception("Book status cannot be toggled unless it's 'available' or 'unavailable'.")

    new_status = "unavailable" if current_status == "available" else "available"

    updated = supabase.table("books") \
        .update({"status": new_status}) \
        .eq("id", book_id) \
        .eq("owner_id", user_id) \
        .execute()

    return updated.data[0]


def delete_book(book_id: str, user_id: str):
    result = supabase.table("books") \
        .delete() \
        .eq("id", book_id) \
        .eq("owner_id", user_id) \
        .execute()

    return result.data


def get_filtered_books(
    user_id: str,
    owner_id: Optional[str] = None,
    search: Optional[str] = None,
    genre: Optional[str] = None,
    limit: int = 10,
    offset: int = 0,
):
    query = supabase.table("books").select("*").neq("owner_id", user_id)

    if owner_id:
        query = query.eq("owner_id", owner_id)
    if genre:
        query = query.eq("genre", genre)
    if search:
        query = query.or_(
            f"title.ilike.%{search}%,author.ilike.%{search}%"
        )

    query = query.range(offset, offset + limit - 1)  # Supabase uses 0-based inclusive ranges

    result = query.execute()
    return result.data

async def save_upload_file(upload_file: UploadFile) -> str:
    """Save an uploaded file and return its URL path."""
    if not upload_file:
        return None
        
    # Create a unique filename
    file_extension = os.path.splitext(upload_file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save the file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    
    # Return the URL path to the file
    return f"{BASE_URL}/uploads/book_covers/{unique_filename}"

async def create_book_with_image(book: BookCreate, image: UploadFile, user_id: str):
    # Save the image if provided
    image_url = None
    if image:
        image_url = await save_upload_file(image)
    
    # Create the book with image_url
    payload = {**book.dict(), "owner_id": user_id, "image_url": image_url}
    print("🚨 Payload being inserted:", payload)
    response = supabase.table("books").insert(payload).execute()
    return response.data

async def auto_fill_book_details(title: str):
    prompt = f"""
    Given the book title "{title}", return a JSON object with the following fields if possible:
    - title
    - author
    - genre (one of Fiction, Non-Fiction, Mystery, Science Fiction, Fantasy, Romance, Thriller, Horror, Biography, History, Self-Help, Business, Children's, Young Adult, Comics & Graphic Novels, Poetry, Other)
    - description (under 300 characters)

    If any field is unknown, leave it empty or null.
    Respond with JSON only, no explanation.
    """

    headers = {
        "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
        "Content-Type": "application/json"
    }

    body = {
        "model": "anthropic/claude-3-haiku",
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    async with httpx.AsyncClient() as client:
        response = await client.post("https://openrouter.ai/api/v1/chat/completions", json=body, headers=headers)
        response.raise_for_status()
        result = response.json()

    try:
        message = result["choices"][0]["message"]["content"]
        print("[Claude Response]", message)
        return json.loads(message)
    except Exception as e:
        print("Failed to parse response:", e)
        return {}

def update_book_status(book_id: str, user_id: str, new_status: str):
    valid_statuses = ["available", "unavailable", "reserved", "exchanged"]
    if new_status not in valid_statuses:
        raise ValueError("Invalid status value")

    result = supabase.table("books") \
        .update({"status": new_status}) \
        .eq("id", book_id) \
        .eq("owner_id", user_id) \
        .execute()

    if not result.data:
        raise Exception("Book not found or you don't have permission to modify it")

    return result.data[0]


def update_book_status_admin(book_id: str, new_status: str):
    """Used by system (e.g., auto-approve from exchange request)"""
    result = supabase.table("books") \
        .update({"status": new_status}) \
        .eq("id", book_id) \
        .execute()

    if not result.data:
        raise Exception("Book not found")

    return result.data[0]

