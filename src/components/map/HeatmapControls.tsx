'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Flame } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { useMapStore } from '@/lib/map-store'

export function HeatmapControls() {
  const heatmapEnabled = useMapStore((s) => s.heatmapEnabled)
  const setHeatmapEnabled = useMapStore((s) => s.setHeatmapEnabled)
  const heatmapIntensity = useMapStore((s) => s.heatmapIntensity)
  const setHeatmapIntensity = useMapStore((s) => s.setHeatmapIntensity)
  const heatmapRadius = useMapStore((s) => s.heatmapRadius)
  const setHeatmapRadius = useMapStore((s) => s.setHeatmapRadius)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-background/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl overflow-hidden"
        style={{ width: 260, backdropFilter: 'blur(20px) saturate(180%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Flame className="h-4 w-4 text-orange-500" />
            </div>
            <span className="text-sm font-semibold">Heatmap</span>
          </div>
          <Switch
            checked={heatmapEnabled}
            onCheckedChange={setHeatmapEnabled}
            aria-label="Toggle heatmap"
          />
        </div>

        {heatmapEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="px-4 pb-3 space-y-3"
          >
            {/* Intensity slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Intensity</label>
                <span className="text-xs font-semibold tabular-nums text-orange-600 dark:text-orange-400">
                  {heatmapIntensity.toFixed(1)}
                </span>
              </div>
              <Slider
                min={0.1}
                max={1}
                step={0.05}
                value={[heatmapIntensity]}
                onValueChange={(v) => setHeatmapIntensity(v[0])}
                aria-label="Heatmap intensity"
              />
            </div>

            {/* Radius slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Radius</label>
                <span className="text-xs font-semibold tabular-nums text-orange-600 dark:text-orange-400">
                  {heatmapRadius}px
                </span>
              </div>
              <Slider
                min={10}
                max={60}
                step={1}
                value={[heatmapRadius]}
                onValueChange={(v) => setHeatmapRadius(v[0])}
                aria-label="Heatmap radius"
              />
            </div>

            {/* Color legend */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Density</label>
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-muted-foreground">Low</span>
                <div className="flex-1 h-2.5 rounded-full overflow-hidden"
                  style={{
                    background: 'linear-gradient(to right, rgba(0,0,255,0.2), rgb(0,0,255), rgb(0,255,255), rgb(0,255,0), rgb(255,255,0), rgb(255,0,0))',
                  }}
                />
                <span className="text-[9px] text-muted-foreground">High</span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
