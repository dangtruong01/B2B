import os
import uuid
import shutil
from app.database import supabase
from app.schemas.user import UserProfileUpdate
from typing import Dict, Any, Optional
from fastapi import UploadFile

# Define the base URL for your uploads
UPLOAD_DIR = "uploads/profile_photos"
BASE_URL = "http://localhost:8000"

async def get_user_profile(user_id: str) -> Optional[Dict[str, Any]]:
    """Get a user's profile by their ID"""
    response = supabase.table("users").select("*").eq("id", user_id).execute()
    
    if not response.data or len(response.data) == 0:
        # User profile doesn't exist yet
        return None
    
    return response.data[0]

async def update_user_profile(user_id: str, profile_data: UserProfileUpdate) -> Optional[Dict[str, Any]]:
    """Update a user's profile"""
    # First check if the profile exists
    existing_profile = await get_user_profile(user_id)
    
    # Convert Pydantic model to dict and filter out None values
    update_data = {k: v for k, v in profile_data.dict().items() if v is not None}
    
    if existing_profile:
        # Update existing profile
        response = supabase.table("users").update(update_data).eq("id", user_id).execute()
    else:
        # Create new profile with user_id
        update_data["id"] = user_id
        response = supabase.table("users").insert(update_data).execute()
    
    if not response.data or len(response.data) == 0:
        return None
    
    return response.data[0]

async def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:
    """Get a user by their username"""
    response = supabase.table("users").select("*").eq("username", username).execute()
    
    if not response.data or len(response.data) == 0:
        return None
    
    return response.data[0]

async def save_profile_photo(upload_file: UploadFile) -> str:
    """Save an uploaded profile photo and return its URL path."""
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
    return f"{BASE_URL}/uploads/profile_photos/{unique_filename}"

async def debug_user_id(user):
    """Debug function to find the correct way to query the user."""
    # Get user ID from user object - handling different structures
    user_id = None
    if isinstance(user, dict):
        if "sub" in user:
            user_id = user["sub"]
        elif "id" in user:
            user_id = user["id"]
        elif "user_id" in user:
            user_id = user["user_id"]
    elif hasattr(user, "id"):
        user_id = user.id
    elif hasattr(user, "sub"):
        user_id = user.sub
        
    print(f"User ID extracted: {user_id}")
    
    # Try to find the user with different ID fields
    try:
        # First, check if we can find the user with id
        response = supabase.table("users").select("*").eq("id", user_id).execute()
        if response.data and len(response.data) > 0:
            print(f"Found user with id={user_id}")
            return {"field": "id", "value": user_id}
    except Exception as e:
        print(f"Error querying by id: {str(e)}")
    
    try:
        # Check if we can find the user with user_id
        response = supabase.table("users").select("*").eq("user_id", user_id).execute()
        if response.data and len(response.data) > 0:
            print(f"Found user with user_id={user_id}")
            return {"field": "user_id", "value": user_id}
    except Exception as e:
        print(f"Error querying by user_id: {str(e)}")
    
    try:
        # If user["sub"] is a UUID, it might be formatted differently in the database
        # Try to find by matching sub to username
        if isinstance(user, dict) and "email" in user:
            email = user["email"]
            response = supabase.table("users").select("*").eq("email", email).execute()
            if response.data and len(response.data) > 0:
                print(f"Found user with email={email}")
                return {"field": "email", "value": email}
    except Exception as e:
        print(f"Error querying by email: {str(e)}")
    
    # If we get here, we couldn't find the user with any method
    print("Could not find a way to query the user")
    return None

async def update_user_profile_photo(user, profile_photo_url: str) -> dict:
    """Update user profile photo in the database."""
    try:
        # First, let's debug to find the right way to query the user
        debug_result = await debug_user_id(user)
        
        if not debug_result:
            # Last resort - try to get all fields from the user object to help debug
            print("User object details:")
            if isinstance(user, dict):
                for key, value in user.items():
                    print(f"  {key}: {value}")
            else:
                for attr in dir(user):
                    if not attr.startswith('__'):
                        try:
                            print(f"  {attr}: {getattr(user, attr)}")
                        except:
                            pass
            
            # Try one more approach - check if we can get the username
            username = None
            if isinstance(user, dict) and "username" in user:
                username = user["username"]
            elif hasattr(user, "username"):
                username = user.username
                
            if username:
                try:
                    response = supabase.table("users").select("*").eq("username", username).execute()
                    if response.data and len(response.data) > 0:
                        print(f"Found user with username={username}")
                        # Use this to update
                        response = (supabase
                            .table("users")
                            .update({"profile_photo_url": profile_photo_url})
                            .eq("username", username)
                            .execute()
                        )
                        return response.data
                except Exception as e:
                    print(f"Error with username query: {str(e)}")
                    
            raise Exception("Could not determine how to query the user in the database")
        
        # Use the field we found in debugging
        field = debug_result["field"]
        value = debug_result["value"]
        
        print(f"Updating user with {field}={value}")
        response = (supabase
            .table("users")
            .update({"profile_photo_url": profile_photo_url})
            .eq(field, value)
            .execute()
        )
        
        if not response.data or len(response.data) == 0:
            print("Update query returned no results")
            raise Exception("Update query affected no rows")
            
        return response.data
            
    except Exception as e:
        print(f"Error updating profile photo: {str(e)}")
        raise e

async def upload_and_update_profile_photo(user, upload_file: UploadFile) -> dict:
    """Complete process to upload and update a user's profile photo."""
    try:
        # Save the photo and get the URL
        profile_photo_url = await save_profile_photo(upload_file)
        
        if not profile_photo_url:
            raise Exception("Failed to save profile photo")
            
        # Update the user profile with the new photo URL
        update_result = await update_user_profile_photo(user, profile_photo_url)
        
        return {
            "profile_photo_url": profile_photo_url,
            "message": "Profile photo uploaded successfully"
        }
    except Exception as e:
        print(f"Error in upload_and_update_profile_photo: {str(e)}")
        raise e