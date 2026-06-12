'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useMapStore } from '@/lib/map-store'
import {
  CheckCircle2,
  XCircle,
  Upload,
  Link,
  FileCode2,
  Plus,
  Trash2,
  Download,
  AlignLeft,
  Code2,
  MapPin,
} from 'lucide-react'
import { toast } from 'sonner'

interface GeoJSONEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SAMPLE_TEMPLATES: Record<string, { label: string; geojson: string }> = {
  point: {
    label: 'Point',
    geojson: JSON.stringify(
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [14.5058, 46.0569],
        },
        properties: {
          name: 'Sample Point',
        },
      },
      null,
      2
    ),
  },
  linestring: {
    label: 'LineString',
    geojson: JSON.stringify(
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [14.5058, 46.0569],
            [14.5158, 46.0669],
            [14.5258, 46.0569],
          ],
        },
        properties: {
          name: 'Sample Line',
        },
      },
      null,
      2
    ),
  },
  polygon: {
    label: 'Polygon',
    geojson: JSON.stringify(
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [14.4958, 46.0469],
              [14.5158, 46.0469],
              [14.5158, 46.0669],
              [14.4958, 46.0669],
              [14.4958, 46.0469],
            ],
          ],
        },
        properties: {
          name: 'Sample Polygon',
        },
      },
      null,
      2
    ),
  },
  featurecollection: {
    label: 'FeatureCollection',
    geojson: JSON.stringify(
      {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [14.5058, 46.0569],
            },
            properties: { name: 'Point Feature', marker: true },
          },
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [
                [14.4958, 46.0469],
                [14.5158, 46.0669],
              ],
            },
            properties: { name: 'Line Feature' },
          },
        ],
      },
      null,
      2
    ),
  },
}

function validateGeoJSON(text: string): { valid: boolean; error: string | null; type: string | null } {
  if (!text.trim()) {
    return { valid: false, error: 'Empty input', type: null }
  }
  try {
    const parsed = JSON.parse(text)
    // Check for GeoJSON structure
    if (!parsed.type) {
      return { valid: false, error: 'Missing "type" property', type: null }
    }
    const validTypes = [
      'Feature',
      'FeatureCollection',
      'Point',
      'MultiPoint',
      'LineString',
      'MultiLineString',
      'Polygon',
      'MultiPolygon',
      'GeometryCollection',
    ]
    if (!validTypes.includes(parsed.type)) {
      return { valid: false, error: `Invalid GeoJSON type: "${parsed.type}"`, type: null }
    }
    // Validate geometry if it's a Feature
    if (parsed.type === 'Feature') {
      if (!parsed.geometry || !parsed.geometry.type || !parsed.geometry.coordinates) {
        return { valid: false, error: 'Feature must have "geometry" with "type" and "coordinates"', type: parsed.type }
      }
    }
    // Validate features array for FeatureCollection
    if (parsed.type === 'FeatureCollection') {
      if (!Array.isArray(parsed.features)) {
        return { valid: false, error: 'FeatureCollection must have "features" array', type: parsed.type }
      }
    }
    return { valid: true, error: null, type: parsed.type }
  } catch (e) {
    return { valid: false, error: `JSON parse error: ${(e as Error).message}`, type: null }
  }
}

export function GeoJSONEditor({ open, onOpenChange }: GeoJSONEditorProps) {
  const [geoJsonText, setGeoJsonText] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [isOnMap, setIsOnMap] = useState(false)
  const [importMethod, setImportMethod] = useState<'paste' | 'upload' | 'url'>('paste')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const customGeoJson = useMapStore((s) => s.customGeoJson)
  const setCustomGeoJson = useMapStore((s) => s.setCustomGeoJson)
  const markers = useMapStore((s) => s.markers)
  const routes = useMapStore((s) => s.routes)

  // Initialize from store if exists
  useEffect(() => {
    if (open && customGeoJson) {
      setGeoJsonText(customGeoJson)
    }
  }, [open, customGeoJson])

  const validation = useMemo(() => validateGeoJSON(geoJsonText), [geoJsonText])

  const lineCount = useMemo(() => {
    if (!geoJsonText) return 0
    return geoJsonText.split('\n').length
  }, [geoJsonText])

  const handleTemplateSelect = useCallback((templateKey: string) => {
    const template = SAMPLE_TEMPLATES[templateKey]
    if (template) {
      // Replace coordinates with current map center
      const center = useMapStore.getState().center
      const templateGeojson = template.geojson.replace(
        /\[14\.\d+,\s*46\.\d+\]/g,
        `[${center[0].toFixed(4)}, ${center[1].toFixed(4)}]`
      )
      setGeoJsonText(templateGeojson)
      toast.success(`Loaded ${template.label} template`)
    }
  }, [])

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.geojson') && !file.name.endsWith('.json')) {
      toast.error('Please upload a .geojson or .json file')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setGeoJsonText(text)
      toast.success(`Loaded ${file.name}`)
    }
    reader.readAsText(file)
  }, [])

  const handleUrlLoad = useCallback(async () => {
    if (!urlInput.trim()) {
      toast.error('Please enter a URL')
      return
    }
    try {
      const response = await fetch(urlInput)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const text = await response.text()
      setGeoJsonText(text)
      toast.success('Loaded GeoJSON from URL')
    } catch (err) {
      toast.error(`Failed to load: ${(err as Error).message}`)
    }
  }, [urlInput])

  const handleFormat = useCallback(() => {
    try {
      const parsed = JSON.parse(geoJsonText)
      setGeoJsonText(JSON.stringify(parsed, null, 2))
      toast.success('GeoJSON formatted')
    } catch {
      toast.error('Cannot format: invalid JSON')
    }
  }, [geoJsonText])

  const handleAddToMap = useCallback(() => {
    if (!validation.valid) {
      toast.error('Cannot add invalid GeoJSON to map')
      return
    }

    try {
      const parsedGeoJson = JSON.parse(geoJsonText)
       
      const map = (window as any).__mainMap
      if (!map) {
        toast.error('Map not available')
        return
      }

      // Remove existing custom-geojson source/layers if present
      if (map.getSource('custom-geojson')) {
         
        const style = map.getStyle() as any
        if (style?.layers) {
          style.layers.forEach((layer: { id: string }) => {
            if (layer.id.startsWith('custom-geojson-')) {
              map.removeLayer(layer.id)
            }
          })
        }
        map.removeSource('custom-geojson')
      }

      // Add source
      map.addSource('custom-geojson', {
        type: 'geojson',
        data: parsedGeoJson,
      })

      // Determine geometry types and add layers
      const geometries = new Set<string>()

      function collectGeometries(geojson: Record<string, unknown>) {
        if (geojson.type === 'FeatureCollection' && Array.isArray(geojson.features)) {
          (geojson.features as Record<string, unknown>[]).forEach((f) => collectGeometries(f))
        } else if (geojson.type === 'Feature' && geojson.geometry) {
          geometries.add((geojson.geometry as Record<string, unknown>).type as string)
        } else if (geojson.coordinates) {
          geometries.add(geojson.type as string)
        } else if (geojson.type === 'GeometryCollection' && Array.isArray(geojson.geometries)) {
          (geojson.geometries as Record<string, unknown>[]).forEach((g) => geometries.add(g.type as string))
        }
      }

      collectGeometries(parsedGeoJson)

      const pointTypes = ['Point', 'MultiPoint']
      const lineTypes = ['LineString', 'MultiLineString']
      const polyTypes = ['Polygon', 'MultiPolygon']

      if (geometries.intersection(pointTypes).size > 0 || geometries.size === 0) {
        map.addLayer({
          id: 'custom-geojson-points',
          type: 'circle',
          source: 'custom-geojson',
          filter: ['any', ['==', '$type', 'Point']],
          paint: {
            'circle-radius': 7,
            'circle-color': '#10b981',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
        })
      }

      if (geometries.intersection(lineTypes).size > 0) {
        map.addLayer({
          id: 'custom-geojson-lines',
          type: 'line',
          source: 'custom-geojson',
          filter: ['any', ['==', '$type', 'LineString']],
          paint: {
            'line-color': '#10b981',
            'line-width': 3,
            'line-opacity': 0.8,
          },
        })
      }

      if (geometries.intersection(polyTypes).size > 0) {
        map.addLayer({
          id: 'custom-geojson-polygon-fill',
          type: 'fill',
          source: 'custom-geojson',
          filter: ['any', ['==', '$type', 'Polygon']],
          paint: {
            'fill-color': '#10b981',
            'fill-opacity': 0.2,
          },
        })
        map.addLayer({
          id: 'custom-geojson-polygon-outline',
          type: 'line',
          source: 'custom-geojson',
          filter: ['any', ['==', '$type', 'Polygon']],
          paint: {
            'line-color': '#10b981',
            'line-width': 2,
          },
        })
      }

      setCustomGeoJson(geoJsonText)
      setIsOnMap(true)
      toast.success('GeoJSON added to map')
    } catch (err) {
      toast.error(`Failed to add: ${(err as Error).message}`)
    }
  }, [geoJsonText, validation, setCustomGeoJson])

  const handleRemoveFromMap = useCallback(() => {
     
    const map = (window as any).__mainMap
    if (!map) return

    try {
      if (map.getSource('custom-geojson')) {
         
        const style = map.getStyle() as any
        if (style?.layers) {
          style.layers.forEach((layer: { id: string }) => {
            if (layer.id.startsWith('custom-geojson-')) {
              map.removeLayer(layer.id)
            }
          })
        }
        map.removeSource('custom-geojson')
      }
      setIsOnMap(false)
      toast.success('GeoJSON removed from map')
    } catch (err) {
      toast.error(`Failed to remove: ${(err as Error).message}`)
    }
  }, [])

  const handleExportCurrent = useCallback(() => {
     
    const features: any[] = []

    // Export markers as Point features
    markers.forEach((m) => {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [m.longitude, m.latitude],
        },
        properties: {
          name: m.name,
          category: m.category,
          color: m.color,
          description: m.description || '',
        },
      })
    })

    // Export routes as LineString features
    routes.forEach((r) => {
      if (r.points.length > 1) {
        features.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: r.points.map((p) => [p.longitude, p.latitude]),
          },
          properties: {
            name: r.name,
            color: r.color,
            distance: r.distance,
            duration: r.duration,
          },
        })
      }
    })

    const geojson = {
      type: 'FeatureCollection',
      features,
    }

    const text = JSON.stringify(geojson, null, 2)
    setGeoJsonText(text)

    // Also download as file
    const blob = new Blob([text], { type: 'application/geo+json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'maplibre-export.geojson'
    a.click()
    URL.revokeObjectURL(url)

    toast.success(`Exported ${features.length} features`)
  }, [markers, routes])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCode2 className="h-5 w-5 text-teal-500" />
            GeoJSON Editor
          </DialogTitle>
          <DialogDescription>
            Import, edit, and visualize GeoJSON data on the map.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Import method selection */}
          <div className="flex items-center gap-2">
            <Label className="text-xs font-medium text-muted-foreground shrink-0">Import:</Label>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={importMethod === 'paste' ? 'default' : 'outline'}
                className={`h-7 text-xs ${importMethod === 'paste' ? 'bg-teal-600 hover:bg-teal-700 text-white' : ''}`}
                onClick={() => setImportMethod('paste')}
              >
                <AlignLeft className="h-3 w-3 mr-1" />
                Paste
              </Button>
              <Button
                size="sm"
                variant={importMethod === 'upload' ? 'default' : 'outline'}
                className={`h-7 text-xs ${importMethod === 'upload' ? 'bg-teal-600 hover:bg-teal-700 text-white' : ''}`}
                onClick={() => setImportMethod('upload')}
              >
                <Upload className="h-3 w-3 mr-1" />
                Upload
              </Button>
              <Button
                size="sm"
                variant={importMethod === 'url' ? 'default' : 'outline'}
                className={`h-7 text-xs ${importMethod === 'url' ? 'bg-teal-600 hover:bg-teal-700 text-white' : ''}`}
                onClick={() => setImportMethod('url')}
              >
                <Link className="h-3 w-3 mr-1" />
                URL
              </Button>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Label className="text-xs font-medium text-muted-foreground shrink-0">Template:</Label>
              <Select onValueChange={handleTemplateSelect}>
                <SelectTrigger className="h-7 w-36 text-xs">
                  <SelectValue placeholder="Choose..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SAMPLE_TEMPLATES).map(([key, template]) => (
                    <SelectItem key={key} value={key}>
                      {template.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Upload / URL UI */}
          {importMethod === 'upload' && (
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".geojson,.json"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-3 w-3 mr-1" />
                Choose File
              </Button>
              <span className="text-xs text-muted-foreground">
                Upload .geojson or .json files
              </span>
            </div>
          )}

          {importMethod === 'url' && (
            <div className="flex items-center gap-2">
              <Input
                placeholder="https://example.com/data.geojson"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="h-8 text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs shrink-0"
                onClick={handleUrlLoad}
              >
                Load
              </Button>
            </div>
          )}

          {/* Code editor area */}
          <div className="relative">
            <div className="rounded-xl overflow-hidden border border-border/50">
              <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <Code2 className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-[11px] text-gray-400 font-mono">geojson</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Validation status */}
                  {validation.valid ? (
                    <Badge className="text-[10px] h-5 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Valid
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-[10px] h-5">
                      <XCircle className="h-3 w-3 mr-1" />
                      Invalid
                    </Badge>
                  )}
                  {validation.type && (
                    <Badge variant="outline" className="text-[10px] h-5 font-mono">
                      {validation.type}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px] h-5 font-mono">
                    {lineCount} lines
                  </Badge>
                </div>
              </div>
              <Textarea
                value={geoJsonText}
                onChange={(e) => setGeoJsonText(e.target.value)}
                className="bg-gray-900 text-green-400 font-mono text-xs leading-relaxed border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[250px] max-h-[400px] resize-y placeholder:text-gray-600"
                placeholder='{\n  "type": "Feature",\n  "geometry": {\n    "type": "Point",\n    "coordinates": [0, 0]\n  },\n  "properties": {}\n}'
              />
              {validation.error && (
                <div className="px-3 py-2 bg-red-950/50 border-t border-red-900/30 text-xs text-red-400">
                  {validation.error}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={handleFormat}
              disabled={!geoJsonText.trim()}
            >
              <AlignLeft className="h-3 w-3 mr-1" />
              Format
            </Button>

            {isOnMap ? (
              <Button
                size="sm"
                variant="destructive"
                className="h-8 text-xs"
                onClick={handleRemoveFromMap}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Remove from Map
              </Button>
            ) : (
              <Button
                size="sm"
                className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white"
                onClick={handleAddToMap}
                disabled={!validation.valid || !geoJsonText.trim()}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add to Map
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={handleExportCurrent}
            >
              <Download className="h-3 w-3 mr-1" />
              Export Current
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => {
                setGeoJsonText('')
                setIsOnMap(false)
              }}
            >
              <MapPin className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
