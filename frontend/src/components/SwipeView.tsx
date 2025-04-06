import React, { useState } from 'react';
import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, X, Undo } from 'lucide-react';
import { toast } from "sonner";
import BookCard from '@/components/BookCard';
import { Book } from '@/hooks/useBooksData';

interface SwipeViewProps {
  books: Book[];
  user: any;
  onRequestBook: (bookId: number | string) => void;
}

const SwipeView: React.FC<SwipeViewProps> = ({ books, user, onRequestBook }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [swipeHistory, setSwipeHistory] = useState<number[]>([]);
  
  const handleSwipe = (dir: 'left' | 'right') => {
    setDirection(dir);
    
    // Add current index to history for rewind feature
    setSwipeHistory(prev => [...prev.slice(-5), currentIndex]); // Keep last 5 for limiting rewind
    
    if (dir === 'right' && books[currentIndex]) {
      // Request the book if swiped right
      onRequestBook(books[currentIndex].id);
    }
    
    // Move to next card after a brief delay
    setTimeout(() => {
      if (currentIndex < books.length - 1) {
        setCurrentIndex(prevIndex => prevIndex + 1);
      } else {
        // Loop back to the beginning when reaching the end
        setCurrentIndex(0);
      }
      setDirection(null);
    }, 300);
  };
  
  const handleRewind = () => {
    if (swipeHistory.length > 0) {
      // Get the last index from history and remove it
      const lastIndex = swipeHistory[swipeHistory.length - 1];
      setSwipeHistory(prev => prev.slice(0, -1));
      
      // Set direction for animation
      setDirection('left');
      
      // Set current index to the previous one
      setTimeout(() => {
        setCurrentIndex(lastIndex);
        setDirection(null);
      }, 300);
      
      toast.info("Rewound to previous book");
    } else {
      toast.error("No more books to rewind to");
    }
  };

  if (books.length === 0) {
    return null;
  }

  return (
    <div className="relative h-[500px] mx-auto max-w-md">
      <AnimatePresence>
        <motion.div
          key={currentIndex}
          className="absolute w-full h-full"
          initial={{ 
            x: direction === 'left' ? -300 : direction === 'right' ? 300 : 0,
            opacity: 0 
          }}
          animate={{ 
            x: 0, 
            opacity: 1 
          }}
          exit={{ 
            x: direction === 'left' ? -300 : direction === 'right' ? 300 : 0,
            opacity: 0,
            transition: { duration: 0.2 }
          }}
          transition={{ duration: 0.3 }}
        >
          <BookCard 
            book={books[currentIndex]} 
            mode="swipe"
            currentUser={user}
          />
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white rounded-full p-3 shadow-lg hover:bg-gray-100"
              onClick={() => handleSwipe('left')}
            >
              <X size={30} className="text-red-500" />
            </Button>
            <Button 
              size="lg" 
              className="bg-white rounded-full p-3 shadow-lg hover:bg-gray-100"
              onClick={() => handleSwipe('right')}
            >
              <Heart size={30} className="text-purple-500" />
            </Button>
          </div>
          
          <div className="absolute bottom-20 left-0 right-0 flex justify-center items-center gap-3">
            <Badge variant="outline" className="bg-white">
              {currentIndex + 1} of {books.length}
            </Badge>
            
            <Button
              size="sm"
              variant="outline"
              className="bg-white rounded-full h-8 w-8 p-0 flex items-center justify-center shadow-md"
              onClick={handleRewind}
              disabled={swipeHistory.length === 0}
              title="Rewind to previous book"
            >
              <Undo size={16} className="text-purple-500" />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SwipeView;