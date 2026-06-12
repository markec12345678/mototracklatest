'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore, type SVGMarkerDesign } from '@/lib/map-store'
import { PenTool, Save, Trash2, Download, Upload, Copy, Eye } from 'lucide-react'
import { toast } from 'sonner'

// ── Templates ──────────────────────────────────────

const TEMPLATES = ['pin', 'circle', 'diamond', 'square', 'star', 'arrow', 'custom'] as const
const SIZES = ['small', 'medium', 'large', 'xlarge'] as const

const SIZE_MAP: Record<string, { w: number; h: number; iconSize: number }> = {
  small: { w: 24, h: 32, iconSize: 10 },
  medium: { w: 32, h: 42, iconSize: 14 },
  large: { w: 40, h: 52, iconSize: 18 },
  xlarge: { w: 52, h: 66, iconSize: 22 },
}

const INNER_ICONS = [
  { id: 'home', label: 'Home', svg: '<path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0v-6a1 1 0 011-1h2a1 1 0 011 1v6m-6 0h6"/>' },
  { id: 'shop', label: 'Shop', svg: '<path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>' },
  { id: 'restaurant', label: 'Restaurant', svg: '<path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>' },
  { id: 'park', label: 'Park', svg: '<path d="M5 21l7-18 7 18M8 15h8"/>' },
  { id: 'hospital', label: 'Hospital', svg: '<path d="M12 8v8m-4-4h8m4 4a8 8 0 11-16 0 8 8 0 0116 0z"/>' },
  { id: 'school', label: 'School', svg: '<path d="M12 14l9-5-9-5-9 5 9 5zm0 7l-9-5m9 5v-7m0 7l9-5m0 0v-7"/>' },
  { id: 'coffee', label: 'Coffee', svg: '<path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zm3-4v3m4-3v3m4-3v3"/>' },
  { id: 'music', label: 'Music', svg: '<path d="M9 19V6l12-3v13M9 19c0 1.1-1.3 2-3 2s-3-.9-3-2 1.3-2 3-2 3 .9 3 2zm12-3c0 1.1-1.3 2-3 2s-3-.9-3-2 1.3-2 3-2 3 .9 3 2z"/>' },
  { id: 'star', label: 'Star', svg: '<path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>' },
  { id: 'heart', label: 'Heart', svg: '<path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>' },
  { id: 'flag', label: 'Flag', svg: '<path d="M3 21v-18l9 4-9 4z"/><path d="M3 7l9-4v18"/>' },
  { id: 'camera', label: 'Camera', svg: '<path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>' },
  { id: 'bike', label: 'Bike', svg: '<circle cx="5" cy="18" r="3"/><circle cx="19" cy="18" r="3"/><path d="M12 6l-4 8h8l-4-8z"/>' },
  { id: 'car', label: 'Car', svg: '<path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h8l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2M5 17a2 2 0 100 4 2 2 0 000-4zm14 0a2 2 0 100 4 2 2 0 000-4z"/>' },
  { id: 'plane', label: 'Plane', svg: '<path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>' },
  { id: 'train', label: 'Train', svg: '<rect x="4" y="3" width="16" height="14" rx="2"/><path d="M4 11h16M12 3v8M8 21l4-4 4 4"/>' },
  { id: 'wifi', label: 'WiFi', svg: '<path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01"/>' },
  { id: 'info', label: 'Info', svg: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/>' },
  { id: 'warning', label: 'Warning', svg: '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4m0 4h.01"/>' },
  { id: 'paw', label: 'Pet', svg: '<circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="4" cy="8" r="2"/><circle cx="8" cy="4" r="2"/><path d="M12 18c-3 0-5-2-5-5 0-2 3-4 5-4s5 2 5 4c0 3-2 5-5 5z"/>' },
  { id: 'tree', label: 'Tree', svg: '<path d="M12 22v-8M8 14l4-10 4 10H8z"/>' },
  { id: 'dollar', label: 'Money', svg: '<path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>' },
]

// ── SVG Generation ──────────────────────────────────────

function generateMarkerSVG(design: SVGMarkerDesign): string {
  const size = SIZE_MAP[design.size] || SIZE_MAP.medium
  const { w, h, iconSize } = size
  const cx = w / 2
  const topPad = 4

  let shapePath = ''
  let viewBox = `0 0 ${w} ${h}`

  switch (design.template) {
    case 'pin': {
      shapePath = `<path d="M${cx} ${h - 2} L${cx - size.w * 0.35} ${h * 0.38} a${w * 0.35} ${w * 0.35} 0 1 1 ${w * 0.7} 0 Z" fill="${design.fillColor}" stroke="${design.strokeColor}" stroke-width="${design.strokeWidth}" opacity="${design.opacity}"/>`
      break
    }
    case 'circle': {
      const r = Math.min(w, h - topPad) / 2 - 2
      shapePath = `<circle cx="${cx}" cy="${topPad + r}" r="${r}" fill="${design.fillColor}" stroke="${design.strokeColor}" stroke-width="${design.strokeWidth}" opacity="${design.opacity}"/>`
      break
    }
    case 'diamond': {
      const s = Math.min(w, h - topPad) / 2 - 2
      const dy = topPad + s
      shapePath = `<polygon points="${cx},${dy - s} ${cx + s},${dy} ${cx},${dy + s} ${cx - s},${dy}" fill="${design.fillColor}" stroke="${design.strokeColor}" stroke-width="${design.strokeWidth}" opacity="${design.opacity}"/>`
      break
    }
    case 'square': {
      const s = Math.min(w, h - topPad) - 4
      shapePath = `<rect x="${cx - s / 2}" y="${topPad}" width="${s}" height="${s}" rx="3" fill="${design.fillColor}" stroke="${design.strokeColor}" stroke-width="${design.strokeWidth}" opacity="${design.opacity}"/>`
      break
    }
    case 'star': {
      const r1 = Math.min(w, h - topPad) / 2 - 2
      const r2 = r1 * 0.4
      const cy = topPad + r1
      let points = ''
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? r1 : r2
        const angle = (Math.PI / 2) + (i * Math.PI) / 5
        const x = cx + r * Math.cos(angle)
        const y = cy - r * Math.sin(angle)
        points += `${x},${y} `
      }
      shapePath = `<polygon points="${points.trim()}" fill="${design.fillColor}" stroke="${design.strokeColor}" stroke-width="${design.strokeWidth}" opacity="${design.opacity}"/>`
      break
    }
    case 'arrow': {
      const s = Math.min(w, h - topPad) - 4
      shapePath = `<polygon points="${cx},${topPad} ${cx + s / 2},${topPad + s * 0.6} ${cx + s * 0.2},${topPad + s * 0.6} ${cx + s * 0.2},${topPad + s} ${cx - s * 0.2},${topPad + s} ${cx - s * 0.2},${topPad + s * 0.6} ${cx - s / 2},${topPad + s * 0.6}" fill="${design.fillColor}" stroke="${design.strokeColor}" stroke-width="${design.strokeWidth}" opacity="${design.opacity}"/>`
      break
    }
    default: { // custom - same as pin
      shapePath = `<path d="M${cx} ${h - 2} L${cx - size.w * 0.35} ${h * 0.38} a${w * 0.35} ${w * 0.35} 0 1 1 ${w * 0.7} 0 Z" fill="${design.fillColor}" stroke="${design.strokeColor}" stroke-width="${design.strokeWidth}" opacity="${design.opacity}"/>`
      break
    }
  }

  // Inner icon
  let iconSvg = ''
  if (design.innerIcon && design.innerIcon !== 'none') {
    const iconData = INNER_ICONS.find((i) => i.id === design.innerIcon)
    if (iconData) {
      const iconCy = design.template === 'pin' ? h * 0.35 : topPad + (h - topPad) / 2
      iconSvg = `<g transform="translate(${cx}, ${iconCy}) scale(${iconSize / 24})" fill="none" stroke="${design.iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconData.svg}</g>`
    }
  }

  // Label
  let labelSvg = ''
  if (design.labelText) {
    labelSvg = `<text x="${cx}" y="${h - 2}" text-anchor="middle" font-size="${design.labelFontSize}" fill="${design.iconColor}" font-weight="600">${design.labelText}</text>`
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${w}" height="${h}" style="transform:rotate(${design.rotation}deg)">${shapePath}${iconSvg}${labelSvg}</svg>`
}

// ── Default design ──────────────────────────────────────

function createDefaultDesign(): SVGMarkerDesign {
  return {
    id: `design-${Date.now()}`,
    name: 'New Marker',
    template: 'pin',
    fillColor: '#ef4444',
    strokeColor: '#991b1b',
    strokeWidth: 1.5,
    size: 'medium',
    opacity: 1,
    rotation: 0,
    innerIcon: 'none',
    iconColor: '#ffffff',
    labelText: '',
    labelFontSize: 10,
  }
}

// ── Component ──────────────────────────────────────

export function SVGMarkerDesigner() {
  const markerDesignerOpen = useMapStore((s) => s.markerDesignerOpen)
  const setMarkerDesignerOpen = useMapStore((s) => s.setMarkerDesignerOpen)
  const svgMarkerDesigns = useMapStore((s) => s.svgMarkerDesigns)
  const addSVGMarkerDesign = useMapStore((s) => s.addSVGMarkerDesign)
  const updateSVGMarkerDesign = useMapStore((s) => s.updateSVGMarkerDesign)
  const removeSVGMarkerDesign = useMapStore((s) => s.removeSVGMarkerDesign)
  const activeMarkerDesign = useMapStore((s) => s.activeMarkerDesign)
  const setActiveMarkerDesign = useMapStore((s) => s.setActiveMarkerDesign)
  const center = useMapStore((s) => s.center)

  const [currentDesign, setCurrentDesign] = useState<SVGMarkerDesign>(createDefaultDesign)
  const [previewDark, setPreviewDark] = useState(false)
  const [activeTab, setActiveTab] = useState<'design' | 'gallery'>('design')
  const [editingId, setEditingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const previewSvg = generateMarkerSVG(currentDesign)

  const handleSave = useCallback(() => {
    if (editingId) {
      updateSVGMarkerDesign(editingId, { ...currentDesign })
      setEditingId(null)
      toast.success('Marker design updated')
    } else {
      addSVGMarkerDesign({ ...currentDesign, id: `design-${Date.now()}` })
      toast.success('Marker design saved')
    }
  }, [currentDesign, editingId, addSVGMarkerDesign, updateSVGMarkerDesign])

  const handleDuplicate = useCallback((design: SVGMarkerDesign) => {
    const newDesign = { ...design, id: `design-${Date.now()}`, name: `${design.name} (copy)` }
    addSVGMarkerDesign(newDesign)
    toast.success('Marker design duplicated')
  }, [addSVGMarkerDesign])

  const handleExport = useCallback((design: SVGMarkerDesign) => {
    const svg = generateMarkerSVG(design)
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${design.name.replace(/[^a-zA-Z0-9]/g, '_')}.svg`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('SVG exported')
  }, [])

  const handleImport = useCallback(() => {
    if (typeof window === 'undefined') return
    const input = fileInputRef.current
    if (input) input.click()
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      // Basic import: create a "custom" template marker with the SVG content
      const newDesign: SVGMarkerDesign = {
        id: `design-${Date.now()}`,
        name: file.name.replace('.svg', ''),
        template: 'custom',
        fillColor: '#ef4444',
        strokeColor: '#991b1b',
        strokeWidth: 1,
        size: 'medium',
        opacity: 1,
        rotation: 0,
        innerIcon: 'none',
        iconColor: '#ffffff',
        labelText: '',
        labelFontSize: 10,
      }
      addSVGMarkerDesign(newDesign)
      toast.success('SVG marker imported')
    }
    reader.readAsText(file)
    // Reset input
    e.target.value = ''
  }, [addSVGMarkerDesign])

  const handlePreviewOnMap = useCallback(() => {
    if (typeof window === 'undefined') return
    const map = (window as any).__mainMap
    if (!map) return

    const sourceId = 'svg-marker-preview'
    const svg = generateMarkerSVG(currentDesign)
    const encoded = btoa(svg)
    const dataUrl = `data:image/svg+xml;base64,${encoded}`

    const [lng, lat] = center

    if (!map.getImage('preview-marker-img')) {
      map.loadImage(dataUrl, (err: any, img: any) => {
        if (err || !img) return
        if (map.getImage('preview-marker-img')) {
          map.updateImage('preview-marker-img', img)
        } else {
          map.addImage('preview-marker-img', img)
        }

        if (!map.getSource(sourceId)) {
          map.addSource(sourceId, {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [{
                type: 'Feature',
                properties: {},
                geometry: { type: 'Point', coordinates: [lng, lat] },
              }],
            },
          })
        } else {
          (map.getSource(sourceId) as any).setData({
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              properties: {},
              geometry: { type: 'Point', coordinates: [lng, lat] },
            }],
          })
        }

        if (!map.getLayer('preview-marker-layer')) {
          map.addLayer({
            id: 'preview-marker-layer',
            type: 'symbol',
            source: sourceId,
            layout: {
              'icon-image': 'preview-marker-img',
              'icon-size': 1,
              'icon-anchor': 'bottom',
            },
          })
        }
      })
    } else {
      // Update existing
      map.loadImage(dataUrl, (err: any, img: any) => {
        if (err || !img) return
        map.updateImage('preview-marker-img', img)
        if (map.getSource(sourceId)) {
          (map.getSource(sourceId) as any).setData({
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              properties: {},
              geometry: { type: 'Point', coordinates: [lng, lat] },
            }],
          })
        }
      })
    }
    toast.success('Marker preview placed on map')
  }, [currentDesign, center])

  const handleEditDesign = useCallback((design: SVGMarkerDesign) => {
    setCurrentDesign({ ...design })
    setEditingId(design.id)
    setActiveTab('design')
  }, [])

  const handleSetActive = useCallback((id: string) => {
    setActiveMarkerDesign(activeMarkerDesign === id ? null : id)
  }, [activeMarkerDesign, setActiveMarkerDesign])

  const updateField = useCallback(<K extends keyof SVGMarkerDesign>(key: K, value: SVGMarkerDesign[K]) => {
    setCurrentDesign((prev) => ({ ...prev, [key]: value }))
  }, [])

  return (
    <Dialog open={markerDesignerOpen} onOpenChange={setMarkerDesignerOpen}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5 text-violet-500" />
            SVG Marker Designer
          </DialogTitle>
          <DialogDescription>
            Design custom SVG markers for map pins
          </DialogDescription>
        </DialogHeader>

        {/* Tab switch */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          <Button
            size="sm"
            variant={activeTab === 'design' ? 'default' : 'ghost'}
            className="flex-1 h-8 text-xs"
            onClick={() => setActiveTab('design')}
          >
            <PenTool className="h-3 w-3 mr-1" />
            Design
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'gallery' ? 'default' : 'ghost'}
            className="flex-1 h-8 text-xs"
            onClick={() => setActiveTab('gallery')}
          >
            <Eye className="h-3 w-3 mr-1" />
            Gallery ({svgMarkerDesigns.length})
          </Button>
        </div>

        {activeTab === 'design' ? (
          <div className="space-y-4">
            {/* Live Preview */}
            <div className="flex items-center justify-center gap-4">
              <div
                className={`w-28 h-28 rounded-xl border-2 border-dashed flex items-center justify-center transition-colors ${previewDark ? 'bg-slate-900 border-slate-600' : 'bg-white border-slate-300'}`}
              >
                <div dangerouslySetInnerHTML={{ __html: previewSvg }} />
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => setPreviewDark(!previewDark)}
                >
                  {previewDark ? '☀️ Light BG' : '🌙 Dark BG'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={handlePreviewOnMap}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  On Map
                </Button>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Name</Label>
              <Input
                value={currentDesign.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="h-8 text-sm"
              />
            </div>

            {/* Template */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Template</Label>
              <Select value={currentDesign.template} onValueChange={(v) => updateField('template', v)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Fill Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentDesign.fillColor}
                    onChange={(e) => updateField('fillColor', e.target.value)}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                  <Input
                    value={currentDesign.fillColor}
                    onChange={(e) => updateField('fillColor', e.target.value)}
                    className="h-8 text-sm flex-1"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Stroke Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentDesign.strokeColor}
                    onChange={(e) => updateField('strokeColor', e.target.value)}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                  <Input
                    value={currentDesign.strokeColor}
                    onChange={(e) => updateField('strokeColor', e.target.value)}
                    className="h-8 text-sm flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Stroke Width & Size */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Stroke Width: {currentDesign.strokeWidth}</Label>
                <Slider
                  value={[currentDesign.strokeWidth]}
                  onValueChange={([v]) => updateField('strokeWidth', v)}
                  min={0}
                  max={5}
                  step={0.5}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Size</Label>
                <Select value={currentDesign.size} onValueChange={(v) => updateField('size', v)}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Opacity & Rotation */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Opacity: {currentDesign.opacity.toFixed(2)}</Label>
                <Slider
                  value={[currentDesign.opacity]}
                  onValueChange={([v]) => updateField('opacity', v)}
                  min={0.1}
                  max={1}
                  step={0.05}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Rotation: {currentDesign.rotation}°</Label>
                <Slider
                  value={[currentDesign.rotation]}
                  onValueChange={([v]) => updateField('rotation', v)}
                  min={-180}
                  max={180}
                  step={5}
                />
              </div>
            </div>

            {/* Inner Icon */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Inner Icon</Label>
              <Select value={currentDesign.innerIcon} onValueChange={(v) => updateField('innerIcon', v)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  <SelectItem value="none">None</SelectItem>
                  {INNER_ICONS.map((icon) => (
                    <SelectItem key={icon.id} value={icon.id}>
                      {icon.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Icon Color */}
            {currentDesign.innerIcon !== 'none' && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Icon Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentDesign.iconColor}
                    onChange={(e) => updateField('iconColor', e.target.value)}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                  <Input
                    value={currentDesign.iconColor}
                    onChange={(e) => updateField('iconColor', e.target.value)}
                    className="h-8 text-sm flex-1"
                  />
                </div>
              </div>
            )}

            {/* Label */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Label Text</Label>
                <Input
                  value={currentDesign.labelText}
                  onChange={(e) => updateField('labelText', e.target.value)}
                  placeholder="Label..."
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Label Font Size: {currentDesign.labelFontSize}</Label>
                <Slider
                  value={[currentDesign.labelFontSize]}
                  onValueChange={([v]) => updateField('labelFontSize', v)}
                  min={6}
                  max={20}
                  step={1}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                className="flex-1 h-9 text-xs gap-1"
                onClick={handleSave}
              >
                <Save className="h-3 w-3" />
                {editingId ? 'Update Design' : 'Save Design'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9 text-xs gap-1"
                onClick={() => handleExport(currentDesign)}
              >
                <Download className="h-3 w-3" />
                Export
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9 text-xs gap-1"
                onClick={handleImport}
              >
                <Upload className="h-3 w-3" />
                Import
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {editingId && (
              <Button
                size="sm"
                variant="ghost"
                className="w-full h-8 text-xs"
                onClick={() => {
                  setEditingId(null)
                  setCurrentDesign(createDefaultDesign())
                }}
              >
                Cancel Editing
              </Button>
            )}
          </div>
        ) : (
          /* Gallery Tab */
          <div className="space-y-3">
            {svgMarkerDesigns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No saved marker designs yet.
                <br />
                Create one in the Design tab.
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                {svgMarkerDesigns.map((design) => {
                  const svg = generateMarkerSVG(design)
                  const isActive = activeMarkerDesign === design.id
                  return (
                    <div
                      key={design.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${isActive ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent/50'}`}
                      onClick={() => handleSetActive(design.id)}
                    >
                      <div className="w-10 h-10 flex items-center justify-center bg-white rounded-md border shrink-0">
                        <div dangerouslySetInnerHTML={{ __html: svg }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{design.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {design.template} · {design.size} · {design.fillColor}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={(e) => { e.stopPropagation(); handleEditDesign(design) }}
                          title="Edit"
                        >
                          <PenTool className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={(e) => { e.stopPropagation(); handleDuplicate(design) }}
                          title="Duplicate"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={(e) => { e.stopPropagation(); handleExport(design) }}
                          title="Export"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={(e) => { e.stopPropagation(); removeSVGMarkerDesign(design.id) }}
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {activeMarkerDesign && (
              <div className="p-2 rounded-lg bg-primary/10 text-xs text-center">
                Active marker set. New markers will use this design.
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
