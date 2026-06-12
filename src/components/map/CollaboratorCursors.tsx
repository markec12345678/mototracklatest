'use client'

import { useEffect, useRef, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import { useCollaborationStore } from '@/lib/collaboration-store'

export function CollaboratorCursors() {
  const collaborators = useCollaborationStore((s) => s.collaborators)
  const isCollaborating = useCollaborationStore((s) => s.isCollaborating)
  const userId = useCollaborationStore((s) => s.userId)
  const markersRef = useRef<Map<string, { marker: maplibregl.Marker; el: HTMLElement }>>(new Map())
  const mapRef = useRef<maplibregl.Map | null>(null)

  // Get map instance
  useEffect(() => {
    if (typeof window === 'undefined') return

    const getMap = () => {
      const map = (window as unknown as Record<string, maplibregl.Map>).__mainMap
      if (map) {
        mapRef.current = map
        return true
      }
      return false
    }

    if (!getMap()) {
      const handler = () => getMap()
      window.addEventListener('map-ready', handler)
      return () => window.removeEventListener('map-ready', handler)
    }
  }, [])

  // Update cursor position on map
  const updateMarker = useCallback((collabId: string, name: string, color: string, cursor: { lng: number; lat: number } | undefined) => {
    if (!mapRef.current || !cursor) return

    const existing = markersRef.current.get(collabId)

    if (existing) {
      // Update position
      existing.marker.setLngLat([cursor.lng, cursor.lat])
      return
    }

    // Create new marker
    const el = document.createElement('div')
    el.className = 'collaborator-cursor'
    el.style.position = 'relative'
    el.innerHTML = `
      <svg width="24" height="36" viewBox="0 0 24 36" fill="none" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24C24 5.373 18.627 0 12 0z" fill="${color}"/>
        <circle cx="12" cy="12" r="5" fill="white"/>
      </svg>
      <div style="
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: ${color};
        color: white;
        font-size: 10px;
        font-weight: 600;
        padding: 1px 6px;
        border-radius: 4px;
        white-space: nowrap;
        margin-top: 2px;
        pointer-events: none;
      ">${name}</div>
    `

    const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([cursor.lng, cursor.lat])
      .addTo(mapRef.current)

    markersRef.current.set(collabId, { marker, el })
  }, [])

  // Sync collaborators with markers
  useEffect(() => {
    if (!isCollaborating) {
      // Remove all markers
      markersRef.current.forEach(({ marker }) => marker.remove())
      markersRef.current.clear()
      return
    }

    const currentIds = new Set<string>()

    collaborators.forEach((collab) => {
      if (collab.id === userId) return // Don't show own cursor
      if (!collab.isOnline || !collab.cursor) return

      currentIds.add(collab.id)
      updateMarker(collab.id, collab.name, collab.color, collab.cursor)
    })

    // Remove markers for collaborators who went offline or left
    markersRef.current.forEach(({ marker }, id) => {
      if (!currentIds.has(id)) {
        marker.remove()
        markersRef.current.delete(id)
      }
    })
  }, [collaborators, isCollaborating, userId, updateMarker])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach(({ marker }) => marker.remove())
      markersRef.current.clear()
    }
  }, [])

  return null // This component doesn't render any DOM itself
}
