'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Camera,
  Trash2,
  MapPin,
  Clock,
  ZoomIn,
  RotateCcw,
  Plus,
} from 'lucide-react'
import { useMapStore, type MapSnapshot } from '@/lib/map-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

function formatDate(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffH < 24) return `${diffH}h ago`
  if (diffD < 7) return `${diffD}d ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function SnapshotManager() {
  const snapshots = useMapStore((s) => s.snapshots)
  const loadSnapshot = useMapStore((s) => s.loadSnapshot)
  const deleteSnapshot = useMapStore((s) => s.deleteSnapshot)
  const saveSnapshot = useMapStore((s) => s.saveSnapshot)
  const [snapshotName, setSnapshotName] = useState('')
  const [showInput, setShowInput] = useState(false)

  const handleSave = () => {
    const name = snapshotName.trim() || `Snapshot ${snapshots.length + 1}`
    saveSnapshot(name)
    setSnapshotName('')
    setShowInput(false)
    toast.success(`Snapshot "${name}" saved`)
  }

  const handleRestore = (snapshot: MapSnapshot) => {
    loadSnapshot(snapshot.id)
    toast.success(`Restored: ${snapshot.name}`)
  }

  const handleDelete = (id: string, name: string) => {
    deleteSnapshot(id)
    toast.success(`Deleted snapshot: ${name}`)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold flex items-center gap-1.5">
          <Camera className="h-3.5 w-3.5 text-emerald-500" />
          Map Snapshots
          {snapshots.length > 0 && (
            <span className="text-[9px] text-muted-foreground font-normal">
              ({snapshots.length})
            </span>
          )}
        </h3>
        {!showInput && (
          <Button
            size="sm"
            variant="outline"
            className="h-6 text-[10px] gap-1 px-2"
            onClick={() => setShowInput(true)}
          >
            <Plus className="h-2.5 w-2.5" />
            Save
          </Button>
        )}
      </div>

      {/* Save input */}
      <AnimatePresence>
        {showInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="flex gap-1.5">
              <Input
                placeholder="Snapshot name..."
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave()
                  if (e.key === 'Escape') setShowInput(false)
                }}
                className="h-7 text-xs"
                autoFocus
              />
              <Button
                size="sm"
                className="h-7 text-[10px] gap-1 px-3 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                onClick={handleSave}
              >
                <Camera className="h-2.5 w-2.5" />
                Save
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Snapshots list */}
      {snapshots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
          <Camera className="h-7 w-7 mb-2 opacity-20" />
          <p className="text-[10px]">No snapshots saved</p>
          <p className="text-[9px] opacity-60">Save your current map view for quick access</p>
        </div>
      ) : (
        <ScrollArea className="max-h-[300px]">
          <div className="space-y-1.5">
            <AnimatePresence>
              {snapshots.map((snapshot) => (
                <motion.div
                  key={snapshot.id}
                  layout
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  transition={{ duration: 0.15 }}
                  className="group flex items-center gap-2 p-2 rounded-lg border border-border/30 hover:border-border/50 hover:bg-accent/30 transition-all"
                >
                  {/* Thumbnail / icon */}
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center shrink-0">
                    <Camera className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>

                  {/* Info */}
                  <button
                    className="flex-1 min-w-0 text-left"
                    onClick={() => handleRestore(snapshot)}
                  >
                    <p className="text-[11px] font-medium truncate group-hover:text-primary transition-colors">
                      {snapshot.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                        <Clock className="h-2 w-2" />
                        {formatDate(snapshot.timestamp)}
                      </span>
                      <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                        <ZoomIn className="h-2 w-2" />
                        {snapshot.zoom.toFixed(1)}x
                      </span>
                      <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                        <MapPin className="h-2 w-2" />
                        {snapshot.center[1].toFixed(2)}°, {snapshot.center[0].toFixed(2)}°
                      </span>
                    </div>
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                      onClick={() => handleRestore(snapshot)}
                      title="Restore snapshot"
                      aria-label={`Restore ${snapshot.name}`}
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(snapshot.id, snapshot.name)}
                      title="Delete snapshot"
                      aria-label={`Delete ${snapshot.name}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
