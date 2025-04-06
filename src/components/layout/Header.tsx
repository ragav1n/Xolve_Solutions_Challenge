import React from 'react'
import { Button } from '@/components/ui/button'
import { MoonIcon, SunIcon } from '@radix-ui/react-icons'
import { useTheme } from 'next-themes'

const Header: React.FC = () => {
  const { theme, setTheme } = useTheme()

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <nav>
            <ul className="flex space-x-4">
              <li><Button variant="link" asChild><a href="/">Home</a></Button></li>
              <li><Button variant="link" asChild><a href="/ai-tools">AI Tools</a></Button></li>
              <li><Button variant="link" asChild><a href="/career-development">Career Development</a></Button></li>
            </ul>
          </nav>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <SunIcon className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <MoonIcon className="h-[1.2rem] w-[1.2rem]" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header