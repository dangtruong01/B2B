import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from 'lucide-react';
import { BookFilters } from '@/hooks/useBooksData';
import { GENRE_OPTIONS, CONDITION_OPTIONS } from '@/lib/constants';

interface GridFiltersProps {
  filters: BookFilters;
  setFilters: React.Dispatch<React.SetStateAction<BookFilters>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  clearFilters: () => void;
}

const GridFilters: React.FC<GridFiltersProps> = ({ 
  filters, 
  setFilters, 
  searchQuery, 
  setSearchQuery, 
  clearFilters 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm mb-8 p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <Input
              placeholder="Search by title, author, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <button 
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchQuery('')}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">Genre</label>
          <Select 
            value={filters.genre} 
            onValueChange={(value) => setFilters({...filters, genre: value})}
          >
            <SelectTrigger>
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
        
        <div>
          <label className="text-sm font-medium mb-1 block">Condition</label>
          <Select 
            value={filters.condition} 
            onValueChange={(value) => setFilters({...filters, condition: value})}
          >
            <SelectTrigger>
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
        
        <div className="flex items-center space-x-2 pt-6">
          <Switch 
            id="available" 
            checked={filters.isAvailable} 
            onCheckedChange={(checked) => setFilters({...filters, isAvailable: checked})} 
          />
          <Label htmlFor="available">Available Only</Label>
        </div>
        
        <div className="flex items-end">
          <Button 
            variant="outline" 
            className="border-purple-600 text-purple-600 hover:bg-purple-50"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GridFilters;