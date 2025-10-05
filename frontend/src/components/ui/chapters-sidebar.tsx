import { useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarInput,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

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

interface ChaptersSidebarProps {
  book?: Book
  availableBooks?: BookManifestEntry[]
  selectedChapter?: number
  onChapterSelect?: (chapterIndex: number) => void
  onBookSelect?: (book: BookManifestEntry) => void
  loading?: boolean
  className?: string
}

const ChaptersSidebar = ({ 
  book, 
  availableBooks = [],
  selectedChapter = 0, 
  onChapterSelect, 
  onBookSelect,
  loading = false,
  className 
}: ChaptersSidebarProps) => {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredChapters = (book?.chapters?.filter(chapter =>
    chapter.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []).sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' }))

  const filteredBooks = availableBooks.filter(bookEntry =>
    bookEntry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bookEntry.author.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Sidebar className={cn("", className)}>
      <SidebarHeader>
        <div className="px-2">
          <h2 className="text-lg font-semibold truncate">
            {book ? book.title : "Select a Book"}
          </h2>
          {book?.author && (
            <p className="text-sm text-muted-foreground truncate">
              by {book.author}
            </p>
          )}
          {!book && availableBooks.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {availableBooks.length} books available
            </p>
          )}
        </div>
        <SidebarInput
          placeholder={book ? "Search chapters..." : "Search books..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus={false}
        />
      </SidebarHeader>
      
      <SidebarContent>
        {loading ? (
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <p className="text-sm">Loading...</p>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : book ? (
          <SidebarGroup>
            <SidebarGroupLabel>
              <div className="flex items-center justify-between w-full">
                <span>Chapters</span>
                <button
                  onClick={() => onBookSelect?.(undefined as any)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  ← Back to Books
                </button>
              </div>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredChapters.map((chapter, index) => {
                  const originalIndex = book.chapters.findIndex(c => c === chapter)
                  return (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuButton
                        isActive={selectedChapter === originalIndex}
                        onClick={() => onChapterSelect?.(originalIndex)}
                        className="w-full justify-start"
                      >
                        <span className="truncate">{chapter.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <SidebarGroup>
            <SidebarGroupLabel>Available Books</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredBooks.length > 0 ? (
                  filteredBooks.map((bookEntry) => (
                    <SidebarMenuItem key={bookEntry.book_id}>
                      <SidebarMenuButton
                        onClick={() => {
                          setSearchTerm("")
                          onBookSelect?.(bookEntry)
                        }}
                        className="w-full justify-start flex-col items-start h-auto py-3"
                      >
                        <span className="truncate font-medium">{bookEntry.title}</span>
                        <span className="text-xs text-muted-foreground truncate">
                          by {bookEntry.author} • {bookEntry.chapter_count} chapters
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                ) : availableBooks.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <p className="text-sm">No books available</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <p className="text-sm">No books match your search</p>
                  </div>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  )
}

export { ChaptersSidebar }