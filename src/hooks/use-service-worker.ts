'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

type ServiceWorkerState = 'idle' | 'registering' | 'active' | 'error'

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>('idle')
  const [cachedTileCount, setCachedTileCount] = useState(0)
  const mountedRef = useRef(false)

  const updateState = useCallback((newState: ServiceWorkerState) => {
    setState(newState)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    // Use requestAnimationFrame to avoid synchronous setState in effect
    const raf = requestAnimationFrame(() => {
      updateState('registering')

      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          if (registration.active) {
            updateState('active')
          }

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (!newWorker) return

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                updateState('active')
              }
            })
          })

          if (!registration.active && registration.installing) {
            registration.installing.addEventListener('statechange', () => {
              if (registration.installing?.state === 'activated') {
                updateState('active')
              }
            })
          } else if (registration.active) {
            updateState('active')
          }
        })
        .catch(() => {
          updateState('error')
        })
    })

    return () => cancelAnimationFrame(raf)
  }, [updateState])

  // Get cached tile count (separate effect to avoid mixing concerns)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    const updateCacheCount = () => {
      if (!navigator.serviceWorker.controller) return
      const channel = new MessageChannel()
      channel.port1.onmessage = (event) => {
        if (event.data && typeof event.data.count === 'number') {
          setCachedTileCount(event.data.count)
        }
      }
      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_CACHE_SIZE' },
        [channel.port2]
      )
    }

    const interval = setInterval(updateCacheCount, 10000)
    const timeout = setTimeout(updateCacheCount, 3000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

  return { state, cachedTileCount }
}
