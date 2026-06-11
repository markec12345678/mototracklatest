'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useMapStore, MAP_STYLES } from '@/lib/map-store'

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const { currentStyle, setCurrentStyle } = useMapStore()

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)

    // Auto-switch map style when toggling dark/light mode
    if (newTheme === 'dark' && currentStyle.category !== 'dark') {
      const darkStyle = MAP_STYLES.find((s) => s.category === 'dark')
      if (darkStyle) setCurrentStyle(darkStyle)
    } else if (newTheme === 'light' && currentStyle.category === 'dark') {
      const streetsStyle = MAP_STYLES.find((s) => s.id === 'streets')
      if (streetsStyle) setCurrentStyle(streetsStyle)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-background/90 backdrop-blur-md shadow-lg hover:shadow-xl h-10 w-10 rounded-xl border-border/50 transition-all hover:scale-105"
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl">
        <DropdownMenuItem
          onClick={() => handleThemeChange('light')}
          className="gap-2 rounded-lg"
        >
          <Sun className="h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange('dark')}
          className="gap-2 rounded-lg"
        >
          <Moon className="h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange('system')}
          className="gap-2 rounded-lg"
        >
          <Monitor className="h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
