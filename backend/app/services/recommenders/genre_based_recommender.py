# app/services/recommenders/genre_based_recommender.py

from typing import List, Dict, Any
import json
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL: str = os.getenv("SUPABASE_URL")
SUPABASE_KEY: str = os.getenv("SUPABASE_KEY")

# class GenreBasedRecommender:
#     """Recommends books based on user's favorite genres"""
    
#     def __init__(self):
#         # Genre similarity matrix
#         # Genre similarity matrix (values represent relatedness from 0.0 to 1.0)
#         self.genre_similarity = {
#             "Fiction": {
#                 "Fiction": 1.0,
#                 "Non-Fiction": 0.2,
#                 "Mystery": 0.7,
#                 "Science Fiction": 0.8,
#                 "Fantasy": 0.8,
#                 "Romance": 0.6,
#                 "Thriller": 0.7,
#                 "Horror": 0.6,
#                 "Biography": 0.2,
#                 "History": 0.3,
#                 "Self-Help": 0.1,
#                 "Business": 0.1,
#                 "Children's": 0.4,
#                 "Young Adult": 0.6,
#                 "Comics & Graphic Novels": 0.5,
#                 "Poetry": 0.4,
#                 "Other": 0.3
#             },
#             "Non-Fiction": {
#                 "Fiction": 0.2,
#                 "Non-Fiction": 1.0,
#                 "Mystery": 0.2,
#                 "Science Fiction": 0.2,
#                 "Fantasy": 0.1,
#                 "Romance": 0.1,
#                 "Thriller": 0.2,
#                 "Horror": 0.1,
#                 "Biography": 0.8,
#                 "History": 0.8,
#                 "Self-Help": 0.7,
#                 "Business": 0.8,
#                 "Children's": 0.3,
#                 "Young Adult": 0.3,
#                 "Comics & Graphic Novels": 0.2,
#                 "Poetry": 0.3,
#                 "Other": 0.3
#             },
#             "Mystery": {
#                 "Fiction": 0.7,
#                 "Non-Fiction": 0.2,
#                 "Mystery": 1.0,
#                 "Science Fiction": 0.4,
#                 "Fantasy": 0.4,
#                 "Romance": 0.5,
#                 "Thriller": 0.9,
#                 "Horror": 0.7,
#                 "Biography": 0.2,
#                 "History": 0.3,
#                 "Self-Help": 0.1,
#                 "Business": 0.1,
#                 "Children's": 0.3,
#                 "Young Adult": 0.5,
#                 "Comics & Graphic Novels": 0.3,
#                 "Poetry": 0.2,
#                 "Other": 0.3
#             },
#             "Science Fiction": {
#                 "Fiction": 0.8,
#                 "Non-Fiction": 0.2,
#                 "Mystery": 0.4,
#                 "Science Fiction": 1.0,
#                 "Fantasy": 0.8,
#                 "Romance": 0.4,
#                 "Thriller": 0.5,
#                 "Horror": 0.5,
#                 "Biography": 0.1,
#                 "History": 0.3,
#                 "Self-Help": 0.1,
#                 "Business": 0.1,
#                 "Children's": 0.4,
#                 "Young Adult": 0.6,
#                 "Comics & Graphic Novels": 0.6,
#                 "Poetry": 0.2,
#                 "Other": 0.3
#             },
#             "Fantasy": {
#                 "Fiction": 0.8,
#                 "Non-Fiction": 0.1,
#                 "Mystery": 0.4,
#                 "Science Fiction": 0.8,
#                 "Fantasy": 1.0,
#                 "Romance": 0.5,
#                 "Thriller": 0.4,
#                 "Horror": 0.6,
#                 "Biography": 0.1,
#                 "History": 0.2,
#                 "Self-Help": 0.1,
#                 "Business": 0.1,
#                 "Children's": 0.6,
#                 "Young Adult": 0.7,
#                 "Comics & Graphic Novels": 0.7,
#                 "Poetry": 0.3,
#                 "Other": 0.3
#             },
#             "Romance": {
#                 "Fiction": 0.6,
#                 "Non-Fiction": 0.1,
#                 "Mystery": 0.5,
#                 "Science Fiction": 0.4,
#                 "Fantasy": 0.5,
#                 "Romance": 1.0,
#                 "Thriller": 0.4,
#                 "Horror": 0.3,
#                 "Biography": 0.2,
#                 "History": 0.2,
#                 "Self-Help": 0.3,
#                 "Business": 0.1,
#                 "Children's": 0.3,
#                 "Young Adult": 0.7,
#                 "Comics & Graphic Novels": 0.3,
#                 "Poetry": 0.4,
#                 "Other": 0.3
#             },
#             "Thriller": {
#                 "Fiction": 0.7,
#                 "Non-Fiction": 0.2,
#                 "Mystery": 0.9,
#                 "Science Fiction": 0.5,
#                 "Fantasy": 0.4,
#                 "Romance": 0.4,
#                 "Thriller": 1.0,
#                 "Horror": 0.8,
#                 "Biography": 0.2,
#                 "History": 0.3,
#                 "Self-Help": 0.1,
#                 "Business": 0.1,
#                 "Children's": 0.2,
#                 "Young Adult": 0.5,
#                 "Comics & Graphic Novels": 0.3,
#                 "Poetry": 0.2,
#                 "Other": 0.3
#             },
#             "Horror": {
#                 "Fiction": 0.6,
#                 "Non-Fiction": 0.1,
#                 "Mystery": 0.7,
#                 "Science Fiction": 0.5,
#                 "Fantasy": 0.6,
#                 "Romance": 0.3,
#                 "Thriller": 0.8,
#                 "Horror": 1.0,
#                 "Biography": 0.1,
#                 "History": 0.2,
#                 "Self-Help": 0.1,
#                 "Business": 0.1,
#                 "Children's": 0.2,
#                 "Young Adult": 0.4,
#                 "Comics & Graphic Novels": 0.4,
#                 "Poetry": 0.2,
#                 "Other": 0.3
#             },
#             "Biography": {
#                 "Fiction": 0.2,
#                 "Non-Fiction": 0.8,
#                 "Mystery": 0.2,
#                 "Science Fiction": 0.1,
#                 "Fantasy": 0.1,
#                 "Romance": 0.2,
#                 "Thriller": 0.2,
#                 "Horror": 0.1,
#                 "Biography": 1.0,
#                 "History": 0.8,
#                 "Self-Help": 0.5,
#                 "Business": 0.5,
#                 "Children's": 0.2,
#                 "Young Adult": 0.2,
#                 "Comics & Graphic Novels": 0.2,
#                 "Poetry": 0.3,
#                 "Other": 0.3
#             },
#             "History": {
#                 "Fiction": 0.3,
#                 "Non-Fiction": 0.8,
#                 "Mystery": 0.3,
#                 "Science Fiction": 0.3,
#                 "Fantasy": 0.2,
#                 "Romance": 0.2,
#                 "Thriller": 0.3,
#                 "Horror": 0.2,
#                 "Biography": 0.8,
#                 "History": 1.0,
#                 "Self-Help": 0.2,
#                 "Business": 0.4,
#                 "Children's": 0.3,
#                 "Young Adult": 0.3,
#                 "Comics & Graphic Novels": 0.2,
#                 "Poetry": 0.3,
#                 "Other": 0.3
#             },
#             "Self-Help": {
#                 "Fiction": 0.1,
#                 "Non-Fiction": 0.7,
#                 "Mystery": 0.1,
#                 "Science Fiction": 0.1,
#                 "Fantasy": 0.1,
#                 "Romance": 0.3,
#                 "Thriller": 0.1,
#                 "Horror": 0.1,
#                 "Biography": 0.5,
#                 "History": 0.2,
#                 "Self-Help": 1.0,
#                 "Business": 0.7,
#                 "Children's": 0.2,
#                 "Young Adult": 0.3,
#                 "Comics & Graphic Novels": 0.1,
#                 "Poetry": 0.2,
#                 "Other": 0.3
#             },
#             "Business": {
#                 "Fiction": 0.1,
#                 "Non-Fiction": 0.8,
#                 "Mystery": 0.1,
#                 "Science Fiction": 0.1,
#                 "Fantasy": 0.1,
#                 "Romance": 0.1,
#                 "Thriller": 0.1,
#                 "Horror": 0.1,
#                 "Biography": 0.5,
#                 "History": 0.4,
#                 "Self-Help": 0.7,
#                 "Business": 1.0,
#                 "Children's": 0.1,
#                 "Young Adult": 0.1,
#                 "Comics & Graphic Novels": 0.1,
#                 "Poetry": 0.1,
#                 "Other": 0.3
#             },
#             "Children's": {
#                 "Fiction": 0.4,
#                 "Non-Fiction": 0.3,
#                 "Mystery": 0.3,
#                 "Science Fiction": 0.4,
#                 "Fantasy": 0.6,
#                 "Romance": 0.3,
#                 "Thriller": 0.2,
#                 "Horror": 0.2,
#                 "Biography": 0.2,
#                 "History": 0.3,
#                 "Self-Help": 0.2,
#                 "Business": 0.1,
#                 "Children's": 1.0,
#                 "Young Adult": 0.7,
#                 "Comics & Graphic Novels": 0.6,
#                 "Poetry": 0.4,
#                 "Other": 0.3
#             },
#             "Young Adult": {
#                 "Fiction": 0.6,
#                 "Non-Fiction": 0.3,
#                 "Mystery": 0.5,
#                 "Science Fiction": 0.6,
#                 "Fantasy": 0.7,
#                 "Romance": 0.7,
#                 "Thriller": 0.5,
#                 "Horror": 0.4,
#                 "Biography": 0.2,
#                 "History": 0.3,
#                 "Self-Help": 0.3,
#                 "Business": 0.1,
#                 "Children's": 0.7,
#                 "Young Adult": 1.0,
#                 "Comics & Graphic Novels": 0.6,
#                 "Poetry": 0.4,
#                 "Other": 0.3
#             },
#             "Comics & Graphic Novels": {
#                 "Fiction": 0.5,
#                 "Non-Fiction": 0.2,
#                 "Mystery": 0.3,
#                 "Science Fiction": 0.6,
#                 "Fantasy": 0.7,
#                 "Romance": 0.3,
#                 "Thriller": 0.3,
#                 "Horror": 0.4,
#                 "Biography": 0.2,
#                 "History": 0.2,
#                 "Self-Help": 0.1,
#                 "Business": 0.1,
#                 "Children's": 0.6,
#                 "Young Adult": 0.6,
#                 "Comics & Graphic Novels": 1.0,
#                 "Poetry": 0.3,
#                 "Other": 0.3
#             },
#             "Poetry": {
#                 "Fiction": 0.4,
#                 "Non-Fiction": 0.3,
#                 "Mystery": 0.2,
#                 "Science Fiction": 0.2,
#                 "Fantasy": 0.3,
#                 "Romance": 0.4,
#                 "Thriller": 0.2,
#                 "Horror": 0.2,
#                 "Biography": 0.3,
#                 "History": 0.3,
#                 "Self-Help": 0.2,
#                 "Business": 0.1,
#                 "Children's": 0.4,
#                 "Young Adult": 0.4,
#                 "Comics & Graphic Novels": 0.3,
#                 "Poetry": 1.0,
#                 "Other": 0.3
#             },
#             "Other": {
#                 "Fiction": 0.3,
#                 "Non-Fiction": 0.3,
#                 "Mystery": 0.3,
#                 "Science Fiction": 0.3,
#                 "Fantasy": 0.3,
#                 "Romance": 0.3,
#                 "Thriller": 0.3,
#                 "Horror": 0.3,
#                 "Biography": 0.3,
#                 "History": 0.3,
#                 "Self-Help": 0.3,
#                 "Business": 0.3,
#                 "Children's": 0.3,
#                 "Young Adult": 0.3,
#                 "Comics & Graphic Novels": 0.3,
#                 "Poetry": 0.3,
#                 "Other": 1.0
#             }
#         }
        
#         # Supabase client configuration
#         self.supabase_url = SUPABASE_URL
#         self.supabase_key = SUPABASE_KEY
#         self.headers = {
#             "apikey": self.supabase_key,
#             "Authorization": f"Bearer {self.supabase_key}",
#             "Content-Type": "application/json"
#         }
    
# async def get_recommendations(self, user_id: int, limit: int = 20) -> List[Dict[str, Any]]:
#     try:
#         # Check if genre_similarity is properly initialized
#         if not hasattr(self, 'genre_similarity') or not self.genre_similarity:
#             print("Warning: genre_similarity not initialized")
#             return []
#         print(self.genre_similarity["0"])
            
#         async with httpx.AsyncClient() as client:
#             # Get the user's favorite genres
#             try:
#                 user_response = await client.get(
#                     f"{self.supabase_url}/rest/v1/users?id=eq.{user_id}&select=favorite_genres",
#                     headers=self.headers
#                 )
                
#                 print(f"User response status: {user_response.status_code}")
                
#                 if user_response.status_code != 200:
#                     print(f"Error fetching user: {user_response.text}")
#                     return []
                
#                 user_data = user_response.json()
#                 if not user_data:
#                     print(f"No user found with ID: {user_id}")
#                     return []
                    
#                 user_data = user_data[0]
#                 favorite_genres = user_data.get("favorite_genres", [])
                
#                 print(f"Raw favorite_genres: {favorite_genres}")
                
#                 # If favorite_genres is a string, try to parse it as JSON
#                 if isinstance(favorite_genres, str):
#                     try:
#                         favorite_genres = json.loads(favorite_genres)
#                         print(f"Parsed favorite_genres: {favorite_genres}")
#                     except json.JSONDecodeError as e:
#                         print(f"JSON decode error: {e}")
#                         favorite_genres = [favorite_genres]  # Single genre as string
                
#                 if not favorite_genres:
#                     print("No favorite genres found")
#                     return []
                    
#                 print(f"Final favorite_genres: {favorite_genres}")
                
#                 # Get all available books not owned by the user
#                 books_response = await client.get(
#                     f"{self.supabase_url}/rest/v1/books?is_available=eq.true&owner_id=neq.{user_id}",
#                     headers=self.headers
#                 )
                
#                 if books_response.status_code != 200:
#                     print(f"Error fetching books: {books_response.text}")
#                     return []
                    
#                 available_books = books_response.json()
#                 print(f"Found {len(available_books)} available books")
                
#                 # Score each book based on genre match
#                 scored_books = []
#                 for i, book in enumerate(available_books):
#                     # Base score starts at 0
#                     score = 0
#                     genre_reason = None
                    
#                     book_genre = book.get("genre")
#                     if not book_genre:
#                         print(f"Book {book.get('id', i)} has no genre, skipping")
#                         continue
                    
#                     # Check direct genre match first
#                     if book_genre in favorite_genres:
#                         score = 100  # Perfect match
#                         genre_reason = book_genre
#                     else:
#                         # Look for similar genres
#                         for fav_genre in favorite_genres:
#                             if fav_genre in self.genre_similarity and book_genre in self.genre_similarity[fav_genre]:
#                                 similarity = self.genre_similarity[fav_genre][book_genre]
#                                 if similarity * 100 > score:  # Keep the highest similarity score
#                                     score = similarity * 100
#                                     genre_reason = fav_genre
                    
#                     # Only include books with some genre relevance
#                     if score > 0:
#                         book_copy = book.copy()  # Create a copy to avoid modifying original
#                         book_copy["score"] = score
#                         book_copy["matching_genre"] = genre_reason
#                         book_copy["reason"] = f"Because you like {genre_reason}"
#                         scored_books.append(book_copy)
                
#                 print(f"Scored {len(scored_books)} relevant books")
                
#                 # Sort by score (highest first) and return top results
#                 scored_books.sort(key=lambda x: x.get("score", 0), reverse=True)
#                 return scored_books[:limit]
                
#             except Exception as e:
#                 print(f"Error in recommendation process: {str(e)}")
#                 import traceback
#                 traceback.print_exc()
#                 return []
                
#     except Exception as e:
#         print(f"Unexpected error in get_recommendations: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         return []

class GenreBasedRecommender:
    """Simplified recommender for testing"""
    
    def __init__(self):
        print("Initializing GenreBasedRecommender")
        print(SUPABASE_URL, SUPABASE_KEY)
        self.genre_similarity = {"Fiction": {"Fiction": 1.0}}
        self.supabase_url = SUPABASE_URL
        self.supabase_key = SUPABASE_KEY
        self.headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json"
        }
        
    async def get_recommendations(self, user_id: int, limit: int = 20):
        print(f"get_recommendations called with user_id={user_id}, limit={limit}")
        # Return dummy data
        return [
            {
                "id": 1,
                "title": "Test Book",
                "author": "Test Author",
                "genre": "Fiction",
                "condition": "Good",
                "is_available": True,
                "reason": "Test recommendation"
            }
        ]