import { useIsMobile } from "@/hooks/use-mobile"

interface Chapter {
  title: string
  content: string
}

interface ReadingPaneProps {
  chapter: Chapter
  fontSize: string
  sidebarOpen: boolean
}

const getFontSizeClass = (fontSize: string) => {
  switch (fontSize) {
    case 'sm': return 'text-sm'
    case 'base': return 'text-base'
    case 'lg': return 'text-lg'
    case 'xl': return 'text-xl'
    default: return 'text-base'
  }
}

export function ReadingPane({ chapter, fontSize, sidebarOpen }: ReadingPaneProps) {
  const isMobile = useIsMobile()

  return (
    <div className={`w-full max-w-3xl mx-auto ${!sidebarOpen && !isMobile ? 'ml-48' : ''}`}>
      <h2 className={`text-2xl font-semibold mb-8 text-center`}>
        {chapter.title}
      </h2>
      <div className={`
        leading-loose text-left
        ${getFontSizeClass(fontSize)}
        [&>p]:mb-6 [&_p+p]:mt-6
      `}>
        {chapter.content.split('\n\n').map((paragraph, index) => (
          <p key={index} className="mb-6">
            {paragraph.replace(/\n/g, ' ')}
          </p>
        ))}
      </div>
    </div>
  )
}
