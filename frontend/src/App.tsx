import { useState, useEffect } from 'react'
import { SidebarProvider, SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { ChaptersSidebar } from "@/components/ui/chapters-sidebar"
import { ReadingPane } from "@/components/ui/readingpane"
import './App.css'

interface Chapter {
  title: string
  content: string
}

interface Book {
  id: number
  title: string
  author: string
  chapters: Chapter[]
}

interface BookManifestEntry {
  filename: string
  book_id: number
  title: string
  author: string
  chapter_count: number
}

interface Manifest {
  total_books: number
  books: BookManifestEntry[]
}

function AppContent() {
  const { open: sidebarOpen } = useSidebar()
  const [availableBooks, setAvailableBooks] = useState<BookManifestEntry[]>([])
  const [selectedBook, setSelectedBook] = useState<Book | undefined>()
  const [selectedChapter, setSelectedChapter] = useState(0)
  const [fontSize, setFontSize] = useState('base') // 'sm', 'base', 'lg', 'xl'
  const [loading, setLoading] = useState(false)

  // Load manifest on startup
  useEffect(() => {
    loadManifest()
  }, [])

  const loadManifest = async () => {
    try {
      console.log('Loading manifest...')
      const response = await fetch('/manifest.json')
      if (!response.ok) {
        throw new Error(`Failed to load manifest: ${response.status}`)
      }
      const manifest: Manifest = await response.json()
      setAvailableBooks(manifest.books)
      console.log(`Loaded ${manifest.books.length} books from manifest`)
    } catch (error) {
      console.error('Error loading manifest:', error)
      // Fallback to sample data if manifest fails
      setAvailableBooks([{
        filename: 'sample_book.json',
        book_id: 1,
        title: 'Sample Classic Novel',
        author: 'Demo Author',
        chapter_count: 4
      }])
    }
  }

  const loadBook = async (manifestEntry: BookManifestEntry) => {
    setLoading(true)
    try {
      console.log(`Loading book: ${manifestEntry.title}`)
      const response = await fetch(`/${manifestEntry.filename}`)
      if (!response.ok) {
        throw new Error(`Failed to load book: ${response.status}`)
      }
      const book: Book = await response.json()
      setSelectedBook(book)
      setSelectedChapter(0) // Reset to first chapter
      console.log(`Loaded book with ${book.chapters.length} chapters`)
    } catch (error) {
      console.error('Error loading book:', error)
      // Create fallback book data
      const fallbackBook: Book = {
        id: manifestEntry.book_id,
        title: manifestEntry.title,
        author: manifestEntry.author,
        chapters: [{
          title: "Chapter 1",
          content: "This book could not be loaded. Please check the console for errors."
        }]
      }
      setSelectedBook(fallbackBook)
      setSelectedChapter(0)
    } finally {
      setLoading(false)
    }
  }

  const handleChapterSelect = (chapterIndex: number) => {
    setSelectedChapter(chapterIndex)
  }

  const handleBookSelect = (manifestEntry: BookManifestEntry | undefined) => {
    if (manifestEntry) {
      loadBook(manifestEntry)
    } else {
      // Back to book list
      setSelectedBook(undefined)
      setSelectedChapter(0)
    }
  }

  const adjustFontSize = (direction: 'up' | 'down') => {
    const sizes = ['sm', 'base', 'lg', 'xl']
    const currentIndex = sizes.indexOf(fontSize)
    
    if (direction === 'up' && currentIndex < sizes.length - 1) {
      setFontSize(sizes[currentIndex + 1])
    } else if (direction === 'down' && currentIndex > 0) {
      setFontSize(sizes[currentIndex - 1])
    }
  }

  return (
      <div className="flex min-h-screen w-full">
        <ChaptersSidebar
          book={selectedBook}
          availableBooks={availableBooks}
          selectedChapter={selectedChapter}
          onChapterSelect={handleChapterSelect}
          onBookSelect={handleBookSelect}
          loading={loading}
          className="w-64"
        />
        
        <SidebarInset className="flex flex-col">
          <Header 
            fontSize={fontSize} 
            onFontSizeChange={adjustFontSize}
          >
            <SidebarTrigger />
          </Header>
          <main className="flex-1 p-6">
              {selectedBook ? (
                <div className="w-full flex flex-col items-center px-8">
                  {/* Reading Content */}
                  {selectedBook.chapters[selectedChapter] ? (
                    <ReadingPane
                      chapter={selectedBook.chapters[selectedChapter]}
                      fontSize={fontSize}
                      sidebarOpen={sidebarOpen}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <p className="text-muted-foreground">Chapter not found</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-12 pt-8 border-t w-full">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedChapter(Math.max(0, selectedChapter - 1))}
                      disabled={selectedChapter === 0}
                      className="px-6 py-2"
                    >
                      Previous Chapter
                    </Button>
                    <div className="flex-1"></div>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedChapter(Math.min(selectedBook.chapters.length - 1, selectedChapter + 1))}
                      disabled={selectedChapter >= selectedBook.chapters.length - 1}
                      className="px-6 py-2"
                    >
                      Next Chapter
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-2">gutenshad</h2>
                    <p className="text-muted-foreground">a nice reader for project gutenberg's top 100 books</p>
                    {availableBooks.length > 0 ? (
                      <p className="text-sm text-muted-foreground mt-4">
                        pick a book from the sidebar to start reading...
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-4">
                        Loading books...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </main>
            
            <Footer />
          </SidebarInset>
      </div>
  )
}

function App() {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppContent />
    </SidebarProvider>
  )
}

export default App
