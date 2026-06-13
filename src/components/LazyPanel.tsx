'use client'

import { useState, useEffect, useRef, type ComponentType, type ReactNode } from 'react'

interface LazyPanelProps {
  /** The import function to load the component module */
  importFn: () => Promise<{ [key: string]: ComponentType<unknown> }>
  /** The named export to use from the module */
  exportName: string
  /** Whether this panel should be loaded */
  shouldLoad: boolean
  /** Props to pass to the component */
  props?: Record<string, unknown>
  /** Optional loading fallback */
  fallback?: ReactNode
}

export function LazyPanel({ importFn, exportName, shouldLoad, props, fallback }: LazyPanelProps) {
  const [Component, setComponent] = useState<ComponentType<unknown> | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const loadingRef = useRef(false)

  useEffect(() => {
    if (!shouldLoad || Component || loadingRef.current) return

    loadingRef.current = true
    importFn()
      .then((mod) => {
        const Comp = mod[exportName]
        if (Comp) {
          setComponent(() => Comp)
        } else {
          setError(new Error(`Export "${exportName}" not found in module`))
        }
      })
      .catch((err) => {
        console.error(`Failed to load panel "${exportName}":`, err)
        setError(err)
      })
  }, [shouldLoad, Component, importFn, exportName])

  if (!shouldLoad) return null
  if (error) {
    console.error(`Panel load error: ${exportName}`, error)
    return null
  }
  if (!Component) {
    return fallback || null
  }

  return <Component {...(props || {})} />
}
