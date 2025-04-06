import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sparkles } from 'lucide-react';
import BookCard from '@/components/BookCard';
import { API_BASE_URL } from '@/lib/constants';

interface Book {
  id: number | string;
  title: string;
  author: string;
  genre: string;
  condition: string;
  description?: string;
  status: string;
  image_url?: string;
  owner_id?: string;
  distance?: number;
}

interface RecommendedBooksTabProps {
  user: any;
  onRequestBook: (bookId: number | string) => void;
}

const RecommendedBooksTab: React.FC<RecommendedBooksTabProps> = ({ user, onRequestBook }) => {
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendationType, setRecommendationType] = useState<'genre' | 'location'>('genre');

  useEffect(() => {
    fetchRecommendations();
  }, [user, recommendationType]);

  const fetchRecommendations = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const accessToken = localStorage.getItem("access_token");
      
      if (!accessToken) {
        return;
      }
      
      // Call the recommendation endpoint with the type parameter
      const response = await axios.get(
        `${API_BASE_URL}/recommendations/${recommendationType}`, 
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error("Failed to load recommendations");
      
      // Fallback to sample data for development/testing
      // This is temporary and should be removed once your backend is implemented
      const mockRecommendations = generateMockRecommendations(recommendationType);
      setRecommendations(mockRecommendations);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock recommendations for testing (to be removed once backend is implemented)
  const generateMockRecommendations = (type: 'genre' | 'location'): Book[] => {
    // const genres = ['Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Fiction'];
    // const conditions = ['New', 'Good', 'Fair', 'Poor'];
    
    const mockBooks: Book[] = [];
    
    return mockBooks;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">✨</div>
        <h3 className="text-xl font-semibold mb-2">No recommendations yet</h3>
        <p className="text-gray-600 mb-4">
          {recommendationType === 'genre' 
            ? "Add more favorite genres to your profile to get recommendations!" 
            : "We couldn't find books near your location yet."}
        </p>
        <Button 
          onClick={() => setRecommendationType(recommendationType === 'genre' ? 'location' : 'genre')}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Try {recommendationType === 'genre' ? 'Location-Based' : 'Genre-Based'} Recommendations
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-medium flex items-center">
          <Sparkles className="mr-2 text-purple-500" size={20} />
          Recommended For You
        </h2>
        
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
          <button
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${recommendationType === 'genre' ? 'bg-background text-foreground shadow-sm' : ''}`}
            onClick={() => setRecommendationType('genre')}
          >
            By Genre
          </button>
          <button
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${recommendationType === 'location' ? 'bg-background text-foreground shadow-sm' : ''}`}
            onClick={() => setRecommendationType('location')}
          >
            Nearby
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {recommendations.map(book => (
          <div key={book.id} className="h-full flex">
            <BookCard 
              book={book} 
              mode="explore"
              onRequest={onRequestBook}
              currentUser={user}
              className="w-full"
              isRecommended={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedBooksTab;