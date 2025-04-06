# app/services/unified_recommendation_service.py

from typing import List, Dict, Any
import asyncio
from app.services.recommenders.genre_based_recommender import GenreBasedRecommender
from app.services.recommenders.location_based_recommender import LocationBasedRecommender
from app.services.recommenders.recommendation_diversifier import RecommendationDiversifier

class UnifiedRecommendationService:
    """Combines multiple recommendation sources into a unified recommendation feed"""
    
    def __init__(self):
        self.genre_recommender = GenreBasedRecommender()
        self.location_recommender = LocationBasedRecommender()
        self.diversifier = RecommendationDiversifier()
    
    async def get_unified_recommendations(self, user_id: int, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Generate a unified set of recommendations from multiple sources
        
        Args:
            user_id: The ID of the user to get recommendations for
            limit: Maximum number of recommendations to return
            
        Returns:
            A list of recommended books with source information
        """
        # Define expanded limits for each source to ensure we have enough candidates
        source_limit = limit * 2
        
        # Get candidate recommendations from each source concurrently
        genre_recs_task = self.genre_recommender.get_recommendations(user_id, limit=source_limit)
        location_recs_task = self.location_recommender.get_recommendations(user_id, limit=source_limit)
        
        # Await results
        genre_recs, location_recs = await asyncio.gather(
            genre_recs_task,
            location_recs_task
        )
        
        # Assign recommendation source and reason
        for rec in genre_recs:
            rec['source'] = 'genre'
            rec['reason'] = f"Because you like {rec.get('matching_genre', rec['genre'])}"
        
        for rec in location_recs:
            rec['source'] = 'location'
            distance = rec.get('distance', 0)
            rec['reason'] = f"Near you: {distance:.1f} miles away"
        
        # Combine all recommendations
        all_recs = genre_recs + location_recs
        
        # Remove duplicates (prioritize the one with highest score)
        unique_recs = self._remove_duplicates(all_recs)
        
        # Apply diversity filter
        diverse_recs = self.diversifier.ensure_diversity(unique_recs)
        
        # Final scoring and ranking
        final_recs = self._score_and_rank(diverse_recs, user_id)
        
        return final_recs[:limit]
    
    def _remove_duplicates(self, recommendations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate book entries, keeping the one with highest score"""
        book_map = {}
        
        for rec in recommendations:
            book_id = rec.get('id')
            if book_id not in book_map or rec.get('score', 0) > book_map[book_id].get('score', 0):
                book_map[book_id] = rec
                
        return list(book_map.values())
    
    def _score_and_rank(self, recommendations: List[Dict[str, Any]], user_id: int) -> List[Dict[str, Any]]:
        """Apply final scoring adjustments and rank recommendations"""
        # Ensure a good mix of recommendation sources in the top results
        source_counts = {'genre': 0, 'location': 0}
        
        for rec in recommendations:
            source = rec.get('source')
            if source in source_counts:
                source_counts[source] += 1
                
        # Adjust scores to ensure variety in top results
        for rec in recommendations:
            source = rec.get('source')
            if source in source_counts:
                # Boost under-represented sources
                average_count = sum(source_counts.values()) / len(source_counts)
                if source_counts[source] < average_count:
                    boost = (average_count - source_counts[source]) / average_count * 10
                    rec['score'] = rec.get('score', 0) + boost
        
        # Sort by final score
        recommendations.sort(key=lambda x: x.get('score', 0), reverse=True)
        
        return recommendations