import { useState } from 'react'
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { ChaptersSidebar } from "@/components/ui/chapters-sidebar"
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

function App() {
  const [selectedBook] = useState<Book>({
    id: 1,
    title: "Sample Classic Novel",
    author: "Demo Author",
    chapters: [
      { title: "Chapter 1: The Beginning", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.\n\nUt aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur." },
      { title: "Chapter 2: The Journey", content: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.\n\nDoloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo." },
      { title: "Chapter 3: The Discovery", content: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.\n\nNeque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit." },
      { title: "Chapter 4: The Revelation", content: "Sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis.\n\nSuscipit laboriosam, nisi ut aliquid ex ea commodi consequatur." }
    ]
  })
  const [selectedChapter, setSelectedChapter] = useState(0)
  const [fontSize, setFontSize] = useState('base') // 'sm', 'base', 'lg', 'xl'

  const handleChapterSelect = (chapterIndex: number) => {
    setSelectedChapter(chapterIndex)
  }

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm': return 'text-sm'
      case 'base': return 'text-base'
      case 'lg': return 'text-lg'
      case 'xl': return 'text-xl'
      default: return 'text-base'
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
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <ChaptersSidebar
          book={selectedBook}
          selectedChapter={selectedChapter}
          onChapterSelect={handleChapterSelect}
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
                <div className="w-full flex flex-col items-center">
                  {/* Reading Content */}
                  <div className="w-full max-w-3xl mx-auto">
                    {selectedBook.chapters[selectedChapter] ? (
                      <>
                        <h2 className="text-2xl font-semibold mb-8 text-center">
                          {selectedBook.chapters[selectedChapter].title}
                        </h2>
                        <div className={`
                          whitespace-pre-wrap leading-loose text-left
                          ${getFontSizeClass()}
                          [&>p]:mb-6 [&_p+p]:mt-6
                        `}>
                          {selectedBook.chapters[selectedChapter].content.split('\n\n').map((paragraph, index) => (
                            <p key={index} className="mb-6">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-64">
                        <p className="text-muted-foreground">Chapter not found</p>
                      </div>
                    )}
                  </div>
                  
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
                    <h2 className="text-2xl font-semibold mb-2">Welcome to Gutenshad</h2>
                    <p className="text-muted-foreground">A nice reader for the Gutenberg 100</p>
                    <p className="text-sm text-muted-foreground mt-4">Loading books...</p>
                  </div>
                </div>
              )}
            </main>
            
            <Footer />
          </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default App
