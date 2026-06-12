'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { useMapStore, type MapLabel } from '@/lib/map-store'
import { Type, Trash2, Edit3, Download, Plus } from 'lucide-react'
import { toast } from 'sonner'

export function MapLabelsOverlay() {
  const mapLabels = useMapStore((s) => s.mapLabels)
  const addMapLabel = useMapStore((s) => s.addMapLabel)
  const updateMapLabel = useMapStore((s) => s.updateMapLabel)
  const removeMapLabel = useMapStore((s) => s.removeMapLabel)
  const clearMapLabels = useMapStore((s) => s.clearMapLabels)
  const mapLabelsOpen = useMapStore((s) => s.mapLabelsOpen)
  const setMapLabelsOpen = useMapStore((s) => s.setMapLabelsOpen)

  const [text, setText] = useState('Label')
  const [fontSize, setFontSize] = useState(16)
  const [color, setColor] = useState('#000000')
  const [bold, setBold] = useState(false)
  const [italic, setItalic] = useState(false)
  const [bgColor, setBgColor] = useState('#ffffff')
  const [bgOpacity, setBgOpacity] = useState(80)
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null)
  const [placingMode, setPlacingMode] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const markersRef = useRef<maplibregl.Marker[]>([])

  const selectedLabel = mapLabels.find((l) => l.id === selectedLabelId) ?? null

  // Clean up markers on unmount or when labels change
  useEffect(() => {
    if (typeof window === 'undefined') return

    const map = (window as any).__mainMap as maplibregl.Map | undefined
    if (!map) return

    // Remove old markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    // Add new markers
    mapLabels.forEach((label) => {
      const el = document.createElement('div')
      el.style.fontSize = `${label.fontSize}px`
      el.style.color = label.color
      el.style.fontWeight = label.bold ? 'bold' : 'normal'
      el.style.fontStyle = label.italic ? 'italic' : 'normal'
      el.style.backgroundColor = label.bgColor
      el.style.opacity = '1'
      el.style.padding = '2px 6px'
      el.style.borderRadius = '4px'
      el.style.cursor = 'pointer'
      el.style.whiteSpace = 'nowrap'
      el.style.userSelect = 'none'
      el.style.position = 'relative'

      // Background opacity wrapper
      const bgOverlay = document.createElement('div')
      bgOverlay.style.position = 'absolute'
      bgOverlay.style.inset = '0'
      bgOverlay.style.backgroundColor = label.bgColor
      bgOverlay.style.opacity = String(label.bgOpacity / 100)
      bgOverlay.style.borderRadius = '4px'
      bgOverlay.style.zIndex = '0'
      el.appendChild(bgOverlay)

      const textSpan = document.createElement('span')
      textSpan.style.position = 'relative'
      textSpan.style.zIndex = '1'
      textSpan.textContent = label.text
      el.appendChild(textSpan)

      if (label.id === selectedLabelId) {
        el.style.outline = '2px solid #3b82f6'
        el.style.outlineOffset = '1px'
      }

      el.addEventListener('click', (e) => {
        e.stopPropagation()
        setSelectedLabelId(label.id)
        setEditMode(true)
        setText(label.text)
        setFontSize(label.fontSize)
        setColor(label.color)
        setBold(label.bold)
        setItalic(label.italic)
        setBgColor(label.bgColor)
        setBgOpacity(label.bgOpacity)
      })

      const marker = new (window as any).maplibregl.Marker({ element: el })
        .setLngLat([label.longitude, label.latitude])
        .addTo(map)
      markersRef.current.push(marker)
    })

    return () => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
    }
  }, [mapLabels, selectedLabelId])

  // Map click handler for placing labels
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!placingMode) return

    const map = (window as any).__mainMap as maplibregl.Map | undefined
    if (!map) return

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat
      const newLabel: MapLabel = {
        id: `label-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        text,
        longitude: lng,
        latitude: lat,
        fontSize,
        color,
        bold,
        italic,
        bgColor,
        bgOpacity,
      }
      addMapLabel(newLabel)
      setPlacingMode(false)
      setSelectedLabelId(newLabel.id)
      toast.success('Label placed on map')
    }

    map.on('click', handleClick)
    map.getCanvas().style.cursor = 'crosshair'

    return () => {
      map.off('click', handleClick)
      map.getCanvas().style.cursor = ''
    }
  }, [placingMode, text, fontSize, color, bold, italic, bgColor, bgOpacity, addMapLabel])

  const handleUpdateLabel = useCallback(() => {
    if (!selectedLabelId) return
    updateMapLabel(selectedLabelId, {
      text,
      fontSize,
      color,
      bold,
      italic,
      bgColor,
      bgOpacity,
    })
    toast.success('Label updated')
  }, [selectedLabelId, text, fontSize, color, bold, italic, bgColor, bgOpacity, updateMapLabel])

  const handleDeleteLabel = useCallback((id: string) => {
    removeMapLabel(id)
    if (selectedLabelId === id) {
      setSelectedLabelId(null)
      setEditMode(false)
    }
    toast.success('Label deleted')
  }, [removeMapLabel, selectedLabelId])

  const handleExportGeoJSON = useCallback(() => {
    const geojson = {
      type: 'FeatureCollection' as const,
      features: mapLabels.map((l) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [l.longitude, l.latitude] as [number, number],
        },
        properties: {
          text: l.text,
          fontSize: l.fontSize,
          color: l.color,
          bold: l.bold,
          italic: l.italic,
          bgColor: l.bgColor,
          bgOpacity: l.bgOpacity,
        },
      })),
    }
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'map-labels.geojson'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Labels exported as GeoJSON')
  }, [mapLabels])

  const handleClearAll = useCallback(() => {
    clearMapLabels()
    setSelectedLabelId(null)
    setEditMode(false)
    toast.success('All labels cleared')
  }, [clearMapLabels])

  return (
    <Dialog open={mapLabelsOpen} onOpenChange={setMapLabelsOpen}>
      <DialogContent className="sm:max-w-[420px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Type className="h-5 w-5 text-pink-500" />
            Map Labels
          </DialogTitle>
          <DialogDescription>
            Add custom text labels to the map. Click &quot;Place on Map&quot; then click on the map to position your label.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Label properties */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Text</Label>
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter label text..."
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Font Size: {fontSize}px</Label>
              <Slider
                value={[fontSize]}
                onValueChange={(v) => setFontSize(v[0])}
                min={10}
                max={48}
                step={1}
                className="py-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Text Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-8 w-8 rounded border cursor-pointer"
                  />
                  <Input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Background</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-8 w-8 rounded border cursor-pointer"
                  />
                  <Input
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Background Opacity: {bgOpacity}%</Label>
              <Slider
                value={[bgOpacity]}
                onValueChange={(v) => setBgOpacity(v[0])}
                min={0}
                max={100}
                step={5}
                className="py-1"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant={bold ? 'default' : 'outline'}
                size="sm"
                className="h-8 px-3 text-xs font-bold"
                onClick={() => setBold(!bold)}
              >
                B
              </Button>
              <Button
                variant={italic ? 'default' : 'outline'}
                size="sm"
                className="h-8 px-3 text-xs italic"
                onClick={() => setItalic(!italic)}
              >
                I
              </Button>
            </div>

            {/* Preview */}
            <div className="border rounded-lg p-3 bg-muted/30">
              <Label className="text-xs font-medium text-muted-foreground mb-2 block">Preview</Label>
              <div
                style={{
                  fontSize: `${fontSize}px`,
                  color,
                  fontWeight: bold ? 'bold' : 'normal',
                  fontStyle: italic ? 'italic' : 'normal',
                  backgroundColor: bgColor,
                  opacity: 1,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  display: 'inline-block',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: bgColor,
                    opacity: bgOpacity / 100,
                    borderRadius: '4px',
                  }}
                />
                <span style={{ position: 'relative', zIndex: 1 }}>{text || 'Label'}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="h-8 text-xs gap-1.5 bg-pink-600 hover:bg-pink-700 text-white"
              onClick={() => {
                setPlacingMode(true)
                setEditMode(false)
                setSelectedLabelId(null)
              }}
              disabled={placingMode}
            >
              <Plus className="h-3.5 w-3.5" />
              {placingMode ? 'Click on Map...' : 'Place on Map'}
            </Button>
            {editMode && selectedLabelId && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs gap-1.5"
                onClick={handleUpdateLabel}
              >
                <Edit3 className="h-3.5 w-3.5" />
                Update Label
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5"
              onClick={handleExportGeoJSON}
              disabled={mapLabels.length === 0}
            >
              <Download className="h-3.5 w-3.5" />
              Export GeoJSON
            </Button>
          </div>

          {/* Labels list */}
          {mapLabels.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Labels ({mapLabels.length})</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs text-destructive hover:text-destructive"
                  onClick={handleClearAll}
                >
                  Clear All
                </Button>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {mapLabels.map((label) => (
                  <div
                    key={label.id}
                    className={`flex items-center justify-between gap-2 p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                      selectedLabelId === label.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-accent/50'
                    }`}
                    onClick={() => {
                      setSelectedLabelId(label.id)
                      setEditMode(true)
                      setText(label.text)
                      setFontSize(label.fontSize)
                      setColor(label.color)
                      setBold(label.bold)
                      setItalic(label.italic)
                      setBgColor(label.bgColor)
                      setBgOpacity(label.bgOpacity)
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div
                        className="w-3 h-3 rounded-sm shrink-0 border"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="truncate font-medium">{label.text}</span>
                      <span className="text-muted-foreground shrink-0">{label.fontSize}px</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteLabel(label.id)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mapLabels.length === 0 && !placingMode && (
            <div className="text-center py-6 text-muted-foreground">
              <Type className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">No labels yet. Click &quot;Place on Map&quot; to add one.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
