import { cn } from "@/lib/utils"

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
      <div className="flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          tdavies-dev <span className="text-foreground">// 2025</span>
        </p>
      </div>
    </footer>
  )
}

export { Footer }
