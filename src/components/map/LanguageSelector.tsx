'use client'

import { useMapStore, type AppLanguage } from '@/lib/map-store'
import { LANGUAGE_OPTIONS } from '@/lib/translations'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function LanguageSelector() {
  const language = useMapStore((s) => s.language)
  const setLanguage = useMapStore((s) => s.setLanguage)

  const current = LANGUAGE_OPTIONS.find((l) => l.code === language) ?? LANGUAGE_OPTIONS[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="map-control-glass h-9 gap-1.5 px-2.5 rounded-xl text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label={`Current language: ${current.label}. Click to change.`}
        >
          <span className="text-sm">{current.flag}</span>
          <span className="hidden sm:inline">{current.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {LANGUAGE_OPTIONS.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code as AppLanguage)}
            className={`flex items-center gap-2.5 cursor-pointer ${language === lang.code ? 'bg-primary/10 font-medium' : ''}`}
          >
            <span className="text-base">{lang.flag}</span>
            <span>{lang.label}</span>
            {language === lang.code && (
              <span className="ml-auto text-primary text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
