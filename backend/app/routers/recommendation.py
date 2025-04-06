# app/routers/recommendations.py

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
import asyncio
from app.dependencies.auth import get_current_user
from app.schemas.book import BookResponse
from app.services.unified_recommendation_service import UnifiedRecommendationService
from app.services.recommenders.genre_based_recommender import GenreBasedRecommender
from app.services.recommenders.location_based_recommender import LocationBasedRecommender
from app.database import supabase

router = APIRouter(
    prefix="/recommendations",
    tags=["recommendations"],
)

@router.get("/unified", response_model=List[BookResponse])
async def get_unified_recommendations(
    limit: int = Query(20, ge=1, le=50),
    current_user = Depends(get_current_user)
):
    """
    Get a unified set of personalized book recommendations.
    Combines multiple recommendation sources (genre, location) to provide diverse suggestions.
    """
    try:
        recommendation_service = UnifiedRecommendationService()
        recommendations = await recommendation_service.get_unified_recommendations(
            user_id=current_user["sec"], 
            limit=limit
        )
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting recommendations: {str(e)}")

@router.get("/genre", response_model=List[BookResponse])
async def get_genre_recommendations(
    limit: int = Query(20, ge=1, le=50),
    current_user = Depends(get_current_user)
):
    """
    Get book recommendations based on the user's favorite genres.
    Suggests books that match or are similar to the genres the user likes.
    """
    try:
        recommender = GenreBasedRecommender()
        print("Testing1")
        recommendations = await recommender.get_recommendations(
            user_id=current_user["sec"], 
        )
        print("Testing2")
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting genre recommendations: {str(e)}")

@router.get("/location", response_model=List[BookResponse])
async def get_location_recommendations(
    max_distance: float = Query(50.0, ge=0.1, le=500.0),
    limit: int = Query(20, ge=1, le=50),
    current_user = Depends(get_current_user)
):
    """
    Get book recommendations based on proximity to the user.
    Suggests books that are available from users located near the current user.
    """
    try:
        recommender = LocationBasedRecommender()
        recommendations = await recommender.get_recommendations(
            user_id=current_user["sec"], 
            max_distance=max_distance,
            limit=limit
        )
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting location recommendations: {str(e)}")

@router.get("/similar/{book_id}", response_model=List[BookResponse])
async def get_similar_books(
    book_id: int,
    limit: int = Query(10, ge=1, le=50),
    current_user = Depends(get_current_user)
):
    """
    Get books similar to the specified book.
    Useful for 'You might also like' recommendations on book detail pages.
    """
    try:
        from app.database import supabase
        
        # First get the book to find its genre
        book_response = supabase.table("books").select("*").eq("id", book_id).execute()
        
        if not book_response.data:
            raise HTTPException(status_code=404, detail="Book not found")
                
        book = book_response.data[0]
        
        # Get books with the same genre, excluding this book
        similar_response = (supabase.table("books")
            .select("*")
            .eq("genre", book["genre"])
            .neq("id", book_id)
            .eq("status", "available")
            .limit(limit)
            .execute())
        
        similar_books = similar_response.data
        
        # Add a reason field
        for similar_book in similar_books:
            similar_book["reason"] = f"Same genre: {book['genre']}"
            
        return similar_books
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting similar books: {str(e)}")

@router.get("/trending", response_model=List[BookResponse])
async def get_trending_books(
    limit: int = Query(10, ge=1, le=50),
    current_user = Depends(get_current_user)
):
    """
    Get currently trending books on the platform.
    Trending books are determined by recent activity and popularity.
    """
    try:
        from app.database import supabase
        
        # This is a placeholder for trending books logic
        # In a real implementation, you would track book views, requests, etc.
        trending_response = (supabase.table("books")
            .select("*")
            .eq("status", "available")
            .order("created_at", desc=True)
            .limit(limit)
            .execute())
        
        trending_books = trending_response.data
        
        # Add a reason field
        for book in trending_books:
            book["reason"] = "Recently added"
            
        return trending_books
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting trending books: {str(e)}")