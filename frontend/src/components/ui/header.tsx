import { useState, useEffect } from "react"
import { Sun, Moon, Minus, Plus, Type } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"

interface HeaderProps {
  className?: string
  children?: React.ReactNode
  fontSize?: string
  onFontSizeChange?: (direction: 'up' | 'down') => void
}

const Header = ({ className, children, fontSize = 'base', onFontSizeChange }: HeaderProps) => {
  const [isDark, setIsDark] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    const theme = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (theme === 'dark' || (!theme && systemPrefersDark)) {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    
    if (newTheme) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <header
      className={cn(
        "border-b bg-background px-6 py-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {children}
          <h1 className={cn(
            "font-bold tracking-tight",
            isMobile ? "text-sm" : "text-2xl"
          )}>
            gutenshad {!isMobile && <span className="text-muted-foreground font-normal">// a nice reader for the gutenberg 100</span>}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Font Size Controls */}
          <TooltipProvider>
            <div className="flex items-center gap-1">
              <Type className="h-4 w-4 text-muted-foreground" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFontSizeChange?.('down')}
                    disabled={fontSize === 'sm'}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Decrease text size</p>
                </TooltipContent>
              </Tooltip>
              <span className="text-xs text-muted-foreground min-w-6 text-center">
                {fontSize.toUpperCase()}
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFontSizeChange?.('up')}
                    disabled={fontSize === 'xl'}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Increase text size</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            {/* Dark Mode Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="h-9 w-9"
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle Dark Mode</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  )
}

export { Header }