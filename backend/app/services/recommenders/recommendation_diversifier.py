# app/services/recommenders/recommendation_diversifier.py

from typing import List, Dict, Any
from collections import defaultdict

class RecommendationDiversifier:
    """Ensures diversity in book recommendations"""
    
    def ensure_diversity(self, recommendations: List[Dict[str, Any]], 
                         diversity_factor: float = 0.3,
                         min_per_category: int = 1) -> List[Dict[str, Any]]:
        """
        Apply diversity rules to ensure recommendations aren't too similar
        
        Args:
            recommendations: List of scored book recommendations
            diversity_factor: How much to prioritize diversity (0-1)
                              Higher values promote more diversity
            min_per_category: Minimum number of items to include from each category
                              when possible
            
        Returns:
            Re-ranked list of recommendations with better diversity
        """
        if not recommendations or len(recommendations) <= 5:
            return recommendations  # Not enough items to diversify
            
        # Count total recommendations
        total_recommendations = len(recommendations)
        
        # Group recommendations by genre
        genre_groups = defaultdict(list)
        for book in recommendations:
            genre = book.get("genre", "Unknown")
            genre_groups[genre].append(book)
            
        # Count occurrences of each genre
        genre_counts = {genre: len(books) for genre, books in genre_groups.items()}
        
        # Calculate the maximum books to show per genre based on diversity factor
        # If diversity factor is 0.3 and we have 20 books, no genre should have more than 14 books (20 * 0.7)
        max_per_genre = max(3, int(total_recommendations * (1 - diversity_factor)))
        
        # Calculate over-representation for each genre
        over_represented = []
        for genre, count in genre_counts.items():
            if count > max_per_genre:
                over_represented.append((genre, count - max_per_genre))
        
        # Sort over-represented genres by how much they exceed the limit
        over_represented.sort(key=lambda x: x[1], reverse=True)
        
        # Apply diversity penalty to scores for over-represented genres
        for book in recommendations:
            genre = book.get("genre", "Unknown")
            genre_count = genre_counts.get(genre, 0)
            
            # Store original score before adjustment
            book["original_score"] = book.get("score", 0)
            
            # Apply penalty if this genre is over-represented
            if genre_count > max_per_genre:
                # Calculate how much this genre is over-represented
                over_representation = (genre_count - max_per_genre) / max_per_genre
                
                # Apply penalty (reduce score more for very over-represented genres)
                # The penalty is proportional to the diversity factor
                penalty = over_representation * diversity_factor * book.get("score", 0)
                book["score"] = max(0, book.get("score", 0) - penalty)
                book["diversity_adjusted"] = True
        
        # Ensure minimum representation for under-represented genres
        # First sort all recommendations by their adjusted scores
        diversified_recommendations = sorted(recommendations, key=lambda x: x.get("score", 0), reverse=True)
        
        # Now check if we need to promote any under-represented genres
        final_recommendations = []
        genres_included = set()
        remaining_books = []
        
        # First pass: include at least min_per_category from each genre if possible
        for book in diversified_recommendations:
            genre = book.get("genre", "Unknown")
            
            if genre not in genres_included and len(final_recommendations) < total_recommendations:
                final_recommendations.append(book)
                genres_included.add(genre)
            else:
                remaining_books.append(book)
        
        # Second pass: fill the rest based on score
        remaining_slots = total_recommendations - len(final_recommendations)
        if remaining_slots > 0:
            # Sort remaining books by adjusted score
            remaining_books.sort(key=lambda x: x.get("score", 0), reverse=True)
            final_recommendations.extend(remaining_books[:remaining_slots])
        
        # Re-sort the final recommendations by score for presentation
        final_recommendations.sort(key=lambda x: x.get("score", 0), reverse=True)
        
        return final_recommendations
    
    def calculate_diversity_metrics(self, recommendations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate diversity metrics for a set of recommendations
        
        Args:
            recommendations: List of book recommendations
            
        Returns:
            Dictionary with diversity metrics
        """
        if not recommendations:
            return {"diversity_score": 0, "unique_genres": 0, "genre_distribution": {}}
            
        # Count genres
        genre_counts = defaultdict(int)
        for book in recommendations:
            genre = book.get("genre", "Unknown")
            genre_counts[genre] += 1
            
        total_books = len(recommendations)
        unique_genres = len(genre_counts)
        
        # Calculate genre distribution (as percentages)
        genre_distribution = {
            genre: (count / total_books) * 100 
            for genre, count in genre_counts.items()
        }
        
        # Calculate diversity score (higher is more diverse)
        # Perfect diversity would be equal distribution among all genres
        perfect_distribution = 1 / unique_genres if unique_genres > 0 else 0
        
        # Calculate how far each genre is from perfect distribution
        distribution_deviation = sum(
            abs((count / total_books) - perfect_distribution)
            for count in genre_counts.values()
        ) / 2  # Divide by 2 to normalize between 0 and 1
        
        # Convert to diversity score (1 is perfect diversity, 0 is all the same genre)
        diversity_score = 1 - distribution_deviation
        
        return {
            "diversity_score": diversity_score,
            "unique_genres": unique_genres,
            "genre_distribution": genre_distribution
        }