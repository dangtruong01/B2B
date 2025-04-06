'use client'

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from "sonner";
import { List, Shuffle, Sparkles } from 'lucide-react';

import GridView from '@/components/GridView';
import SwipeView from '@/components/SwipeView';
import GridFilters from '@/components/GridFilters';
import SwipeFilters from '@/components/SwipeFilters';
import BurgerMenu from '@/components/BurgerMenu';
import { Button } from "@/components/ui/button";
import { useBooksData } from '@/hooks/useBooksData';
import { useAuth } from '@/hooks/useAuth';
import { API_BASE_URL } from '@/lib/constants';
import RecommendedBooksTab from '@/components/RecommendedBooksTab';

const ExplorePage: React.FC = () => {
  const router = useRouter();
  const { user, loading: userLoading } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'swipe' | 'recommended'>('grid');
  const [showFilters, setShowFilters] = useState(true);
  
  const {
    books,
    filteredBooks,
    loading,
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    clearFilters
  } = useBooksData(user);
  
  const handleRequestBook = async (bookId: number | string) => {
    if (!user) {
      toast.error("Authentication required. Please log in to request a book");
      router.push("/auth/login");
      return;
    }
    
    try {
      const accessToken = localStorage.getItem("access_token");
      
      if (!accessToken) {
        router.push("/auth/login");
        return;
      }
      
      await axios.post(
        `${API_BASE_URL}/exchange/request`, 
        { book_id: bookId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      toast.success("Request sent! The book owner will be notified of your request");
    } catch (error) {
      console.error('Error requesting book:', error);
      toast.error("Request failed. Please try again later");
    }
  };
  
  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>Explore Books | Book Exchange Platform</title>
      </Head>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-purple-900">Explore Books</h1>
            <p className="text-gray-600">Discover books available for exchange</p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
              {viewMode === 'grid' && (
                <Button 
                  variant="outline" 
                  className="border-purple-300"
                  onClick={() => setShowFilters(!showFilters)}
                  size="sm"
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
              )}
            
            <div className="w-[300px]">
              <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
                <button
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${viewMode === 'grid' ? 'bg-background text-foreground shadow-sm' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <List className="mr-2" size={16} />
                  List
                </button>
                <button
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${viewMode === 'swipe' ? 'bg-background text-foreground shadow-sm' : ''}`}
                  onClick={() => setViewMode('swipe')}
                >
                  <Shuffle className="mr-2" size={16} />
                  Swipe
                </button>
                <button
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${viewMode === 'recommended' ? 'bg-background text-foreground shadow-sm' : ''}`}
                  onClick={() => setViewMode('recommended')}
                >
                  <Sparkles className="mr-2" size={16} />
                  For You
                </button>
              </div>
            </div>
            <BurgerMenu/>
          </div>
        </div>
        
        {/* Filters based on view mode */}
        {viewMode === 'grid' && showFilters ? (
          <GridFilters 
            filters={filters}
            setFilters={setFilters}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            clearFilters={clearFilters}
          />
        ) : viewMode === 'swipe' ? (
          <SwipeFilters 
            filters={filters}
            setFilters={setFilters}
            clearFilters={clearFilters}
          />
        ) : null}
        
        {/* Content based on view mode */}
        {loading && viewMode !== 'recommended' ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
          </div>
        ) : filteredBooks.length === 0 && viewMode !== 'recommended' ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">No books found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or check back later</p>
            <Button onClick={clearFilters} className="bg-purple-600 hover:bg-purple-700">
              Clear Filters
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <GridView 
            books={filteredBooks}
            user={user}
            onRequestBook={handleRequestBook}
          />
        ) : viewMode === 'swipe' ? (
          <SwipeView 
            books={filteredBooks}
            user={user}
            onRequestBook={handleRequestBook}
          />
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-semibold mb-2">No recommendations yet</h3>
            <p className="text-gray-600 mb-4">
              Coming Soon!
            </p>
          </div>
      )}
      </div>
    </>
  );
};

export default ExplorePage;