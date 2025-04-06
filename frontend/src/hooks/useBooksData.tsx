import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/constants';

export interface Book {
  id: number | string;
  title: string;
  author: string;
  genre: string;
  condition: string;
  description?: string;
  status: string;
  image_url?: string;
  owner_id?: string;
}

export interface BookFilters {
  genre: string;
  condition: string;
  isAvailable: boolean;
}

export const useBooksData = (user: any) => {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState<BookFilters>({
    genre: 'all',
    condition: 'all',
    isAvailable: true,
  });

  // Fetch books from API
  useEffect(() => {
    async function fetchBooks() {
      try {
        setLoading(true);
        const accessToken = localStorage.getItem("access_token");
        
        if (!accessToken) {
          router.push("/auth/login");
          return;
        }
        
        // Build query params based on your API structure
        const queryParams = new URLSearchParams();
        
        // Only add the genre filter if it's not set to 'all'
        if (filters.genre !== 'all') {
          queryParams.append('genre', filters.genre);
        }
        
        // Add search parameter if we have a search query
        if (searchQuery.trim()) {
          queryParams.append('search', searchQuery.trim());
        }
        
        // Set limit and offset for pagination
        queryParams.append('limit', '100'); // Get a reasonable number of books
        queryParams.append('offset', '0');
        
        const response = await axios.get(
          `${API_BASE_URL}/books?${queryParams.toString()}`, 
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        
        let books = response.data;
        
        // Apply condition filter client-side if it's not set to 'all'
        if (filters.condition !== 'all') {
          books = books.filter((book: Book) => book.condition === filters.condition);
        }
        
        // Apply availability filter client-side
        if (filters.isAvailable) {
          books = books.filter((book: Book) => book.status === "available");
        }
        
        setBooks(books);
        setFilteredBooks(books);
      } catch (error) {
        console.error('Error fetching books:', error);
        toast.error("Failed to load books. Please try again later");
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      fetchBooks();
    }
  }, [user, filters, searchQuery, router]);
  
  // Filter books based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBooks(books);
      return;
    }
    
    const normalizedQuery = searchQuery.toLowerCase().trim();
    const results = books.filter(book => 
      book.title?.toLowerCase().includes(normalizedQuery) || 
      book.author?.toLowerCase().includes(normalizedQuery) ||
      book.description?.toLowerCase().includes(normalizedQuery) ||
      book.genre?.toLowerCase().includes(normalizedQuery)
    );
    
    setFilteredBooks(results);
  }, [books, searchQuery]);
  
  const clearFilters = () => {
    setFilters({
      genre: 'all',
      condition: 'all',
      isAvailable: true,
    });
    setSearchQuery('');
  };

  return {
    books,
    filteredBooks,
    loading,
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    clearFilters
  };
};