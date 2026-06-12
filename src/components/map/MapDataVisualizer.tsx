'use client'

import { useState, useCallback, useRef } from 'react'
import { useMapStore, type DataVisualization } from '@/lib/map-store'
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
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart3,
  Upload,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  Palette,
  Layers,
  FileJson,
  FileSpreadsheet,
  FileText,
  Plus,
} from 'lucide-react'

type VizType = DataVisualization['type']
type ImportFormat = 'geojson' | 'csv' | 'kml'

const VIZ_TYPES: { value: VizType; label: string }[] = [
  { value: 'choropleth', label: 'Choropleth' },
  { value: 'proportional', label: 'Proportional' },
  { value: 'heatmap', label: 'Heatmap' },
  { value: 'graduated', label: 'Graduated' },
  { value: 'categorical', label: 'Categorical' },
]

const COLOR_RAMPS: { name: string; colors: string[] }[] = [
  { name: 'Viridis', colors: ['#440154', '#31688e', '#35b779', '#fde725'] },
  { name: 'Inferno', colors: ['#160b39', '#b73779', '#fc8961', '#fcfdbf'] },
  { name: 'Plasma', colors: ['#0d0887', '#cc4778', '#f89540', '#f0f921'] },
  { name: 'Emerald', colors: ['#022c22', '#047857', '#34d399', '#d1fae5'] },
  { name: 'Violet', colors: ['#2e1065', '#7c3aed', '#c4b5fd', '#f5f3ff'] },
  { name: 'Warm', colors: ['#7c2d12', '#ea580c', '#fb923c', '#fed7aa'] },
]

const FORMAT_ICONS: Record<ImportFormat, React.ReactNode> = {
  geojson: <FileJson className="h-4 w-4" />,
  csv: <FileSpreadsheet className="h-4 w-4" />,
  kml: <FileText className="h-4 w-4" />,
}

export function MapDataVisualizer() {
  const dataVisualizer = useMapStore((s) => s.dataVisualizer)
  const setDataVisualizer = useMapStore((s) => s.setDataVisualizer)

  const [vizName, setVizName] = useState('')
  const [vizType, setVizType] = useState<VizType>('choropleth')
  const [selectedRamp, setSelectedRamp] = useState(0)
  const [opacity, setOpacity] = useState(80)
  const [classBreaks, setClassBreaks] = useState('0, 25, 50, 75, 100')
  const [fieldName, setFieldName] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeViz = dataVisualizer.visualizations.find((v) => v.id === dataVisualizer.activeVizId)

  const handleFileUpload = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        let parsed: Record<string, unknown> | null = null

        if (dataVisualizer.importFormat === 'geojson') {
          try {
            parsed = JSON.parse(text)
          } catch {
            return
          }
        } else if (dataVisualizer.importFormat === 'csv') {
          // Parse CSV lat/lng columns to GeoJSON points
          const lines = text.trim().split('\n')
          if (lines.length < 2) return
          const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
          const latIdx = headers.findIndex((h) => h === 'lat' || h === 'latitude')
          const lngIdx = headers.findIndex((h) => h === 'lng' || h === 'lon' || h === 'longitude')
          if (latIdx === -1 || lngIdx === -1) return

          const features = lines.slice(1).map((line) => {
            const vals = line.split(',').map((v) => v.trim())
            const props: Record<string, string> = {}
            headers.forEach((h, i) => {
              if (i !== latIdx && i !== lngIdx) props[h] = vals[i] || ''
            })
            return {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [parseFloat(vals[lngIdx]), parseFloat(vals[latIdx])],
              },
              properties: props,
            }
          })
          parsed = { type: 'FeatureCollection', features }
        }

        setDataVisualizer({ importedData: parsed })
      }
      reader.readAsText(file)
    },
    [dataVisualizer.importFormat, setDataVisualizer]
  )

  const addVisualization = useCallback(() => {
    if (!vizName.trim()) return
    const breaks = classBreaks
      .split(',')
      .map((b) => parseFloat(b.trim()))
      .filter((n) => !isNaN(n))

    const newViz: DataVisualization = {
      id: `viz-${Date.now()}`,
      name: vizName.trim(),
      type: vizType,
      dataSource: dataVisualizer.importedData ? 'imported' : 'manual',
      field: fieldName || 'value',
      colorRamp: COLOR_RAMPS[selectedRamp].colors,
      classBreaks: breaks,
      visible: true,
      opacity: opacity / 100,
    }

    setDataVisualizer({
      visualizations: [...dataVisualizer.visualizations, newViz],
      activeVizId: newViz.id,
      importedData: null,
    })
    setVizName('')
    setFieldName('')
  }, [
    vizName,
    vizType,
    selectedRamp,
    opacity,
    classBreaks,
    fieldName,
    dataVisualizer.importedData,
    dataVisualizer.visualizations,
    setDataVisualizer,
  ])

  const deleteVisualization = useCallback(
    (id: string) => {
      const filtered = dataVisualizer.visualizations.filter((v) => v.id !== id)
      setDataVisualizer({
        visualizations: filtered,
        activeVizId:
          dataVisualizer.activeVizId === id
            ? filtered.length > 0
              ? filtered[0].id
              : null
            : dataVisualizer.activeVizId,
      })
    },
    [dataVisualizer, setDataVisualizer]
  )

  const toggleVisibility = useCallback(
    (id: string) => {
      const updated = dataVisualizer.visualizations.map((v) =>
        v.id === id ? { ...v, visible: !v.visible } : v
      )
      setDataVisualizer({ visualizations: updated })
    },
    [dataVisualizer, setDataVisualizer]
  )

  return (
    <Dialog
      open={dataVisualizer.open}
      onOpenChange={(open) => setDataVisualizer({ open })}
    >
      <DialogContent
        className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        aria-label="Data Visualizer"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            Data Visualizer
          </DialogTitle>
          <DialogDescription>Import and visualize data on the map</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="import" className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full">
            <TabsTrigger value="import" className="flex-1">Import</TabsTrigger>
            <TabsTrigger value="visualizations" className="flex-1">Visualizations</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Format selector */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Import Format</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['geojson', 'csv', 'kml'] as ImportFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all text-sm font-medium ${
                      dataVisualizer.importFormat === fmt
                        ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white border-transparent shadow-md'
                        : 'border-border/50 hover:bg-accent/50'
                    }`}
                    onClick={() => setDataVisualizer({ importFormat: fmt })}
                  >
                    {FORMAT_ICONS[fmt]}
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Drop zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                isDragOver
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-border/50 hover:border-violet-500/30'
              }`}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragOver(true)
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragOver(false)
                const file = e.dataTransfer.files[0]
                if (file) handleFileUpload(file)
              }}
            >
              <Upload className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag & drop a file here, or
              </p>
              <Button
                variant="outline"
                size="sm"
                className="border-violet-500/30 text-violet-600 hover:bg-violet-500/10"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".geojson,.json,.csv,.kml"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file)
                }}
              />
            </div>

            {dataVisualizer.importedData && (
              <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0">
                Data imported successfully
              </Badge>
            )}

            {/* Visualization config */}
            <div className="space-y-3 p-3 rounded-xl bg-gradient-to-r from-violet-500/5 to-purple-500/5 border border-violet-500/10">
              <div>
                <Label className="text-sm mb-1.5 block">Visualization Name</Label>
                <Input
                  value={vizName}
                  onChange={(e) => setVizName(e.target.value)}
                  placeholder="My visualization"
                  className="h-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm mb-1.5 block">Type</Label>
                  <Select value={vizType} onValueChange={(v) => setVizType(v as VizType)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VIZ_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block">Field</Label>
                  <Input
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    placeholder="value"
                    className="h-9"
                  />
                </div>
              </div>

              {/* Color ramp */}
              <div>
                <Label className="text-sm mb-2 block flex items-center gap-1">
                  <Palette className="h-3 w-3" /> Color Ramp
                </Label>
                <div className="space-y-2">
                  {COLOR_RAMPS.map((ramp, i) => (
                    <button
                      key={ramp.name}
                      className={`flex items-center gap-2 p-1.5 rounded-lg w-full transition-all ${
                        selectedRamp === i
                          ? 'bg-violet-500/10 border border-violet-500/30'
                          : 'hover:bg-accent/50 border border-transparent'
                      }`}
                      onClick={() => setSelectedRamp(i)}
                    >
                      <div className="flex h-4 flex-1 rounded overflow-hidden">
                        {ramp.colors.map((c, ci) => (
                          <div key={ci} className="flex-1" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-foreground w-14 text-right">
                        {ramp.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Class breaks */}
              <div>
                <Label className="text-sm mb-1.5 block">Class Breaks (comma-separated)</Label>
                <Input
                  value={classBreaks}
                  onChange={(e) => setClassBreaks(e.target.value)}
                  className="h-9 font-mono text-xs"
                />
              </div>

              {/* Opacity */}
              <div>
                <Label className="text-sm mb-2 block">Opacity: {opacity}%</Label>
                <Slider
                  value={[opacity]}
                  min={10}
                  max={100}
                  step={5}
                  onValueChange={([v]) => setOpacity(v)}
                  className="w-full"
                />
              </div>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
              onClick={addVisualization}
              disabled={!vizName.trim()}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Visualization
            </Button>
          </TabsContent>

          <TabsContent value="visualizations" className="flex-1 overflow-y-auto space-y-3 pr-1">
            {dataVisualizer.visualizations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Layers className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No visualizations yet. Import data to create one.
                </p>
              </div>
            )}
            {dataVisualizer.visualizations.map((viz) => (
              <div
                key={viz.id}
                className={`p-3 rounded-xl border transition-all ${
                  viz.id === dataVisualizer.activeVizId
                    ? 'border-violet-500/50 bg-gradient-to-r from-violet-500/5 to-purple-500/5'
                    : 'border-border/50 hover:bg-accent/30'
                }`}
                onClick={() => setDataVisualizer({ activeVizId: viz.id })}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{viz.name}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {viz.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleVisibility(viz.id)
                      }}
                      aria-label={viz.visible ? 'Hide' : 'Show'}
                    >
                      {viz.visible ? (
                        <Eye className="h-3.5 w-3.5 text-violet-600" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteVisualization(viz.id)
                      }}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {/* Color ramp preview */}
                <div className="flex h-2 rounded-full overflow-hidden mb-1">
                  {viz.colorRamp.map((c, i) => (
                    <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>Field: {viz.field}</span>
                  <span>Opacity: {Math.round(viz.opacity * 100)}%</span>
                  <span>Source: {viz.dataSource}</span>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
