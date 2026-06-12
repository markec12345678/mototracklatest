'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useMapStore, type MapAnnotation } from '@/lib/map-store'
import maplibregl from 'maplibre-gl'

const ANNOTATION_COLORS = [
  { id: 'white', value: '#ffffff', shadow: '0 1px 3px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.3)' },
  { id: 'black', value: '#1a1a1a', shadow: '0 1px 3px rgba(255,255,255,0.3), 0 0 8px rgba(0,0,0,0.2)' },
  { id: 'red', value: '#ef4444', shadow: '0 1px 3px rgba(0,0,0,0.5)' },
  { id: 'blue', value: '#3b82f6', shadow: '0 1px 3px rgba(0,0,0,0.5)' },
  { id: 'green', value: '#22c55e', shadow: '0 1px 3px rgba(0,0,0,0.5)' },
  { id: 'yellow', value: '#eab308', shadow: '0 1px 3px rgba(0,0,0,0.5)' },
  { id: 'orange', value: '#f97316', shadow: '0 1px 3px rgba(0,0,0,0.5)' },
  { id: 'purple', value: '#a855f7', shadow: '0 1px 3px rgba(0,0,0,0.5)' },
]

const FONT_SIZES = [
  { id: 'small', value: 12, label: 'S' },
  { id: 'medium', value: 16, label: 'M' },
  { id: 'large', value: 22, label: 'L' },
  { id: 'xlarge', value: 30, label: 'XL' },
]

export function MapAnnotations() {
  const annotations = useMapStore((s) => s.annotations)
  const deleteAnnotation = useMapStore((s) => s.deleteAnnotation)
  const updateAnnotation = useMapStore((s) => s.updateAnnotation)
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map())
  const mapRef = useRef<maplibregl.Map | null>(null)

  // Get the map instance
  useEffect(() => {
    const checkMap = () => {
      const map = (window as unknown as Record<string, unknown>).__mainMap as maplibregl.Map | undefined
      if (map && map !== mapRef.current) {
        mapRef.current = map
      }
    }
    checkMap()
    const interval = setInterval(checkMap, 1000)
    return () => clearInterval(interval)
  }, [])

  // Sync annotation markers with map
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.getStyle()) return

    const currentIds = new Set(annotations.map((a) => a.id))
    const existingMarkers = markersRef.current

    // Remove markers that no longer exist
    for (const [id, marker] of existingMarkers) {
      if (!currentIds.has(id)) {
        marker.remove()
        existingMarkers.delete(id)
      }
    }

    // Add or update markers
    for (const annotation of annotations) {
      const colorConfig = ANNOTATION_COLORS.find((c) => c.id === annotation.color) || ANNOTATION_COLORS[0]
      const fontSizeConfig = FONT_SIZES.find((f) => f.value === annotation.fontSize) || FONT_SIZES[1]

      // If marker already exists, update it
      const existing = existingMarkers.get(annotation.id)
      if (existing) {
        const el = existing.getElement() as HTMLElement
        const textEl = el.querySelector('.annotation-text') as HTMLElement
        if (textEl) {
          textEl.textContent = annotation.text
          textEl.style.fontSize = `${annotation.fontSize}px`
          textEl.style.color = colorConfig.value
          textEl.style.textShadow = colorConfig.shadow
        }
        existing.setLngLat([annotation.longitude, annotation.latitude])
        continue
      }

      // Create new marker
      const el = document.createElement('div')
      el.className = 'map-annotation-marker'
      el.style.position = 'relative'
      el.style.cursor = 'pointer'

      const textEl = document.createElement('div')
      textEl.className = 'annotation-text'
      textEl.textContent = annotation.text
      textEl.style.fontSize = `${annotation.fontSize}px`
      textEl.style.fontWeight = '600'
      textEl.style.color = colorConfig.value
      textEl.style.textShadow = colorConfig.shadow
      textEl.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      textEl.style.whiteSpace = 'nowrap'
      textEl.style.userSelect = 'none'
      textEl.style.lineHeight = '1.2'
      textEl.style.letterSpacing = '0.01em'
      el.appendChild(textEl)

      // Hover toolbar
      const toolbar = document.createElement('div')
      toolbar.className = 'annotation-toolbar'
      toolbar.style.cssText = 'position:absolute;top:-28px;left:50%;transform:translateX(-50%);display:none;gap:2px;background:rgba(0,0,0,0.85);border-radius:6px;padding:2px;z-index:10;'

      // Delete button
      const deleteBtn = document.createElement('button')
      deleteBtn.innerHTML = '&times;'
      deleteBtn.style.cssText = 'width:22px;height:22px;border:none;background:rgba(239,68,68,0.8);color:white;border-radius:4px;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;'
      deleteBtn.title = 'Delete annotation'
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        deleteAnnotation(annotation.id)
      })
      toolbar.appendChild(deleteBtn)

      // Color cycle button
      const colorBtn = document.createElement('button')
      colorBtn.textContent = '🎨'
      colorBtn.style.cssText = 'width:22px;height:22px;border:none;background:rgba(255,255,255,0.15);color:white;border-radius:4px;cursor:pointer;font-size:10px;display:flex;align-items:center;justify-content:center;'
      colorBtn.title = 'Change color'
      colorBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        const currentIdx = ANNOTATION_COLORS.findIndex((c) => c.id === annotation.color)
        const nextColor = ANNOTATION_COLORS[(currentIdx + 1) % ANNOTATION_COLORS.length]
        updateAnnotation(annotation.id, { color: nextColor.id })
      })
      toolbar.appendChild(colorBtn)

      // Size cycle button
      const sizeBtn = document.createElement('button')
      sizeBtn.textContent = 'Aa'
      sizeBtn.style.cssText = 'width:22px;height:22px;border:none;background:rgba(255,255,255,0.15);color:white;border-radius:4px;cursor:pointer;font-size:9px;font-weight:bold;display:flex;align-items:center;justify-content:center;'
      sizeBtn.title = 'Change size'
      sizeBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        const currentIdx = FONT_SIZES.findIndex((f) => f.value === annotation.fontSize)
        const nextSize = FONT_SIZES[(currentIdx + 1) % FONT_SIZES.length]
        updateAnnotation(annotation.id, { fontSize: nextSize.value })
      })
      toolbar.appendChild(sizeBtn)

      el.appendChild(toolbar)

      // Show/hide toolbar on hover
      el.addEventListener('mouseenter', () => {
        toolbar.style.display = 'flex'
      })
      el.addEventListener('mouseleave', () => {
        toolbar.style.display = 'none'
      })

      // Double-click to edit text
      el.addEventListener('dblclick', (e) => {
        e.stopPropagation()
        const newText = prompt('Edit annotation:', annotation.text)
        if (newText !== null && newText.trim()) {
          updateAnnotation(annotation.id, { text: newText.trim() })
        }
      })

      // Create draggable marker
      const marker = new maplibregl.Marker({
        element: el,
        draggable: true,
        anchor: 'center',
      })
        .setLngLat([annotation.longitude, annotation.latitude])
        .addTo(map)

      // Update position when drag ends
      marker.on('dragend', () => {
        const lngLat = marker.getLngLat()
        updateAnnotation(annotation.id, {
          longitude: lngLat.lng,
          latitude: lngLat.lat,
        })
      })

      existingMarkers.set(annotation.id, marker)
    }

    // Cleanup on unmount
    return () => {
      // Don't remove markers on re-render, only on unmount
    }
  }, [annotations, deleteAnnotation, updateAnnotation])

  // Cleanup all markers on unmount
  useEffect(() => {
    return () => {
      for (const [, marker] of markersRef.current) {
        marker.remove()
      }
      markersRef.current.clear()
    }
  }, [])

  return null // This component renders via maplibre markers, not React DOM
}
