'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X, MapPin, Loader2, Navigation2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useMapStore } from '@/lib/map-store'

interface SearchResult {
  name: string
  latitude: number
  longitude: number
  type: string
  category: string
}

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery)
    setSelectedIndex(-1)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!searchQuery.trim()) {
      setResults([])
      setShowResults(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery)}`
        )
        if (res.ok) {
          const data = await res.json()
          setResults(data)
          setShowResults(true)
        }
      } catch (err) {
        console.error('Search failed:', err)
      } finally {
        setIsSearching(false)
      }
    }, 400)
  }

  const handleSelect = (result: SearchResult) => {
    const flyTo = (window as unknown as Record<
      string,
      (lng: number, lat: number, z?: number) => void
    >).__mapFlyTo
    if (flyTo) {
      flyTo(result.longitude, result.latitude, 14)
    }
    setQuery(result.name.split(',')[0])
    setShowResults(false)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      handleSelect(results[selectedIndex])
    } else if (e.key === 'Escape') {
      setShowResults(false)
      inputRef.current?.blur()
    }
  }

  const getTypeIcon = (type: string, category: string) => {
    if (category === 'boundary' || type === 'administrative') return '🏛️'
    if (category === 'place' || type === 'city') return '🏙️'
    if (category === 'railway' || type === 'station') return '🚉'
    if (category === 'amenity') return '📍'
    if (category === 'tourism') return '🗺️'
    return '📍'
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search places..."
          className="pl-9 pr-9 h-11 bg-background/90 backdrop-blur-sm border shadow-md rounded-xl transition-all focus:shadow-lg focus:ring-2 focus:ring-primary/20"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
        {!isSearching && query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              setShowResults(false)
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-all"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute top-full mt-1.5 w-full bg-popover/95 backdrop-blur-xl border rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
          <div className="px-3 py-2 border-b bg-muted/30">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Search Results ({results.length})
            </p>
          </div>
          {results.map((result, i) => (
            <button
              key={i}
              onClick={() => handleSelect(result)}
              className={cn(
                'w-full px-3 py-2.5 text-left hover:bg-accent transition-colors flex items-start gap-3 border-b last:border-0',
                selectedIndex === i && 'bg-accent'
              )}
            >
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-sm">
                  {getTypeIcon(result.type, result.category)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {result.name.split(',')[0]}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {result.name}
                </p>
              </div>
              <Navigation2 className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
