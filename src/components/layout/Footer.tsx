import type React from "react"

const Footer: React.FC = () => {
  return (
    <footer className="bg-background border-t mt-8">
      <div className="container mx-auto px-4 py-4 text-center">
        <p className="text-sm text-muted-foreground">&copy; 2023 TeachAssist. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer