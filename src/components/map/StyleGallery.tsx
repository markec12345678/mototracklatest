'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  X,
  Check,
  Search,
  Loader2,
  Palette,
  Map,
  Mountain,
  Moon,
  Satellite,
  Layers,
} from 'lucide-react'
import { useMapStore, MAP_STYLES, type MapStyleOption } from '@/lib/map-store'
import { cn } from '@/lib/utils'

const STYLE_CATEGORIES = [
  { id: 'all', label: 'All', icon: <Layers className="h-3.5 w-3.5" /> },
  { id: 'standard', label: 'Standard', icon: <Map className="h-3.5 w-3.5" /> },
  { id: 'terrain', label: 'Outdoor', icon: <Mountain className="h-3.5 w-3.5" /> },
  { id: 'dark', label: 'Dark', icon: <Moon className="h-3.5 w-3.5" /> },
  { id: 'satellite', label: 'Satellite', icon: <Satellite className="h-3.5 w-3.5" /> },
  { id: 'custom', label: 'Custom', icon: <Palette className="h-3.5 w-3.5" /> },
] as const

const STYLE_DESCRIPTIONS: Record<string, string> = {
  streets: 'Clean and modern street map with detailed labels and landmarks',
  satellite: 'High-resolution satellite imagery from space',
  hybrid: 'Satellite imagery with street labels and road network overlay',
  terrain: 'Elevation contours and terrain shading with hillshade relief',
  topo: 'Topographic map with contour lines, elevation markers, and trails',
  dark: 'Minimalist dark theme perfect for night-time navigation',
  outdoor: 'Optimized for hiking and outdoor activities with trail details',
  osm: 'Community-driven OpenStreetMap with open data',
}

// Gradient backgrounds for style preview cards
const STYLE_GRADIENTS: Record<string, string> = {
  streets: 'linear-gradient(135deg, #e8f5e9, #b2dfdb, #80cbc4)',
  satellite: 'linear-gradient(135deg, #1b5e20, #2e7d32, #1b5e20)',
  hybrid: 'linear-gradient(135deg, #1b5e20, #4caf50, #1b5e20)',
  terrain: 'linear-gradient(135deg, #f9a825, #ff8f00, #e65100)',
  topo: 'linear-gradient(135deg, #fff9c4, #f9a825, #ff8f00)',
  dark: 'linear-gradient(135deg, #212121, #424242, #616161)',
  outdoor: 'linear-gradient(135deg, #c8e6c9, #66bb6a, #43a047)',
  osm: 'linear-gradient(135deg, #c8e6c9, #a5d6a7, #81c784)',
}

interface StyleGalleryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StyleGallery({ open, onOpenChange }: StyleGalleryProps) {
  const { currentStyle, setCurrentStyle } = useMapStore()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [previewLoading, setPreviewLoading] = useState<string | null>(null)

  const filteredStyles = MAP_STYLES.filter((style) => {
    const matchesCategory = selectedCategory === 'all' || style.category === selectedCategory
    const matchesSearch = searchQuery === '' ||
      style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      style.provider.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleSelectStyle = useCallback((style: MapStyleOption) => {
    setPreviewLoading(style.id)
    setCurrentStyle(style)
    useMapStore.getState().pushNotification({ type: 'style', icon: 'map', message: `Switched to ${style.name} view` })

    // Small delay for visual feedback
    setTimeout(() => {
      setPreviewLoading(null)
      onOpenChange(false)
    }, 300)
  }, [setCurrentStyle, onOpenChange])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="p-4 pb-3 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Palette className="h-5 w-5 text-emerald-500" />
                Map Style Gallery
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Choose from {MAP_STYLES.length} beautiful map styles
              </p>
            </div>
          </div>

          {/* Search and category filters */}
          <div className="mt-3 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 text-xs pl-8"
              />
            </div>
          </div>

          {/* Category pills */}
          <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {STYLE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap',
                  selectedCategory === cat.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Styles grid */}
        <ScrollArea className="max-h-[calc(90vh-160px)]">
          <div className="p-4">
            {filteredStyles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Palette className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm">No styles found matching your criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <AnimatePresence mode="popLayout">
                  {filteredStyles.map((style, i) => {
                    const isActive = currentStyle.id === style.id
                    const gradientBg = STYLE_GRADIENTS[style.id] || 'linear-gradient(135deg, #e0e0e0, #bdbdbd)'
                    const isPreviewLoading = previewLoading === style.id
                    const description = STYLE_DESCRIPTIONS[style.id] || `${style.name} map style by ${style.provider === 'maptiler' ? 'MapTiler' : style.provider === 'carto' ? 'CARTO' : 'OSM'}`

                    return (
                      <motion.button
                        key={style.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2, delay: i * 0.03 }}
                        onClick={() => handleSelectStyle(style)}
                        className={cn(
                          'relative group rounded-xl border overflow-hidden text-left transition-all duration-200',
                          'hover:shadow-lg hover:-translate-y-0.5',
                          isActive
                            ? 'border-primary/50 ring-2 ring-primary/20 shadow-md'
                            : 'border-border/50 hover:border-border'
                        )}
                      >
                        {/* Preview gradient */}
                        <div
                          className="relative h-24 sm:h-28 flex items-center justify-center overflow-hidden"
                          style={{ background: gradientBg }}
                        >
                          <span className="text-3xl sm:text-4xl drop-shadow-lg relative z-10 group-hover:scale-110 transition-transform duration-300">
                            {style.preview.emoji}
                          </span>

                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200" />

                          {/* Currently active indicator */}
                          {isActive && (
                            <div className="absolute top-2 right-2 z-20">
                              <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                              </div>
                            </div>
                          )}

                          {/* Loading overlay */}
                          {isPreviewLoading && (
                            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-30">
                              <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                          )}

                          {/* Category badge */}
                          <div className="absolute bottom-1.5 left-1.5 z-10">
                            <Badge
                              variant="secondary"
                              className="text-[8px] px-1.5 py-0 h-4 bg-background/80 backdrop-blur-sm"
                            >
                              {style.category}
                            </Badge>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-2.5">
                          <div className="flex items-center gap-1.5">
                            <p className={cn(
                              'text-xs font-semibold truncate',
                              isActive && 'text-primary'
                            )}>
                              {style.name}
                            </p>
                          </div>
                          <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                            {description}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Badge
                              variant="outline"
                              className="text-[8px] px-1 py-0 h-3.5 capitalize"
                            >
                              {style.provider === 'maptiler' ? 'MapTiler' : style.provider === 'carto' ? 'CARTO' : 'OSM'}
                            </Badge>
                            {isActive && (
                              <Badge className="text-[8px] px-1.5 py-0 h-3.5 bg-primary/10 text-primary border-primary/20 border">
                                Active
                              </Badge>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
