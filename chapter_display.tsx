import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Book } from 'lucide-react';

// types from your gutenberg script
interface Chapter {
  title: string;
  content: string;
}

interface LoadedBook {
  id: number;
  title: string;
  author: string;
  chapters: Chapter[];
  totalChapters: number;
}

export default function ChapterDisplay() {
  const [book, setBook] = useState<LoadedBook | null>(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBook() {
      try {
        setLoading(true);
        const bookData = await window.fs.readFile('books/pride_prejudice.json', { encoding: 'utf8' });
        const parsedBook: LoadedBook = JSON.parse(bookData);
        setBook(parsedBook);
        setError(null);
      } catch (err) {
        console.error('Failed to load book:', err);
        setError('Failed to load Pride and Prejudice. Make sure the book is cached in books/pride_prejudice.json');
      } finally {
        setLoading(false);
      }
    }

    loadBook();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Book className="h-12 w-12 text-slate-400 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-600">Loading Pride and Prejudice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <Book className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-sm text-slate-600">
            Run your caching script first to generate the book files.
          </p>
        </div>
      </div>
    );
  }

  if (!book) return null;

  const goToNextChapter = () => {
    if (currentChapter < book.chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
    }
  };

  const goToPrevChapter = () => {
    if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
    }
  };

  const formatChapterContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-6 leading-relaxed">
        {paragraph.trim()}
      </p>
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <Book className="h-6 w-6 text-slate-700" />
            <h1 className="text-lg font-semibold text-slate-900">{book.title}</h1>
          </div>
          <p className="text-sm text-slate-600">by {book.author}</p>
          <p className="text-xs text-slate-500 mt-1">{book.totalChapters} chapters</p>
        </div>

        {/* Chapter list */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-medium text-slate-700 mb-3 uppercase tracking-wide">
              Contents
            </h2>
            <div className="space-y-1">
              {book.chapters.map((chapter, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentChapter(index)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentChapter === index
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {chapter.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation controls */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex gap-2">
            <button
              onClick={goToPrevChapter}
              disabled={currentChapter === 0}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              onClick={goToNextChapter}
              disabled={currentChapter === book.chapters.length - 1}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Chapter header */}
        <div className="bg-white border-b border-slate-200 px-8 py-6">
          <h1 className="text-2xl font-serif text-slate-900 mb-1">
            {book.chapters[currentChapter]?.title}
          </h1>
          <p className="text-sm text-slate-500">
            Chapter {currentChapter + 1} of {book.totalChapters}
          </p>
        </div>

        {/* Chapter content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-12">
            <div className="prose prose-lg prose-slate max-w-none">
              <div 
                className="font-serif text-slate-800 leading-8 text-lg"
                style={{ 
                  fontFamily: '"Crimson Text", "Georgia", "Times New Roman", serif',
                  lineHeight: '1.8'
                }}
              >
                {book.chapters[currentChapter] && formatChapterContent(book.chapters[currentChapter].content)}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom navigation */}
        <div className="bg-white border-t border-slate-200 px-8 py-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <button
              onClick={goToPrevChapter}
              disabled={currentChapter === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:text-slate-900 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous Chapter
            </button>
            
            <div className="text-sm text-slate-500">
              {currentChapter + 1} / {book.totalChapters}
            </div>
            
            <button
              onClick={goToNextChapter}
              disabled={currentChapter === book.chapters.length - 1}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:text-slate-900 transition-colors"
            >
              Next Chapter
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}