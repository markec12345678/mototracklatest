'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Building2, X, Ruler, Layers, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMapStore } from '@/lib/map-store'

export function BuildingInfoPanel() {
  const selectedBuilding = useMapStore((s) => s.selectedBuilding)
  const setSelectedBuilding = useMapStore((s) => s.setSelectedBuilding)

  const handleClose = () => {
    setSelectedBuilding(null)
  }

  return (
    <AnimatePresence>
      {selectedBuilding && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute top-20 right-3 z-20 w-72"
        >
          <div className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-4 py-3 border-b border-border/30">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-foreground truncate">
                      {selectedBuilding.name}
                    </h3>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {selectedBuilding.type}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground shrink-0"
                  aria-label="Close building info"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="p-4 space-y-3">
              {/* Height & Levels */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Ruler className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Height</span>
                  </div>
                  <p className="text-lg font-bold text-foreground tabular-nums">
                    {selectedBuilding.height > 0 ? `${selectedBuilding.height}m` : 'N/A'}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Layers className="h-3.5 w-3.5 text-teal-500" />
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Levels</span>
                  </div>
                  <p className="text-lg font-bold text-foreground tabular-nums">
                    ~{selectedBuilding.levels}
                  </p>
                </div>
              </div>

              {/* Coordinates */}
              <div className="bg-muted/50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <MapPin className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Coordinates</span>
                </div>
                <p className="text-xs font-mono text-foreground">
                  {selectedBuilding.coordinates[1].toFixed(6)}, {selectedBuilding.coordinates[0].toFixed(6)}
                </p>
              </div>

              {/* Building type badge */}
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {selectedBuilding.type} Building
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
