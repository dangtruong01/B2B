# app/services/recommenders/location_based_recommender.py

from typing import List, Dict, Any, Optional, Tuple
import json
import math
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL: str = os.getenv("SUPABASE_URL")
SUPABASE_KEY: str = os.getenv("SUPABASE_KEY")

class LocationBasedRecommender:
    """Recommends books based on proximity to the user"""
    
    def __init__(self):
        # Constants for Earth radius calculation
        self.EARTH_RADIUS_KM = 6371  # Radius of the earth in kilometers
        self.EARTH_RADIUS_MILES = 3959  # Radius of the earth in miles
        
        # Supabase client configuration
        self.supabase_url = SUPABASE_URL
        self.supabase_key = SUPABASE_KEY
        self.headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json"
        }
    
    async def get_recommendations(self, user_id: int, max_distance: float = 50.0, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Generate book recommendations based on proximity to the user
        
        Args:
            user_id: The ID of the user to get recommendations for
            max_distance: Maximum distance in miles to consider
            limit: Maximum number of recommendations to return
            
        Returns:
            A list of recommended books with distance information
        """
        async with httpx.AsyncClient() as client:
            # Get the user and their location
            user_response = await client.get(
                f"{self.supabase_url}/rest/v1/users?id=eq.{user_id}&select=location",
                headers=self.headers
            )
            
            if user_response.status_code != 200 or not user_response.json():
                return []
            
            user_data = user_response.json()[0]
            user_location = self._parse_location(user_data.get("location"))
            
            if not user_location:
                return []
                
            user_lat, user_lng = user_location
            
            # Get all owners with location information
            owners_response = await client.get(
                f"{self.supabase_url}/rest/v1/users?id=neq.{user_id}&select=id,location",
                headers=self.headers
            )
            
            if owners_response.status_code != 200:
                return []
                
            owners = owners_response.json()
            
            # Filter owners with valid location and calculate distances
            owner_distances = {}
            for owner in owners:
                owner_location = self._parse_location(owner.get("location"))
                if not owner_location:
                    continue
                    
                owner_lat, owner_lng = owner_location
                distance = self._calculate_distance(user_lat, user_lng, owner_lat, owner_lng)
                
                if distance <= max_distance:
                    owner_distances[owner["id"]] = distance
            
            if not owner_distances:
                return []
                
            # Get all available books from owners within distance
            owner_ids = list(owner_distances.keys())
            
            # Build a query for books from these owners
            # Note: This is a simplification. Supabase may require multiple queries 
            # if there are many owner IDs, or you might need to use a more complex filter
            books_response = await client.get(
                f"{self.supabase_url}/rest/v1/books?is_available=eq.true&owner_id=in.({','.join(map(str, owner_ids))})",
                headers=self.headers
            )
            
            if books_response.status_code != 200:
                return []
                
            books = books_response.json()
            
            # Add distance information to each book
            for book in books:
                owner_id = book["owner_id"]
                distance = owner_distances.get(owner_id, float('inf'))
                book["distance"] = distance
                book["score"] = max(0, 100 - (distance * 2))  # Score inversely proportional to distance
            
            # Sort by distance (closest first) and return top results
            books.sort(key=lambda x: x["distance"])
            return books[:limit]
    
    def _parse_location(self, location_data) -> Optional[Tuple[float, float]]:
        """Parse location data to extract coordinates"""
        if not location_data:
            return None
            
        # Handle string format (JSON)
        if isinstance(location_data, str):
            try:
                location_dict = json.loads(location_data)
            except json.JSONDecodeError:
                return None
        else:
            location_dict = location_data
            
        # Extract latitude and longitude
        lat = location_dict.get("latitude")
        lng = location_dict.get("longitude")
        
        if lat is None or lng is None:
            return None
            
        return float(lat), float(lng)
    
    def _calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate distance between two coordinates using the Haversine formula
        Returns distance in miles
        """
        # Convert latitude and longitude from degrees to radians
        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)
        
        # Haversine formula
        dlon = lon2_rad - lon1_rad
        dlat = lat2_rad - lat1_rad
        a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        distance = self.EARTH_RADIUS_MILES * c
        
        return distance