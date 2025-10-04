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

interface ChaptersSidebarProps {
  book?: Book
  selectedChapter?: number
  onChapterSelect?: (chapterIndex: number) => void
  className?: string
}

const ChaptersSidebar = ({ 
  book, 
  selectedChapter = 0, 
  onChapterSelect, 
  className 
}: ChaptersSidebarProps) => {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredChapters = book?.chapters?.filter(chapter =>
    chapter.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <Sidebar className={cn("", className)}>
      <SidebarHeader>
        <div className="px-2">
          <h2 className="text-lg font-semibold truncate">
            {book?.title || "Select a Book"}
          </h2>
          {book?.author && (
            <p className="text-sm text-muted-foreground truncate">
              by {book.author}
            </p>
          )}
        </div>
        {book && (
          <SidebarInput
            placeholder="Search chapters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        )}
      </SidebarHeader>
      
      <SidebarContent>
        {book ? (
          <SidebarGroup>
            <SidebarGroupLabel>Chapters</SidebarGroupLabel>
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
            <SidebarGroupContent>
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <p className="text-sm">No book selected</p>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  )
}

export { ChaptersSidebar }