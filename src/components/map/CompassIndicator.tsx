'use client'

import { useState, useCallback } from 'react'
import { useMapStore } from '@/lib/map-store'
import { Compass } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function CompassIndicator() {
  const { bearing } = useMapStore()
  const [isResetting, setIsResetting] = useState(false)

  const handleResetNorth = useCallback(() => {
    setIsResetting(true)
    const resetFn = (window as unknown as Record<string, unknown>).__mapResetNorth
    if (typeof resetFn === 'function') resetFn()
    // Keep the visual feedback animation running for a short duration
    setTimeout(() => setIsResetting(false), 600)
  }, [])

  if (bearing === 0 && !isResetting) return null

  return (
    <AnimatePresence>
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-1.5 bg-background/90 backdrop-blur-md rounded-xl border border-border/50 shadow-lg text-xs text-muted-foreground hover:text-foreground hover:bg-background transition-all hover:scale-105"
        onClick={handleResetNorth}
        title="Click to reset north"
        aria-label={`Map bearing ${Math.round(((bearing % 360) + 360) % 360)} degrees. Click to reset north.`}
      >
        <motion.div
          animate={isResetting ? { rotate: 0, scale: [1, 1.3, 1] } : { rotate: -bearing }}
          transition={isResetting ? { duration: 0.5, ease: 'easeOut' } : { duration: 0.15 }}
        >
          <Compass
            className={`h-3.5 w-3.5 text-primary ${isResetting ? 'text-emerald-500' : ''}`}
          />
        </motion.div>
        <span className={`font-mono transition-colors duration-300 ${isResetting ? 'text-emerald-500' : ''}`}>
          {isResetting ? 'N' : `${Math.round(((bearing % 360) + 360) % 360)}°`}
        </span>
      </motion.button>
    </AnimatePresence>
  )
}
