'use client'

import { useState, useCallback, useRef } from 'react'
import {
  Database,
  Upload,
  Download,
  FileJson,
  FileText,
  Trash2,
  AlertTriangle,
  Check,
  Loader2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  useMapStore,
  type SavedLocation,
  type MapMarker,
  type MapRoute,
  type RoutePoint,
} from '@/lib/map-store'
import { toast } from 'sonner'

type CoordFormat = 'DD' | 'DMS'

function toDMS(deg: number, isLat: boolean): string {
  const dir = isLat ? (deg >= 0 ? 'N' : 'S') : deg >= 0 ? 'E' : 'W'
  const abs = Math.abs(deg)
  const d = Math.floor(abs)
  const mf = (abs - d) * 60
  const m = Math.floor(mf)
  const s = ((mf - m) * 60).toFixed(2)
  return `${d}°${m}'${s}"${dir}`
}

function formatCoord(lat: number, lng: number, format: CoordFormat): string {
  if (format === 'DMS') return `${toDMS(lat, true)}, ${toDMS(lng, false)}`
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
}

// --- Parsers ---

interface ParsedFeature {
  type: 'marker' | 'route'
  name: string
  description?: string
  coordinates: { lat: number; lng: number }[]
  color?: string
  category?: string
  icon?: string
}

function parseGeoJSON(text: string): ParsedFeature[] {
  const geojson = JSON.parse(text)
  const features: ParsedFeature[] = []

  const processFeature = (feat: Record<string, unknown>) => {
    const geom = feat.geometry as Record<string, unknown> | undefined
    if (!geom) return
    const props = (feat.properties as Record<string, unknown>) || {}

    if (geom.type === 'Point') {
      const coords = geom.coordinates as number[]
      if (coords.length >= 2) {
        features.push({
          type: 'marker',
          name: (props.name as string) || (props.title as string) || 'Imported Point',
          description: (props.description as string) || undefined,
          coordinates: [{ lat: coords[1], lng: coords[0] }],
          color: (props.color as string) || '#ef4444',
          category: (props.category as string) || 'imported',
          icon: (props.icon as string) || 'MapPin',
        })
      }
    } else if (geom.type === 'LineString') {
      const coords = geom.coordinates as number[][]
      features.push({
        type: 'route',
        name: (props.name as string) || 'Imported Route',
        description: (props.description as string) || undefined,
        coordinates: coords.map((c) => ({ lat: c[1], lng: c[0] })),
        color: (props.color as string) || '#3b82f6',
      })
    } else if (geom.type === 'MultiPoint') {
      const coords = geom.coordinates as number[][]
      for (const c of coords) {
        features.push({
          type: 'marker',
          name: (props.name as string) || 'Imported Point',
          description: (props.description as string) || undefined,
          coordinates: [{ lat: c[1], lng: c[0] }],
          color: '#ef4444',
          category: 'imported',
        })
      }
    } else if (geom.type === 'MultiLineString') {
      const lines = geom.coordinates as number[][][]
      for (const line of lines) {
        features.push({
          type: 'route',
          name: (props.name as string) || 'Imported Route',
          coordinates: line.map((c) => ({ lat: c[1], lng: c[0] })),
          color: '#3b82f6',
        })
      }
    } else if (geom.type === 'Polygon') {
      const coords = geom.coordinates as number[][][]
      if (coords[0]) {
        features.push({
          type: 'route',
          name: (props.name as string) || 'Imported Polygon',
          coordinates: coords[0].map((c) => ({ lat: c[1], lng: c[0] })),
          color: '#22c55e',
        })
      }
    }
  }

  if (geojson.type === 'FeatureCollection' && Array.isArray(geojson.features)) {
    for (const f of geojson.features) {
      processFeature(f as Record<string, unknown>)
    }
  } else if (geojson.type === 'Feature') {
    processFeature(geojson as Record<string, unknown>)
  } else if (geojson.type === 'GeometryCollection' && Array.isArray(geojson.geometries)) {
    for (const g of geojson.geometries) {
      processFeature({ type: 'Feature', geometry: g, properties: {} })
    }
  }

  return features
}

function parseKML(text: string): ParsedFeature[] {
  const features: ParsedFeature[] = []
  const parser = new DOMParser()
  const doc = parser.parseFromString(text, 'text/xml')

  const placemarks = doc.querySelectorAll('Placemark')
  placemarks.forEach((pm) => {
    const name = pm.querySelector('name')?.textContent || 'Imported'

    const point = pm.querySelector('Point')
    if (point) {
      const coordsText = point.querySelector('coordinates')?.textContent?.trim()
      if (coordsText) {
        const parts = coordsText.split(',')
        const lng = parseFloat(parts[0])
        const lat = parseFloat(parts[1])
        if (!isNaN(lat) && !isNaN(lng)) {
          features.push({
            type: 'marker',
            name,
            coordinates: [{ lat, lng }],
            color: '#ef4444',
            category: 'imported',
          })
        }
      }
    }

    const lineString = pm.querySelector('LineString')
    if (lineString) {
      const coordsText = lineString.querySelector('coordinates')?.textContent?.trim()
      if (coordsText) {
        const coords = coordsText
          .trim()
          .split(/\s+/)
          .filter((c) => c.includes(','))
          .map((c) => {
            const parts = c.split(',')
            return { lat: parseFloat(parts[1]), lng: parseFloat(parts[0]) }
          })
          .filter((c) => !isNaN(c.lat) && !isNaN(c.lng))
        if (coords.length > 0) {
          features.push({
            type: 'route',
            name,
            coordinates: coords,
            color: '#3b82f6',
          })
        }
      }
    }

    const polygon = pm.querySelector('Polygon')
    if (polygon) {
      const coordsText = polygon
        .querySelector('outerBoundaryIs coordinates')
        ?.textContent?.trim()
      if (coordsText) {
        const coords = coordsText
          .trim()
          .split(/\s+/)
          .filter((c) => c.includes(','))
          .map((c) => {
            const parts = c.split(',')
            return { lat: parseFloat(parts[1]), lng: parseFloat(parts[0]) }
          })
          .filter((c) => !isNaN(c.lat) && !isNaN(c.lng))
        if (coords.length > 0) {
          features.push({
            type: 'route',
            name,
            coordinates: coords,
            color: '#22c55e',
          })
        }
      }
    }
  })

  return features
}

function parseGPX(text: string): ParsedFeature[] {
  const features: ParsedFeature[] = []
  const parser = new DOMParser()
  const doc = parser.parseFromString(text, 'text/xml')

  // Waypoints
  const waypoints = doc.querySelectorAll('wpt')
  waypoints.forEach((wpt) => {
    const lat = parseFloat(wpt.getAttribute('lat') || '')
    const lng = parseFloat(wpt.getAttribute('lon') || '')
    const name = wpt.querySelector('name')?.textContent || 'Waypoint'
    if (!isNaN(lat) && !isNaN(lng)) {
      features.push({
        type: 'marker',
        name,
        coordinates: [{ lat, lng }],
        color: '#ef4444',
        category: 'imported',
      })
    }
  })

  // Tracks
  const tracks = doc.querySelectorAll('trk')
  tracks.forEach((trk) => {
    const name = trk.querySelector('name')?.textContent || 'Track'
    const trksegs = trk.querySelectorAll('trkseg')
    trksegs.forEach((seg) => {
      const coords: { lat: number; lng: number }[] = []
      seg.querySelectorAll('trkpt').forEach((pt) => {
        const lat = parseFloat(pt.getAttribute('lat') || '')
        const lng = parseFloat(pt.getAttribute('lon') || '')
        if (!isNaN(lat) && !isNaN(lng)) {
          coords.push({ lat, lng })
        }
      })
      if (coords.length > 0) {
        features.push({
          type: 'route',
          name,
          coordinates: coords,
          color: '#3b82f6',
        })
      }
    })
  })

  // Routes
  const routes = doc.querySelectorAll('rte')
  routes.forEach((rte) => {
    const name = rte.querySelector('name')?.textContent || 'Route'
    const coords: { lat: number; lng: number }[] = []
    rte.querySelectorAll('rtept').forEach((pt) => {
      const lat = parseFloat(pt.getAttribute('lat') || '')
      const lng = parseFloat(pt.getAttribute('lon') || '')
      if (!isNaN(lat) && !isNaN(lng)) {
        coords.push({ lat, lng })
      }
    })
    if (coords.length > 0) {
      features.push({
        type: 'route',
        name,
        coordinates: coords,
        color: '#22c55e',
      })
    }
  })

  return features
}

function parseCSV(text: string): ParsedFeature[] {
  const features: ParsedFeature[] = []
  const lines = text.trim().split('\n')
  if (lines.length < 2) return features

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''))

  // Auto-detect lat/lng columns
  const latIdx = headers.findIndex(
    (h) =>
      h === 'lat' ||
      h === 'latitude' ||
      h === 'y' ||
      h === 'lat_deg' ||
      h === 'northing'
  )
  const lngIdx = headers.findIndex(
    (h) =>
      h === 'lng' ||
      h === 'lon' ||
      h === 'longitude' ||
      h === 'x' ||
      h === 'lng_deg' ||
      h === 'easting'
  )
  const nameIdx = headers.findIndex(
    (h) => h === 'name' || h === 'title' || h === 'label' || h === 'place'
  )
  const descIdx = headers.findIndex(
    (h) => h === 'description' || h === 'desc' || h === 'notes'
  )

  if (latIdx === -1 || lngIdx === -1) {
    // Try positional: assume first two numeric columns are lng, lat
    // or last two
    throw new Error(
      'Could not auto-detect latitude/longitude columns. Please include columns named "lat"/"latitude" and "lng"/"longitude".'
    )
  }

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim().replace(/['"]/g, ''))
    const lat = parseFloat(cols[latIdx])
    const lng = parseFloat(cols[lngIdx])
    if (isNaN(lat) || isNaN(lng)) continue
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) continue

    features.push({
      type: 'marker',
      name: nameIdx >= 0 ? cols[nameIdx] || `Point ${i}` : `Point ${i}`,
      description: descIdx >= 0 ? cols[descIdx] : undefined,
      coordinates: [{ lat, lng }],
      color: '#ef4444',
      category: 'imported',
    })
  }

  return features
}

// --- Exporters ---

function exportLocationsGeoJSON(
  locations: SavedLocation[],
  markers: MapMarker[],
  coordFormat: CoordFormat
): string {
  const features = [
    ...locations.map((loc) => ({
      type: 'Feature',
      properties: {
        name: loc.name,
        description: loc.description || '',
        category: loc.category,
        color: loc.color,
        icon: loc.icon,
        id: loc.id,
        coordFormatted: formatCoord(loc.latitude, loc.longitude, coordFormat),
      },
      geometry: { type: 'Point', coordinates: [loc.longitude, loc.latitude] },
    })),
    ...markers.map((m) => ({
      type: 'Feature',
      properties: {
        name: m.name,
        description: m.description || '',
        category: m.category,
        color: m.color,
        icon: m.icon || '',
        id: m.id,
        coordFormatted: formatCoord(m.latitude, m.longitude, coordFormat),
      },
      geometry: { type: 'Point', coordinates: [m.longitude, m.latitude] },
    })),
  ]
  return JSON.stringify({ type: 'FeatureCollection', features }, null, 2)
}

function exportRoutesGeoJSON(routes: MapRoute[]): string {
  const features = routes.map((r) => ({
    type: 'Feature',
    properties: {
      name: r.name,
      color: r.color,
      id: r.id,
      distance: r.distance,
      duration: r.duration,
    },
    geometry: {
      type: 'LineString',
      coordinates: r.points.map((p) => [p.longitude, p.latitude]),
    },
  }))
  return JSON.stringify({ type: 'FeatureCollection', features }, null, 2)
}

function exportAllGeoJSON(
  locations: SavedLocation[],
  markers: MapMarker[],
  routes: MapRoute[],
  drawings: { id: string; type: string; coordinates: number[][] | number[][][]; color: string; lineWidth: number; name?: string }[],
  coordFormat: CoordFormat
): string {
  const pointFeatures = [
    ...locations.map((loc) => ({
      type: 'Feature' as const,
      properties: {
        name: loc.name,
        description: loc.description || '',
        category: loc.category,
        color: loc.color,
        dataType: 'location',
        coordFormatted: formatCoord(loc.latitude, loc.longitude, coordFormat),
      },
      geometry: { type: 'Point' as const, coordinates: [loc.longitude, loc.latitude] },
    })),
    ...markers.map((m) => ({
      type: 'Feature' as const,
      properties: {
        name: m.name,
        description: m.description || '',
        category: m.category,
        color: m.color,
        dataType: 'marker',
        coordFormatted: formatCoord(m.latitude, m.longitude, coordFormat),
      },
      geometry: { type: 'Point' as const, coordinates: [m.longitude, m.latitude] },
    })),
  ]

  const routeFeatures = routes.map((r) => ({
    type: 'Feature' as const,
    properties: {
      name: r.name,
      color: r.color,
      dataType: 'route',
      distance: r.distance,
      duration: r.duration,
    },
    geometry: {
      type: 'LineString' as const,
      coordinates: r.points.map((p) => [p.longitude, p.latitude]),
    },
  }))

  const drawingFeatures = drawings.map((d) => ({
    type: 'Feature' as const,
    properties: {
      name: d.name || 'Drawing',
      color: d.color,
      dataType: 'drawing',
      lineWidth: d.lineWidth,
    },
    geometry: {
      type: (d.type === 'polygon' ? 'Polygon' : 'LineString') as 'Polygon' | 'LineString',
      coordinates: d.type === 'polygon' ? [d.coordinates as number[][]] : d.coordinates,
    },
  }))

  return JSON.stringify(
    {
      type: 'FeatureCollection',
      features: [...pointFeatures, ...routeFeatures, ...drawingFeatures],
    },
    null,
    2
  )
}

function exportKML(
  locations: SavedLocation[],
  markers: MapMarker[],
  routes: MapRoute[]
): string {
  let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
  <name>MapLibre Explorer Export</name>
`

  for (const loc of [...locations, ...markers]) {
    kml += `  <Placemark>
    <name>${escapeXml(loc.name)}</name>
    <Point>
      <coordinates>${loc.longitude},${loc.latitude},0</coordinates>
    </Point>
  </Placemark>
`
  }

  for (const r of routes) {
    const coords = r.points.map((p) => `${p.longitude},${p.latitude},0`).join(' ')
    kml += `  <Placemark>
    <name>${escapeXml(r.name)}</name>
    <LineString>
      <coordinates>${coords}</coordinates>
    </LineString>
  </Placemark>
`
  }

  kml += `</Document>
</kml>`
  return kml
}

function exportCSV(
  locations: SavedLocation[],
  markers: MapMarker[],
  coordFormat: CoordFormat
): string {
  let csv = 'name,description,latitude,longitude,category,color,coordinates_formatted\n'
  const all = [...locations, ...markers]
  for (const loc of all) {
    csv += `"${loc.name.replace(/"/g, '""')}","${(loc.description || '').replace(/"/g, '""')}",${loc.latitude},${loc.longitude},"${loc.category}","${loc.color}","${formatCoord(loc.latitude, loc.longitude, coordFormat)}"\n`
  }
  return csv
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function DataImportExport() {
  const importExportOpen = useMapStore((s) => s.importExportOpen)
  const setImportExportOpen = useMapStore((s) => s.setImportExportOpen)
  const importExportState = useMapStore((s) => s.importExportState)
  const setImportExportState = useMapStore((s) => s.setImportExportState)
  const savedLocations = useMapStore((s) => s.savedLocations)
  const markers = useMapStore((s) => s.markers)
  const routes = useMapStore((s) => s.routes)
  const drawings = useMapStore((s) => s.drawnFeatures)
  const addSavedLocation = useMapStore((s) => s.addSavedLocation)
  const addMarker = useMapStore((s) => s.addMarker)
  const setRoutes = useMapStore((s) => s.setRoutes)
  const setSavedLocations = useMapStore((s) => s.setSavedLocations)
  const setMarkers = useMapStore((s) => s.setMarkers)

  const [parsedFeatures, setParsedFeatures] = useState<ParsedFeature[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [coordFormat, setCoordFormat] = useState<CoordFormat>('DD')
  const [importFilter, setImportFilter] = useState<'all' | 'markers' | 'routes'>('all')
  const [clearConfirm, setClearConfirm] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback(
    async (file: File) => {
      setParseError(null)
      setParsedFeatures([])
      setImporting(true)

      try {
        const text = await file.text()
        const ext = file.name.split('.').pop()?.toLowerCase()
        let features: ParsedFeature[] = []

        if (ext === 'geojson' || ext === 'json' || ext === 'geo') {
          features = parseGeoJSON(text)
        } else if (ext === 'kml') {
          features = parseKML(text)
        } else if (ext === 'gpx') {
          features = parseGPX(text)
        } else if (ext === 'csv' || ext === 'tsv') {
          features = parseCSV(text)
        } else {
          // Try to auto-detect
          try {
            features = parseGeoJSON(text)
          } catch {
            try {
              features = parseKML(text)
            } catch {
              try {
                features = parseGPX(text)
              } catch {
                try {
                  features = parseCSV(text)
                } catch {
                  throw new Error('Unsupported file format')
                }
              }
            }
          }
        }

        if (features.length === 0) {
          setParseError('No valid features found in the file')
        } else {
          setParsedFeatures(features)
        }
      } catch (err) {
        setParseError(err instanceof Error ? err.message : 'Failed to parse file')
      } finally {
        setImporting(false)
      }
    },
    []
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleImport = useCallback(() => {
    const filtered =
      importFilter === 'all'
        ? parsedFeatures
        : parsedFeatures.filter((f) => f.type === (importFilter === 'markers' ? 'marker' : 'route'))

    let markersAdded = 0
    let routesAdded = 0

    // Track existing data for duplicate detection
    const existingLocationKeys = new Set(
      savedLocations.map((l) => `${l.latitude.toFixed(5)},${l.longitude.toFixed(5)}`)
    )
    const existingMarkerKeys = new Set(
      markers.map((m) => `${m.latitude.toFixed(5)},${m.longitude.toFixed(5)}`)
    )

    for (const feature of filtered) {
      if (feature.type === 'marker' && feature.coordinates.length > 0) {
        const c = feature.coordinates[0]
        const key = `${c.lat.toFixed(5)},${c.lng.toFixed(5)}`
        if (existingLocationKeys.has(key) || existingMarkerKeys.has(key)) continue

        const id = `import-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const location: SavedLocation = {
          id,
          name: feature.name,
          description: feature.description,
          latitude: c.lat,
          longitude: c.lng,
          category: feature.category || 'imported',
          color: feature.color || '#ef4444',
          icon: feature.icon || 'MapPin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        addSavedLocation(location)
        addMarker({
          id,
          longitude: c.lng,
          latitude: c.lat,
          name: feature.name,
          description: feature.description,
          color: feature.color || '#ef4444',
          category: feature.category || 'imported',
          icon: feature.icon,
        })
        markersAdded++
      } else if (feature.type === 'route' && feature.coordinates.length >= 2) {
        const id = `route-import-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const route: MapRoute = {
          id,
          name: feature.name,
          color: feature.color || '#3b82f6',
          points: feature.coordinates.map((c) => ({
            longitude: c.lng,
            latitude: c.lat,
          })),
          distance: null,
          duration: null,
        }
        routes.push(route)
        routesAdded++
      }
    }

    if (routesAdded > 0) {
      setRoutes([...routes])
    }

    setImportExportState({
      lastImportAt: new Date().toISOString(),
      importCount: importExportState.importCount + markersAdded + routesAdded,
    })

    toast.success(
      `Imported ${markersAdded} marker${markersAdded !== 1 ? 's' : ''}, ${routesAdded} route${routesAdded !== 1 ? 's' : ''}`
    )
    setParsedFeatures([])
  }, [
    parsedFeatures,
    importFilter,
    savedLocations,
    markers,
    routes,
    addSavedLocation,
    addMarker,
    setRoutes,
    importExportState,
    setImportExportState,
  ])

  const handleExport = useCallback(
    (type: 'locations' | 'routes' | 'all' | 'kml' | 'csv' | 'drawings') => {
      let content: string
      let filename: string
      let mimeType: string

      switch (type) {
        case 'locations':
          content = exportLocationsGeoJSON(savedLocations, markers, coordFormat)
          filename = 'locations.geojson'
          mimeType = 'application/geo+json'
          break
        case 'routes':
          content = exportRoutesGeoJSON(routes)
          filename = 'routes.geojson'
          mimeType = 'application/geo+json'
          break
        case 'all':
          content = exportAllGeoJSON(savedLocations, markers, routes, drawings, coordFormat)
          filename = 'maplibre-export.geojson'
          mimeType = 'application/geo+json'
          break
        case 'kml':
          content = exportKML(savedLocations, markers, routes)
          filename = 'export.kml'
          mimeType = 'application/vnd.google-earth.kml+xml'
          break
        case 'csv':
          content = exportCSV(savedLocations, markers, coordFormat)
          filename = 'export.csv'
          mimeType = 'text/csv'
          break
        case 'drawings':
          content = exportAllGeoJSON(savedLocations, markers, routes, drawings, coordFormat)
          filename = 'drawings-export.geojson'
          mimeType = 'application/geo+json'
          break
        default:
          return
      }

      downloadFile(content, filename, mimeType)
      setImportExportState({
        lastExportAt: new Date().toISOString(),
        exportCount: importExportState.exportCount + 1,
      })
      toast.success(`Exported ${filename}`)
    },
    [
      savedLocations,
      markers,
      routes,
      drawings,
      coordFormat,
      importExportState,
      setImportExportState,
    ]
  )

  const handleClearAll = useCallback(() => {
    setSavedLocations([])
    setMarkers([])
    setRoutes([])
    setClearConfirm(false)
    toast.success('All data cleared')
  }, [setSavedLocations, setMarkers, setRoutes])

  const totalMarkers = savedLocations.length + markers.length
  const totalRoutes = routes.length
  const totalDrawings = drawings.length

  return (
    <Dialog open={importExportOpen} onOpenChange={setImportExportOpen}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-emerald-500" />
            Data Import / Export
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="import" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="import" className="flex-1 gap-1.5">
              <Upload className="h-3.5 w-3.5" />
              Import
            </TabsTrigger>
            <TabsTrigger value="export" className="flex-1 gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Export
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex-1 gap-1.5">
              <Database className="h-3.5 w-3.5" />
              Manage
            </TabsTrigger>
          </TabsList>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-4 mt-4">
            {/* Drag & Drop zone */}
            <div
              ref={dropRef}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragOver
                  ? 'border-emerald-500 bg-emerald-500/5'
                  : 'border-border/50 hover:border-border'
              }`}
            >
              <Upload className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium">
                Drag & drop a file here, or{' '}
                <button
                  className="text-emerald-600 hover:underline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  browse
                </button>
              </p>
              <p className="text-[11px] text-muted-foreground/60 mt-1">
                Supports GeoJSON, KML, GPX, CSV
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".geojson,.json,.kml,.gpx,.csv,.tsv"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file)
                  e.target.value = ''
                }}
              />
            </div>

            {/* Loading */}
            {importing && (
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                <span className="text-sm text-muted-foreground">Parsing file...</span>
              </div>
            )}

            {/* Error */}
            {parseError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-600 dark:text-red-400">{parseError}</p>
              </div>
            )}

            {/* Preview */}
            {parsedFeatures.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Preview ({parsedFeatures.length} features)</h4>
                  <div className="flex gap-2">
                    {(['all', 'markers', 'routes'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setImportFilter(f)}
                        className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                          importFilter === f
                            ? 'bg-emerald-500 text-white'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {f === 'all' ? 'All' : f === 'markers' ? 'Markers' : 'Routes'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {parsedFeatures
                    .filter(
                      (f) =>
                        importFilter === 'all' ||
                        f.type === (importFilter === 'markers' ? 'marker' : 'route')
                    )
                    .slice(0, 50)
                    .map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 text-xs"
                      >
                        <Badge
                          variant="secondary"
                          className={`text-[9px] px-1.5 py-0 h-4 ${
                            f.type === 'marker'
                              ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          }`}
                        >
                          {f.type === 'marker' ? '📍' : '🛤️'}
                        </Badge>
                        <span className="truncate flex-1 font-medium">{f.name}</span>
                        {f.coordinates.length > 0 && (
                          <span className="text-muted-foreground shrink-0">
                            {f.coordinates[0].lat.toFixed(4)}, {f.coordinates[0].lng.toFixed(4)}
                          </span>
                        )}
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                    ))}
                  {parsedFeatures.length > 50 && (
                    <p className="text-[10px] text-muted-foreground text-center">
                      Showing 50 of {parsedFeatures.length} features
                    </p>
                  )}
                </div>

                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleImport}
                >
                  <Upload className="h-4 w-4 mr-1.5" />
                  Import {importFilter === 'all' ? parsedFeatures.length : parsedFeatures.filter((f) => f.type === (importFilter === 'markers' ? 'marker' : 'route')).length} Feature
                  {parsedFeatures.length !== 1 ? 's' : ''} (skip duplicates)
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-4 mt-4">
            {/* Coordinate format */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium">Coordinate Format:</span>
              <div className="flex gap-1.5">
                {(['DD', 'DMS'] as CoordFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setCoordFormat(fmt)}
                    className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                      coordFormat === fmt
                        ? 'bg-emerald-500 text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Export buttons grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-auto py-3 flex flex-col items-center gap-1.5 text-xs"
                onClick={() => handleExport('locations')}
                disabled={totalMarkers === 0}
              >
                <FileJson className="h-5 w-5 text-emerald-500" />
                <span className="font-medium">Locations as GeoJSON</span>
                <span className="text-muted-foreground">{totalMarkers} point{totalMarkers !== 1 ? 's' : ''}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-auto py-3 flex flex-col items-center gap-1.5 text-xs"
                onClick={() => handleExport('routes')}
                disabled={totalRoutes === 0}
              >
                <FileJson className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Routes as GeoJSON</span>
                <span className="text-muted-foreground">{totalRoutes} route{totalRoutes !== 1 ? 's' : ''}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-auto py-3 flex flex-col items-center gap-1.5 text-xs"
                onClick={() => handleExport('all')}
                disabled={totalMarkers === 0 && totalRoutes === 0 && totalDrawings === 0}
              >
                <FileJson className="h-5 w-5 text-purple-500" />
                <span className="font-medium">All Data as GeoJSON</span>
                <span className="text-muted-foreground">Complete FeatureCollection</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-auto py-3 flex flex-col items-center gap-1.5 text-xs"
                onClick={() => handleExport('kml')}
                disabled={totalMarkers === 0 && totalRoutes === 0}
              >
                <FileText className="h-5 w-5 text-amber-500" />
                <span className="font-medium">Export as KML</span>
                <span className="text-muted-foreground">Google Earth format</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-auto py-3 flex flex-col items-center gap-1.5 text-xs"
                onClick={() => handleExport('csv')}
                disabled={totalMarkers === 0}
              >
                <FileText className="h-5 w-5 text-green-500" />
                <span className="font-medium">Export as CSV</span>
                <span className="text-muted-foreground">Spreadsheet compatible</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-auto py-3 flex flex-col items-center gap-1.5 text-xs"
                onClick={() => handleExport('drawings')}
                disabled={totalDrawings === 0}
              >
                <FileJson className="h-5 w-5 text-orange-500" />
                <span className="font-medium">Drawing Features</span>
                <span className="text-muted-foreground">{totalDrawings} drawing{totalDrawings !== 1 ? 's' : ''}</span>
              </Button>
            </div>
          </TabsContent>

          {/* Manage Tab */}
          <TabsContent value="manage" className="space-y-4 mt-4">
            {/* Data counts */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-muted/30 text-center">
                <div className="text-2xl font-bold text-emerald-600">{totalMarkers}</div>
                <div className="text-[10px] text-muted-foreground font-medium">Markers</div>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 text-center">
                <div className="text-2xl font-bold text-blue-600">{totalRoutes}</div>
                <div className="text-[10px] text-muted-foreground font-medium">Routes</div>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 text-center">
                <div className="text-2xl font-bold text-orange-600">{totalDrawings}</div>
                <div className="text-[10px] text-muted-foreground font-medium">Drawings</div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-1.5 text-xs text-muted-foreground">
              {importExportState.lastImportAt && (
                <div className="flex items-center gap-1.5">
                  <Upload className="h-3 w-3" />
                  Last import: {new Date(importExportState.lastImportAt).toLocaleString()}
                </div>
              )}
              {importExportState.lastExportAt && (
                <div className="flex items-center gap-1.5">
                  <Download className="h-3 w-3" />
                  Last export: {new Date(importExportState.lastExportAt).toLocaleString()}
                </div>
              )}
              {importExportState.importCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <Database className="h-3 w-3" />
                  Total imported: {importExportState.importCount}
                </div>
              )}
              {importExportState.exportCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <FileJson className="h-3 w-3" />
                  Total exports: {importExportState.exportCount}
                </div>
              )}
            </div>

            {/* Clear all */}
            <div className="border border-red-500/20 rounded-xl p-4 space-y-2">
              <h4 className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                Danger Zone
              </h4>
              <p className="text-xs text-muted-foreground">
                This will permanently delete all saved locations, markers, and routes. This action cannot be undone.
              </p>
              {clearConfirm ? (
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={handleClearAll}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Confirm Delete All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setClearConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-500/10 border-red-500/30"
                  onClick={() => setClearConfirm(true)}
                  disabled={totalMarkers === 0 && totalRoutes === 0 && totalDrawings === 0}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear All Data
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
