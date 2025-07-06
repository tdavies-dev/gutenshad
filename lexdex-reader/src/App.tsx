import { useState, useEffect } from 'react';
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

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#f8fafc'
  },
  sidebar: {
    width: '280px',
    backgroundColor: 'white',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column' as const,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  sidebarHeader: {
    padding: '16px',
    borderBottom: '1px solid #f1f5f9'
  },
  bookTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px'
  },
  titleText: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#1e293b',
    margin: 0
  },
  authorText: {
    fontSize: '12px',
    color: '#64748b',
    margin: 0
  },
  chapterCount: {
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '4px'
  },
  chapterList: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '12px'
  },
  chapterButton: {
    width: '100%',
    textAlign: 'left' as const,
    padding: '6px 12px',
    marginBottom: '2px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: 'transparent'
  },
  chapterButtonActive: {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    fontWeight: '500',
    borderLeft: '2px solid #3b82f6'
  },
  chapterButtonInactive: {
    color: '#64748b',
    backgroundColor: 'transparent'
  },
  navControls: {
    padding: '12px',
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    gap: '8px'
  },
  navButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '6px 8px',
    fontSize: '11px',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  navButtonDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed'
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const
  },
  chapterHeader: {
    backgroundColor: 'white',
    borderBottom: '1px solid #f1f5f9',
    padding: '16px 24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
  },
  chapterTitle: {
    fontSize: '24px',
    fontFamily: '"Crimson Text", Georgia, serif',
    color: '#1e293b',
    margin: '0 0 4px 0'
  },
  chapterInfo: {
    fontSize: '14px',
    color: '#64748b'
  },
  contentArea: {
    flex: 1,
    overflowY: 'auto' as const,
    backgroundColor: 'white'
  },
  contentInner: {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '32px 24px'
  },
  textContent: {
    fontFamily: '"Crimson Text", Georgia, serif',
    fontSize: '18px',
    lineHeight: '1.7',
    color: '#374151'
  },
  paragraph: {
    marginBottom: '24px'
  },
  bottomNav: {
    backgroundColor: 'white',
    borderTop: '1px solid #f1f5f9',
    padding: '12px 24px'
  },
  bottomNavInner: {
    maxWidth: '700px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  bottomNavButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    fontSize: '14px',
    color: '#64748b',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'color 0.2s'
  },
  pageInfo: {
    fontSize: '14px',
    color: '#94a3b8'
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    textAlign: 'center' as const
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    textAlign: 'center' as const,
    color: '#dc2626'
  }
};

export default function ChapterDisplay() {
  const [book, setBook] = useState<LoadedBook | null>(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBook() {
      try {
        setLoading(true);
        const response = await fetch('/books/pride_prejudice.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch book: ${response.status}`);
        }
        const bookData = await response.text();
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
      <div style={styles.loading}>
        <div>
          <Book size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
          <p>Loading Pride and Prejudice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.error}>
        <div>
          <Book size={48} color="#dc2626" style={{ margin: '0 auto 16px' }} />
          <p>{error}</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>
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
      <p key={index} style={styles.paragraph}>
        {paragraph.trim()}
      </p>
    ));
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        {/* Header */}
        <div style={styles.sidebarHeader}>
          <div style={styles.bookTitle}>
            <Book size={20} color="#64748b" />
            <h1 style={styles.titleText}>{book.title}</h1>
          </div>
          <p style={styles.authorText}>by {book.author}</p>
          <p style={styles.chapterCount}>{book.totalChapters} chapters</p>
        </div>

        {/* Chapter list */}
        <div style={styles.chapterList}>
          {book.chapters.map((chapter, index) => (
            <button
              key={index}
              onClick={() => setCurrentChapter(index)}
              style={{
                ...styles.chapterButton,
                ...(currentChapter === index ? styles.chapterButtonActive : styles.chapterButtonInactive)
              }}
              onMouseEnter={(e) => {
                if (currentChapter !== index) {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                }
              }}
              onMouseLeave={(e) => {
                if (currentChapter !== index) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {chapter.title}
            </button>
          ))}
        </div>

        {/* Navigation controls */}
        <div style={styles.navControls}>
          <button
            onClick={goToPrevChapter}
            disabled={currentChapter === 0}
            style={{
              ...styles.navButton,
              ...(currentChapter === 0 ? styles.navButtonDisabled : {})
            }}
          >
            <ChevronLeft size={12} />
            Prev
          </button>
          <button
            onClick={goToNextChapter}
            disabled={currentChapter === book.chapters.length - 1}
            style={{
              ...styles.navButton,
              ...(currentChapter === book.chapters.length - 1 ? styles.navButtonDisabled : {})
            }}
          >
            Next
            <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={styles.mainContent}>
        {/* Chapter header */}
        <div style={styles.chapterHeader}>
          <h1 style={styles.chapterTitle}>
            {book.chapters[currentChapter]?.title}
          </h1>
          <p style={styles.chapterInfo}>
            Chapter {currentChapter + 1} of {book.totalChapters}
          </p>
        </div>

        {/* Chapter content */}
        <div style={styles.contentArea}>
          <div style={styles.contentInner}>
            <div style={styles.textContent}>
              {book.chapters[currentChapter] && formatChapterContent(book.chapters[currentChapter].content)}
            </div>
          </div>
        </div>

        {/* Bottom navigation */}
        <div style={styles.bottomNav}>
          <div style={styles.bottomNavInner}>
            <button
              onClick={goToPrevChapter}
              disabled={currentChapter === 0}
              style={{
                ...styles.bottomNavButton,
                ...(currentChapter === 0 ? { opacity: 0.4, cursor: 'not-allowed' } : {})
              }}
            >
              <ChevronLeft size={16} />
              Previous Chapter
            </button>
            
            <div style={styles.pageInfo}>
              {currentChapter + 1} / {book.totalChapters}
            </div>
            
            <button
              onClick={goToNextChapter}
              disabled={currentChapter === book.chapters.length - 1}
              style={{
                ...styles.bottomNavButton,
                ...(currentChapter === book.chapters.length - 1 ? { opacity: 0.4, cursor: 'not-allowed' } : {})
              }}
            >
              Next Chapter
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}