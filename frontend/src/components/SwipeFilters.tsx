import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CloudLightning } from 'lucide-react';
import { toast } from "sonner";
import { BookFilters } from '@/hooks/useBooksData';
import { GENRE_OPTIONS, CONDITION_OPTIONS } from '@/lib/constants';

interface SwipeFiltersProps {
  filters: BookFilters;
  setFilters: React.Dispatch<React.SetStateAction<BookFilters>>;
  clearFilters: () => void;
}

const SwipeFilters: React.FC<SwipeFiltersProps> = ({ 
  filters, 
  setFilters, 
  clearFilters 
}) => {
  const [moodSwipe, setMoodSwipe] = useState(false);
  const [prevFilters, setPrevFilters] = useState<BookFilters | null>(null);

  // Store previous filters when mood swipe is activated
  useEffect(() => {
    if (moodSwipe && !prevFilters) {
      setPrevFilters({...filters});
    } else if (!moodSwipe && prevFilters) {
      // Restore previous filters when mood swipe is deactivated
      setFilters(prevFilters);
      setPrevFilters(null);
    }
  }, [moodSwipe]);

  const handleMoodSwipe = () => {
    const newMoodState = !moodSwipe;
    setMoodSwipe(newMoodState);
    
    if (newMoodState) {
      // When enabling mood swipe, pick a random genre
      const randomGenre = GENRE_OPTIONS[Math.floor(Math.random() * GENRE_OPTIONS.length)];
      setFilters({
        ...filters,
        genre: randomGenre,
        condition: 'all', // Reset condition when mood swipe is activated
      });
      toast.info(`Mood Swipe activated! Showing only ${randomGenre} books`);
    } else {
      toast.info("Mood Swipe deactivated. Filters unlocked.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm mb-8 p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="w-full md:w-auto">
          <label className={`text-sm font-medium mb-1 block ${moodSwipe ? 'text-gray-400' : ''}`}>Quick Filter</label>
          <Select 
            value={filters.genre} 
            onValueChange={(value) => !moodSwipe && setFilters({...filters, genre: value})}
            disabled={moodSwipe}
          >
            <SelectTrigger className={`w-full md:w-[180px] ${moodSwipe ? 'opacity-60 cursor-not-allowed' : ''}`}>
              <SelectValue placeholder="All Genres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {GENRE_OPTIONS.map(genre => (
                <SelectItem key={genre} value={genre}>{genre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-auto">
          <label className={`text-sm font-medium mb-1 block ${moodSwipe ? 'text-gray-400' : ''}`}>Book Condition</label>
          <Select 
            value={filters.condition} 
            onValueChange={(value) => !moodSwipe && setFilters({...filters, condition: value})}
            disabled={moodSwipe}
          >
            <SelectTrigger className={`w-full md:w-[180px] ${moodSwipe ? 'opacity-60 cursor-not-allowed' : ''}`}>
              <SelectValue placeholder="Any Condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Condition</SelectItem>
              {CONDITION_OPTIONS.map(condition => (
                <SelectItem key={condition} value={condition}>{condition}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-auto flex items-center gap-2 pt-6 md:pt-0">
          <Switch 
            id="mood-swipe" 
            checked={moodSwipe} 
            onCheckedChange={handleMoodSwipe} 
          />
          <Label htmlFor="mood-swipe" className="flex items-center">
            <CloudLightning size={16} className={`mr-1 ${moodSwipe ? 'text-purple-600' : 'text-gray-500'}`} />
            Mood Swipe
          </Label>
          <div className="text-xs text-gray-500 ml-1">(Genre-based surprise)</div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full md:w-auto border-purple-600 text-purple-600 hover:bg-purple-50 ml-auto"
          onClick={() => {
            clearFilters();
            setMoodSwipe(false);
            setPrevFilters(null);
          }}
        >
          Reset Filters
        </Button>
      </div>
      
      {moodSwipe && (
        <div className="mt-3 p-2 bg-purple-50 rounded-lg text-sm">
          <span className="font-medium">Mood Swipe Active: </span> 
          <span className="text-purple-700">Showing {filters.genre} books. Other filters are locked.</span>
        </div>
      )}
    </div>
  );
};

export default SwipeFilters;