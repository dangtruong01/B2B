import React from 'react';
import BookCard from '@/components/BookCard';
import { Book } from '@/hooks/useBooksData';

interface GridViewProps {
  books: Book[];
  user: any;
  onRequestBook: (bookId: number | string) => void;
}

const GridView: React.FC<GridViewProps> = ({ books, user, onRequestBook }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {books.map(book => (
        <div key={book.id} className="h-full flex">
          <BookCard 
            book={book} 
            mode="explore"
            onRequest={(bookId) => onRequestBook(bookId)}
            currentUser={user}
            className="w-full"
          />
        </div>
      ))}
    </div>
  );
};

export default GridView;