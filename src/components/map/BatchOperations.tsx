'use client'

import { useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckSquare,
  Square,
  Trash2,
  Palette,
  Download,
  FolderInput,
  CheckCircle2,
  XCircle,
  Layers,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useMapStore } from '@/lib/map-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useState } from 'react'

const CATEGORY_OPTIONS = [
  { name: 'Restaurant', color: '#ef4444' },
  { name: 'Hotel', color: '#3b82f6' },
  { name: 'Attraction', color: '#22c55e' },
  { name: 'Shopping', color: '#f59e0b' },
  { name: 'Transport', color: '#8b5cf6' },
  { name: 'General', color: '#6b7280' },
]

export function BatchOperations() {
  const markers = useMapStore((s) => s.markers)
  const batchOperation = useMapStore((s) => s.batchOperation)
  const setBatchSelectMode = useMapStore((s) => s.setBatchSelectMode)
  const toggleMarkerSelection = useMapStore((s) => s.toggleMarkerSelection)
  const selectAllMarkers = useMapStore((s) => s.selectAllMarkers)
  const deselectAllMarkers = useMapStore((s) => s.deselectAllMarkers)
  const batchDeleteMarkers = useMapStore((s) => s.batchDeleteMarkers)
  const batchChangeCategory = useMapStore((s) => s.batchChangeCategory)
  const batchExportGeoJSON = useMapStore((s) => s.batchExportGeoJSON)

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [batchCategory, setBatchCategory] = useState('')

  const selectedCount = batchOperation.selectedMarkerIds.length
  const hasMarkers = markers.length > 0

  const handleBatchDelete = useCallback(() => {
    batchDeleteMarkers()
    setConfirmDelete(false)
    toast.success(`Deleted ${selectedCount} markers`)
  }, [batchDeleteMarkers, selectedCount])

  const handleBatchCategory = useCallback(() => {
    const cat = CATEGORY_OPTIONS.find((c) => c.name === batchCategory)
    if (!cat) return
    batchChangeCategory(cat.name, cat.color)
    toast.success(`Changed category to ${cat.name} for ${selectedCount} markers`)
    setBatchCategory('')
  }, [batchCategory, batchChangeCategory, selectedCount])

  const handleExport = useCallback(() => {
    const geojson = batchExportGeoJSON()
    const blob = new Blob([geojson], { type: 'application/geo+json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'selected-markers.geojson'
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${selectedCount} markers as GeoJSON`)
  }, [batchExportGeoJSON, selectedCount])

  return (
    <>
      {/* Floating Action Bar - shown when markers are selected */}
      <AnimatePresence>
        {batchOperation.isSelectMode && selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 md:bottom-16"
          >
            <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3">
              {/* Selection count */}
              <Badge variant="secondary" className="text-xs px-2.5 py-1">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {selectedCount} selected
              </Badge>

              <div className="w-px h-6 bg-border" />

              {/* Batch actions */}
              <div className="flex items-center gap-1.5">
                {/* Change Category */}
                <Select value={batchCategory} onValueChange={(v) => {
                  setBatchCategory(v)
                }}>
                  <SelectTrigger className="h-8 w-32 text-xs">
                    <Palette className="h-3 w-3 mr-1" />
                    <SelectValue placeholder="Category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <SelectItem key={cat.name} value={cat.name}>
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {batchCategory && (
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleBatchCategory}>
                    Apply
                  </Button>
                )}

                {/* Export */}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1"
                  onClick={handleExport}
                >
                  <Download className="h-3 w-3" />
                  Export
                </Button>

                {/* Delete */}
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 text-xs gap-1"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              </div>

              <div className="w-px h-6 bg-border" />

              {/* Deselect all */}
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs gap-1"
                onClick={() => {
                  deselectAllMarkers()
                  setBatchSelectMode(false)
                }}
              >
                <XCircle className="h-3 w-3" />
                Exit
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Dialog */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete {selectedCount} Markers
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedCount} selected marker{selectedCount !== 1 ? 's' : ''}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBatchDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sidebar section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            Batch Operations
          </h3>
          <Button
            size="sm"
            variant={batchOperation.isSelectMode ? 'default' : 'outline'}
            className={cn(
              'h-7 text-xs gap-1',
              batchOperation.isSelectMode && 'bg-orange-500 hover:bg-orange-600 text-white'
            )}
            onClick={() => setBatchSelectMode(!batchOperation.isSelectMode)}
          >
            <CheckSquare className="h-3 w-3" />
            {batchOperation.isSelectMode ? 'Exit Select' : 'Multi-Select'}
          </Button>
        </div>

        {batchOperation.isSelectMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {/* Select All / Deselect All */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs flex-1 gap-1"
                onClick={selectAllMarkers}
              >
                <CheckCircle2 className="h-3 w-3" />
                Select All
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs flex-1 gap-1"
                onClick={deselectAllMarkers}
              >
                <XCircle className="h-3 w-3" />
                Deselect All
              </Button>
            </div>

            {/* Marker selection list */}
            {markers.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No markers to select</p>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {markers.map((marker) => {
                  const isSelected = batchOperation.selectedMarkerIds.includes(marker.id)
                  return (
                    <button
                      key={marker.id}
                      className={cn(
                        'w-full flex items-center gap-2 p-2 rounded-md text-left transition-colors text-xs',
                        isSelected ? 'bg-orange-500/10 border border-orange-500/30' : 'hover:bg-accent/30 border border-transparent'
                      )}
                      onClick={() => toggleMarkerSelection(marker.id)}
                    >
                      {isSelected ? (
                        <CheckSquare className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                      ) : (
                        <Square className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      )}
                      <div
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: marker.color }}
                      />
                      <span className="truncate flex-1">{marker.name}</span>
                      <span className="text-[9px] text-muted-foreground">{marker.category}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {selectedCount > 0 && (
              <div className="text-xs text-muted-foreground text-center">
                {selectedCount} of {markers.length} selected
              </div>
            )}
          </motion.div>
        )}
      </div>
    </>
  )
}
