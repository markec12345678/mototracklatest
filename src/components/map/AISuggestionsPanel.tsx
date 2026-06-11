'use client'

import { useState } from 'react'
import { Sparkles, MapPin, Loader2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMapStore } from '@/lib/map-store'
import { useTranslation } from '@/lib/translations'
import { cn } from '@/lib/utils'

interface AISuggestion {
  name: string
  category: string
  description: string
  distance: string
  latitude: number
  longitude: number
}

const categoryColors: Record<string, string> = {
  food: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  hotel: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  transport: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
  entertainment: 'bg-pink-500/10 text-pink-700 dark:text-pink-400',
  shopping: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  nature: 'bg-green-500/10 text-green-700 dark:text-green-400',
  culture: 'bg-violet-500/10 text-violet-700 dark:text-violet-400',
  history: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  general: 'bg-muted/50 text-muted-foreground',
}

const categoryIcons: Record<string, string> = {
  food: '🍽️',
  hotel: '🏨',
  transport: '🚌',
  entertainment: '🎭',
  shopping: '🛍️',
  nature: '🌿',
  culture: '🏛️',
  history: '📜',
  general: '📍',
}

export function AISuggestionsPanel() {
  const { t } = useTranslation()
  const center = useMapStore((s) => s.center)
  const [preferences, setPreferences] = useState('')
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(true)

  const fetchSuggestions = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [longitude, latitude] = center
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude,
          longitude,
          preferences: preferences.trim() || undefined,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to get suggestions')
      }

      const data = await res.json()
      setSuggestions(data.suggestions ?? [])

      // Add notification
      useMapStore.getState().addAppNotification({
        type: 'general',
        message: `AI found ${data.suggestions?.length ?? 0} suggestions near your location`,
        icon: 'sparkles',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const flyToSuggestion = (suggestion: AISuggestion) => {
    const flyTo = (window as unknown as Record<
      string,
      (lng: number, lat: number, z?: number) => void
    >).__mapFlyTo
    if (flyTo) {
      flyTo(suggestion.longitude, suggestion.latitude, 15)
    }
  }

  return (
    <div className="bg-background/90 backdrop-blur-xl border border-border/50 rounded-2xl shadow-lg w-80 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <button
          className="flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-opacity"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Sparkles className="h-4 w-4 text-primary" />
          {t('aiTitle')}
        </button>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="p-4">
          {/* Preferences input */}
          <div className="flex gap-2 mb-3">
            <Input
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder={t('aiPreferences')}
              className="h-9 text-xs rounded-lg"
              onKeyDown={(e) => {
                if (e.key === 'Enter') fetchSuggestions()
              }}
            />
            <Button
              onClick={fetchSuggestions}
              disabled={isLoading}
              size="sm"
              className="h-9 px-3 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shrink-0 gap-1.5"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline text-xs">{t('aiGetSuggestions')}</span>
            </Button>
          </div>

          {/* Loading skeleton */}
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border/30 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-4 w-2/3 rounded" />
                  </div>
                  <Skeleton className="h-3 w-full rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-center">
              <p className="text-xs text-destructive mb-2">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={fetchSuggestions}
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </Button>
            </div>
          )}

          {/* Suggestions list */}
          {!isLoading && !error && suggestions.length > 0 && (
            <ScrollArea className="max-h-72">
              <div className="space-y-2">
                {suggestions.map((suggestion, i) => (
                  <div
                    key={`${suggestion.name}-${i}`}
                    className="rounded-xl border border-border/30 p-3 hover:bg-accent/30 transition-colors group"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-base mt-0.5">
                        {categoryIcons[suggestion.category] ?? categoryIcons.general}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium truncate">
                            {suggestion.name}
                          </span>
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-[9px] px-1.5 py-0 h-4 shrink-0',
                              categoryColors[suggestion.category] ?? categoryColors.general
                            )}
                          >
                            {suggestion.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {suggestion.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {suggestion.distance}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] px-2 gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => flyToSuggestion(suggestion)}
                          >
                            <MapPin className="h-3 w-3" />
                            {t('aiShowOnMap')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Empty state */}
          {!isLoading && !error && suggestions.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">Click &quot;{t('aiGetSuggestions')}&quot; to discover nearby places</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
