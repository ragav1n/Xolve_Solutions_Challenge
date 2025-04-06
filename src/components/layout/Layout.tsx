import type React from "react"
import Header from "./Header"
import Footer from "./Footer"
import { ThemeProvider } from "next-themes"

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-foreground">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}

export default Layout