import { useState, useEffect } from "react"
import { Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface HeaderProps {
  className?: string
  children?: React.ReactNode
}

const Header = ({ className, children }: HeaderProps) => {
  const [isDark, setIsDark] = useState(false)

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
          <h1 className="text-2xl font-bold tracking-tight">
            gutenshad <span className="text-muted-foreground font-normal">// a nice reader for the gutenberg 100</span>
          </h1>
        </div>
        
        <TooltipProvider>
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
    </header>
  )
}

export { Header }