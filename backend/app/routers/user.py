from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.dependencies.auth import get_current_user
from app.schemas.user import UserProfile, UserProfileUpdate
from app.services import user_service
from app.database import supabase

router = APIRouter(prefix="/profile", tags=["Profile"])

@router.get("/me", response_model=UserProfile)
async def get_my_profile(user=Depends(get_current_user)):
    """Get the current user's profile information"""
    user_profile = await user_service.get_user_profile(user["sub"])
    if not user_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return user_profile

@router.patch("/me", response_model=UserProfile)
async def update_my_profile(data: UserProfileUpdate, user=Depends(get_current_user)):
    """Update the current user's profile information"""
    updated_profile = await user_service.update_user_profile(user["sub"], data)
    if not updated_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return updated_profile

@router.post("/upload-photo", response_model=dict)
async def upload_profile_photo(
    profile_photo: UploadFile = File(...),
    user = Depends(get_current_user)
):
    """Upload a profile photo for the current user."""
    try:
        # Use the service to handle all the logic
        result = await user_service.upload_and_update_profile_photo(user, profile_photo)
        return result
    except Exception as e:
        # Log the error for debugging
        import traceback
        print(f"Error in upload_profile_photo endpoint: {str(e)}")
        print(traceback.format_exc())
        # Return a user-friendly error
        raise HTTPException(status_code=500, detail=f"Failed to upload profile photo: {str(e)}")