import { cn } from "@/lib/utils"
import githubMark from "@/assets/github-mark.svg"

interface FooterProps {
  className?: string
}

const Footer = ({ className }: FooterProps) => {
  return (
    <footer
      className={cn(
        "border-t bg-background px-6 py-4 mt-auto",
        className
      )}
    >
      <div className="flex items-center justify-center gap-2">
        <a
          href="https://github.com/tdavies-dev"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <img src={githubMark} alt="GitHub" className="h-4 w-4" />
          tdavies-dev
        </a>
        <span className="text-sm text-muted-foreground">
          <span className="text-foreground">// 2025</span>
        </span>
      </div>
    </footer>
  )
}

export { Footer }
