'use client'

import { useState, useEffect, useRef, type ComponentType } from 'react'
import { useMapStore } from '@/lib/map-store'

/**
 * Cache for loaded component modules. Once a component is imported,
 * it stays cached so re-opening a panel doesn't trigger another import.
 */
const componentCache = new Map<string, ComponentType<unknown>>()

interface LazyPanelProps {
  /** Unique identifier for this panel (used as cache key) */
  panelId: string
  /** Dynamic import function - e.g., () => import('@/components/map/GlacierMonitor') */
  importFn: () => Promise<Record<string, unknown>>
  /** Named export from the module - e.g., 'GlacierMonitor' */
  exportName: string
  /**
   * Top-level key in the Zustand store to check for panel visibility.
   * For flat booleans (e.g., measurementSuiteOpen), this is the key itself.
   * For nested objects (e.g., smartRoute.open), this is the object key.
   * If omitted, the panel loads on mount (for always-visible components).
   */
  storeKey?: string
  /**
   * Property within the storeKey object to check (e.g., 'open', 'enabled', 'visible').
   * Only used when storeKey points to a nested object.
   * If omitted, storeKey is treated as a flat boolean.
   */
  storeProperty?: string
  /**
   * Custom selector function for complex visibility conditions.
   * Takes the full store state and returns a boolean.
   * Overrides storeKey/storeProperty if provided.
   * Example: (s) => s.drawingTool !== 'none'
   */
  selector?: (state: Record<string, unknown>) => boolean
  /**
   * Optional props to pass to the loaded component.
   * Useful for dialog components that need open/onOpenChange.
   */
  props?: Record<string, unknown>
}

/**
 * LazyPanel - Truly lazy component loader that defers module imports
 * until the panel's open state becomes true.
 *
 * Unlike next/dynamic, which creates import promises at module evaluation time
 * (causing Turbopack to compile ALL modules upfront), LazyPanel only triggers
 * the dynamic import when the component is actually needed.
 */
export function LazyPanel({ panelId, importFn, exportName, storeKey, storeProperty, selector, props }: LazyPanelProps) {
  // Build the selector function inline (no useMemo to avoid lint issue)
  const getOpenState = selector
    ? selector
    : storeKey
      ? storeProperty
        ? (s: Record<string, unknown>) => {
            const val = s[storeKey]
            if (val != null && typeof val === 'object') {
              return ((val as Record<string, unknown>)[storeProperty] as boolean) ?? false
            }
            return false
          }
        : (s: Record<string, unknown>) => (s[storeKey] as boolean) ?? false
      : () => true

  // Subscribe to the store using the selector
  const open = useMapStore(getOpenState as (s: never) => boolean)

  // Track loaded component (check cache first)
  const [Component, setComponent] = useState<ComponentType<unknown> | null>(
    componentCache.get(panelId) || null
  )

  // Use ref for loading state to avoid the lint warning about setState in effects
  const loadingRef = useRef(false)

  // Stabilize importFn with ref to avoid effect re-triggering
  const importFnRef = useRef(importFn)

  useEffect(() => {
    importFnRef.current = importFn
  })

  useEffect(() => {
    if (open && !Component && !loadingRef.current) {
      loadingRef.current = true
      importFnRef.current()
        .then((mod) => {
          const Comp = mod[exportName] as ComponentType<unknown>
          componentCache.set(panelId, Comp)
          setComponent(Comp)
        })
        .catch((err) => {
          console.error(`[LazyPanel] Failed to load ${panelId}:`, err)
        })
        .finally(() => {
          loadingRef.current = false
        })
    }
  }, [open, Component, exportName, panelId])

  // Don't render anything if panel is closed or component isn't loaded yet
  if (!open || !Component) return null

  return <Component {...(props || {})} />
}
