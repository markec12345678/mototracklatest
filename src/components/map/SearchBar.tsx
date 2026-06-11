'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X, MapPin, Loader2, Navigation2, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useMapStore } from '@/lib/map-store'
import { cn } from '@/lib/utils'

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
  const [isFocused, setIsFocused] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const STORAGE_KEY = 'maplibre-recent-searches'

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setRecentSearches(JSON.parse(stored))
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  const saveRecentSearches = (searches: string[]) => {
    setRecentSearches(searches)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(searches))
    } catch {
      // Ignore localStorage errors
    }
  }

  const addRecentSearch = (searchTerm: string) => {
    const trimmed = searchTerm.trim()
    if (!trimmed) return
    const filtered = recentSearches.filter((s) => s !== trimmed)
    const updated = [trimmed, ...filtered].slice(0, 5)
    saveRecentSearches(updated)
  }

  const removeRecentSearch = (searchTerm: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = recentSearches.filter((s) => s !== searchTerm)
    saveRecentSearches(updated)
  }

  const clearAllRecentSearches = () => {
    saveRecentSearches([])
  }

  const handleRecentSearchClick = (searchTerm: string) => {
    setQuery(searchTerm)
    handleSearch(searchTerm)
    inputRef.current?.focus()
  }

  const showRecentSearches =
    isFocused &&
    recentSearches.length > 0 &&
    (query.trim() === '' || (!isSearching && results.length === 0))

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
          if (Array.isArray(data) && data.length > 0) {
            setResults(data)
            setShowResults(true)
          } else if (Array.isArray(data) && data.length === 0) {
            setResults([])
            setShowResults(true)
          } else if (data.error) {
            setResults([])
            setShowResults(false)
          }
        } else {
          setResults([])
          setShowResults(false)
        }
      } catch (err) {
        console.error('Search failed:', err)
        setResults([])
        setShowResults(false)
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
    const searchTerm = result.name.split(',')[0]
    setQuery(searchTerm)
    setShowResults(false)
    setSelectedIndex(-1)
    addRecentSearch(searchTerm)
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
          id="map-search-input"
          ref={inputRef}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => {
            setIsFocused(true)
            if (results.length > 0) setShowResults(true)
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Search the map..."
          className="pl-9 pr-9 h-11 bg-background/90 backdrop-blur-md border-border/50 shadow-lg hover:shadow-xl rounded-xl transition-all duration-200 focus:shadow-xl focus:shadow-[0_0_20px_rgba(16,185,129,0.15)] focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
          aria-label="Search locations on the map"
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
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {showResults && results.length === 0 && (
        <div className="map-tooltip absolute top-full mt-1.5 w-full overflow-hidden z-50">
          <div className="px-4 py-6 text-center">
            <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No results found</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Try a different search term</p>
          </div>
        </div>
      )}

      {showResults && results.length > 0 && (
        <div className="map-tooltip absolute top-full mt-1.5 w-full overflow-hidden z-50 max-h-80 overflow-y-auto">
          <div className="px-3 py-2 border-b bg-muted/30">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Search Results ({results.length})
            </p>
          </div>
          {results.map((result, i) => (
            <button
              key={`${result.latitude}-${result.longitude}-${i}`}
              onClick={() => handleSelect(result)}
              className={cn(
                'w-full px-3 py-2.5 text-left hover:bg-accent/80 transition-all duration-150 flex items-start gap-3 border-b last:border-0 rounded-lg mx-1',
                selectedIndex === i && 'bg-accent'
              )}
            >
              <div className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center shrink-0 mt-0.5">
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

      {showRecentSearches && (
        <div className="map-tooltip absolute top-full mt-1.5 w-full overflow-hidden z-50 max-h-80 overflow-y-auto">
          <div className="px-3 py-2 border-b bg-muted/30">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Recent Searches
            </p>
          </div>
          {recentSearches.map((searchTerm) => (
            <button
              key={searchTerm}
              onClick={() => handleRecentSearchClick(searchTerm)}
              className="w-full px-3 py-2.5 text-left hover:bg-accent transition-colors flex items-center gap-3 border-b last:border-0"
            >
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium truncate flex-1">{searchTerm}</p>
              <button
                onClick={(e) => removeRecentSearch(searchTerm, e)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-all shrink-0"
                aria-label={`Remove ${searchTerm} from recent searches`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </button>
          ))}
          <div className="px-3 py-2">
            <button
              onClick={clearAllRecentSearches}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
