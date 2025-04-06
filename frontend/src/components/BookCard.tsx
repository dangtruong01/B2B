import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Star } from 'lucide-react';

interface Book {
  id: number | string;
  title: string;
  author: string;
  genre: string;
  condition: string;
  description?: string;
  status: string,
  image_url?: string;
  owner_id?: string;
  distance?: number; // For location-based recommendations
}

interface BookCardProps {
  book: Book;
  mode?: 'dashboard' | 'explore' | 'swipe';
  onRequest?: (bookId: number | string) => void;
  className?: string;
  currentUser?: any; // User object from your API
  isRecommended?: boolean; // Flag for recommended books
}

const BookCard: React.FC<BookCardProps> = ({ 
  book, 
  mode = 'dashboard', 
  onRequest,
  className = "",
  currentUser,
  isRecommended = false
}) => {
  const isOwner = currentUser?.id === book.owner_id;
  
  // Common image component
  const BookImage = () => (
    <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
      {book.image_url ? (
        <Image
            src={book.image_url}
            alt={book.title}
            width={500} // required
            height={300} // required
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            unoptimized // if image is remote and not on an allowed domain or needs bypassing
        />
      
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
          <span className="mt-2">No image</span>
        </div>
      )}
      
      {/* Availability badge */}
      <Badge
        className={`absolute top-2 right-2 ${
            book.status === "available"
            ? "bg-green-100 text-green-800"
            : book.status === "unavailable"
            ? "bg-yellow-100 text-yellow-800"
            : book.status === "reserved"
            ? "bg-blue-100 text-blue-800"
            : "bg-gray-200 text-gray-700" // exchanged
        }`}
        >
        {book.status === "available"
            ? "Available"
            : book.status === "unavailable"
            ? "Unavailable"
            : book.status === "reserved"
            ? "Reserved"
            : "Exchanged"}
        </Badge>

      
      {/* Recommendation badge */}
      {isRecommended && (
        <Badge 
          className="absolute top-2 left-2 bg-purple-500 text-white"
        >
          <Star className="mr-1 h-3 w-3" /> Recommended
        </Badge>
      )}
      
      {/* Distance badge (for location-based recommendations) */}
      {book.distance !== undefined && (
        <Badge 
          variant="outline" 
          className="absolute bottom-2 right-2 bg-white/80 text-gray-800"
        >
          {book.distance < 1 ? 'Less than 1 mile' : `${book.distance.toFixed(1)} miles`}
        </Badge>
      )}
    </div>
  );
  
  // For dashboard mode (same as your original component)
  if (mode === 'dashboard') {
    return (
      <div className={`border rounded-md overflow-hidden shadow-sm h-full flex flex-col ${className} ${isRecommended ? 'ring-2 ring-purple-300 ring-offset-1' : ''}`}>
        <BookImage />
    
        <div className="p-4 flex flex-col flex-grow justify-between">
          <div>
            <h3 className="font-semibold text-base mb-1 line-clamp-1">{book.title}</h3>
            <p className="text-gray-600 text-sm mb-2 line-clamp-1">by {book.author}</p>
    
            <div className="flex flex-wrap gap-1 mt-2">
              <Badge variant="outline" className="bg-purple-100">{book.genre}</Badge>
              <Badge variant="outline">{book.condition}</Badge>
            </div>
    
            {book.description && (
              <p className="text-sm text-gray-500 mt-2 line-clamp-2 min-h-[40px]">{book.description}</p>
            )}
          </div>
    
          <div className="flex justify-between items-center mt-4">
            <Button
              variant={book.status === "available" ? "outline" : "secondary"}
              size="sm"
              className="text-xs px-3 py-1"
              onClick={async () => {
                try {
                  const token = localStorage.getItem("access_token");
                  await fetch(`http://localhost:8000/books/${book.id}/toggle-availability`, {
                    method: "PATCH",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  });
                  window.location.reload(); // or a callback to refetch books
                } catch (err) {
                  console.error("Failed to toggle availability:", err);
                }
              }}
            >
              {book.status === "available" ? "Mark Unavailable" : "Mark Available"}
            </Button>
    
            <Button
              variant="destructive"
              size="sm"
              className="text-xs px-3 py-1"
              onClick={async () => {
                if (!confirm("Are you sure you want to cancel this listing?")) return;
                try {
                  const token = localStorage.getItem("access_token");
                  await fetch(`http://localhost:8000/books/${book.id}`, {
                    method: "DELETE",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  });
                  window.location.reload(); // or callback to remove from UI
                } catch (err) {
                  console.error("Failed to delete book:", err);
                }
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // For swipe mode
  if (mode === 'swipe') {
    return (
      <Card className={`overflow-hidden transition-all duration-300 h-full flex flex-col ${className} ${isRecommended ? 'ring-2 ring-purple-300 ring-offset-1' : ''}`}>
        <BookImage />
        
        <div className="flex flex-col flex-grow">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-lg line-clamp-1">{book.title}</CardTitle>
            <p className="text-gray-600 text-sm">by {book.author}</p>
          </CardHeader>
          
          <CardContent className="pb-4 pt-0">
            <div className="flex gap-2 mb-2 flex-wrap">
              <Badge variant="outline" className="bg-purple-100">{book.genre}</Badge>
              <Badge variant="outline">{book.condition}</Badge>
            </div>
            
            {book.description && (
              <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
                {book.description}
              </p>
            )}
          </CardContent>
        </div>
      </Card>
    );
  }
  
  // For explore mode (keeping your original styles)
  return (
    <Card className={`overflow-hidden transition-all duration-300 h-full flex flex-col ${className} ${isRecommended ? 'ring-2 ring-purple-300 ring-offset-1' : ''}`}>
      <BookImage />
      
      <div className="flex flex-col flex-grow">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-lg line-clamp-1">{book.title}</CardTitle>
          <p className="text-gray-600 text-sm">by {book.author}</p>
        </CardHeader>
        
        <CardContent className="pb-4 pt-0">
          <div className="flex gap-2 mb-2 flex-wrap">
            <Badge variant="outline" className="bg-purple-100">{book.genre}</Badge>
            <Badge variant="outline">{book.condition}</Badge>
          </div>
          
          {book.description && (
            <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
              {book.description}
            </p>
          )}
        </CardContent>
        
        <CardFooter className="pt-0 mt-auto">
          {isOwner ? (
            <Badge className="bg-purple-100 text-purple-800">Your Book</Badge>
          ) : (
            <Button 
              size="sm" 
              className="bg-purple-600 hover:bg-purple-700 w-full"
              onClick={() => onRequest && onRequest(book.id)}
              disabled={book.status !== "available" || isOwner}
            >
              Request Book
            </Button>
          )}
        </CardFooter>
      </div>
    </Card>
  );
};

export default BookCard;