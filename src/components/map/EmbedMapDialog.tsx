'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useMapStore } from '@/lib/map-store'
import { Code2, Copy, ExternalLink, Check, Eye } from 'lucide-react'
import { toast } from 'sonner'

const MAPTILER_KEY = '6UjZZVa8XEx1FBJ9ksG3'

interface EmbedMapDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmbedMapDialog({ open, onOpenChange }: EmbedMapDialogProps) {
  const center = useMapStore((s) => s.center)
  const zoom = useMapStore((s) => s.zoom)
  const currentStyle = useMapStore((s) => s.currentStyle)

  const [width, setWidth] = useState(600)
  const [height, setHeight] = useState(400)
  const [includeMarker, setIncludeMarker] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [showZoomControls, setShowZoomControls] = useState(true)
  const [showSearchBar, setShowSearchBar] = useState(false)
  const [showFullscreen, setShowFullscreen] = useState(true)
  const [copied, setCopied] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const styleUrl = useMemo(() => {
    if (darkMode) {
      return `https://api.maptiler.com/maps/dark/style.json?key=${MAPTILER_KEY}`
    }
    // Use current style if it's a maptiler style, otherwise default to streets
    if (currentStyle.provider === 'maptiler') {
      return currentStyle.url
    }
    return `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`
  }, [darkMode, currentStyle])

  const embedCode = useMemo(() => {
    const lng = center[0].toFixed(6)
    const lat = center[1].toFixed(6)
    const z = zoom.toFixed(2)

    let controlsJs = ''
    if (showZoomControls) {
      controlsJs += `\n    map.addControl(new maplibregl.NavigationControl());`
    }
    if (showFullscreen) {
      controlsJs += `\n    map.addControl(new maplibregl.FullscreenControl());`
    }

    let markerJs = ''
    if (includeMarker) {
      markerJs = `\n    new maplibregl.Marker({color: '#10b981'}).setLngLat([${lng}, ${lat}]).addTo(map);`
    }

    let searchJs = ''
    if (showSearchBar) {
      searchJs = `
    // Search bar
    const searchDiv = document.createElement('div');
    searchDiv.style.cssText = 'position:absolute;top:10px;left:10px;z-index:1;background:white;border-radius:8px;padding:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);display:flex;gap:4px;';
    const searchInput = document.createElement('input');
    searchInput.placeholder = 'Search...';
    searchInput.style.cssText = 'border:1px solid #ccc;border-radius:4px;padding:4px 8px;font-size:13px;width:180px;outline:none;';
    const searchBtn = document.createElement('button');
    searchBtn.textContent = 'Go';
    searchBtn.style.cssText = 'background:#10b981;color:white;border:none;border-radius:4px;padding:4px 12px;cursor:pointer;font-size:13px;';
    searchBtn.onclick = () => {
      const q = searchInput.value.trim();
      if (q) fetch('https://api.maptiler.com/geocoding/' + encodeURIComponent(q) + '.json?key=${MAPTILER_KEY}')
        .then(r => r.json()).then(d => { if (d.features && d.features[0]) { const c = d.features[0].center; map.flyTo({center:c,zoom:14}); } });
    };
    searchInput.onkeydown = (e) => { if (e.key === 'Enter') searchBtn.click(); };
    searchDiv.appendChild(searchInput);
    searchDiv.appendChild(searchBtn);
    document.getElementById('map').appendChild(searchDiv);`
    }

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://unpkg.com/maplibre-gl@5.0.0/dist/maplibre-gl.css" rel="stylesheet" />
  <script src="https://unpkg.com/maplibre-gl@5.0.0/dist/maplibre-gl.js"></script>
  <style>body{margin:0;padding:0;}#map{width:${width}px;height:${height}px;}</style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = new maplibregl.Map({
      container: 'map',
      style: '${styleUrl}',
      center: [${lng}, ${lat}],
      zoom: ${z}
    });${controlsJs}${markerJs}${searchJs}
  </script>
</body>
</html>`
  }, [center, zoom, styleUrl, width, height, includeMarker, showZoomControls, showFullscreen, showSearchBar])

  const iframeSrcDoc = useMemo(() => embedCode, [embedCode])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopied(true)
      toast.success('Embed code copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }, [embedCode])

  const handleOpenCodePen = useCallback(() => {
    const form = document.createElement('form')
    form.action = 'https://codepen.io/pen/define'
    form.method = 'POST'
    form.target = '_blank'
    const data = JSON.stringify({
      html: embedCode,
      title: 'Embedded MapLibre Map',
    })
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = 'data'
    input.value = data
    form.appendChild(input)
    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
    toast.success('Opening CodePen...')
  }, [embedCode])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-emerald-500" />
            Embed Map
          </DialogTitle>
          <DialogDescription>
            Generate embeddable HTML code to share the current map view on your website or blog.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview" className="gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="code" className="gap-1.5">
              <Code2 className="h-3.5 w-3.5" />
              Code
            </TabsTrigger>
            <TabsTrigger value="options" className="gap-1.5">
              Options
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-4 space-y-3">
            <div className="rounded-xl border border-border/50 overflow-hidden bg-muted/20">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 border-b border-border/50">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                </div>
                <span className="text-[11px] text-muted-foreground font-mono">
                  Embedded Map Preview ({width}×{height})
                </span>
              </div>
              <iframe
                ref={iframeRef}
                srcDoc={iframeSrcDoc}
                width={width}
                height={height}
                className="border-0"
                title="Map Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-[10px] font-mono h-5">
                {center[0].toFixed(4)}, {center[1].toFixed(4)}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-mono h-5">
                Zoom: {zoom.toFixed(1)}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-mono h-5">
                {darkMode ? 'Dark' : currentStyle.name}
              </Badge>
            </div>
          </TabsContent>

          <TabsContent value="code" className="mt-4 space-y-3">
            <div className="rounded-xl bg-gray-900 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800/80">
                <span className="text-xs text-gray-400 font-mono">embed.html</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-gray-300 hover:text-white hover:bg-gray-700"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 mr-1 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <pre className="p-4 overflow-x-auto max-h-72 text-sm text-green-400 font-mono leading-relaxed">
                <code>{embedCode}</code>
              </pre>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCopy}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleOpenCodePen}
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in CodePen
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="options" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="embed-width" className="text-xs font-medium">
                  Width (px)
                </Label>
                <Input
                  id="embed-width"
                  type="number"
                  min={200}
                  max={1920}
                  value={width}
                  onChange={(e) => setWidth(Math.max(200, Math.min(1920, parseInt(e.target.value) || 600)))}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="embed-height" className="text-xs font-medium">
                  Height (px)
                </Label>
                <Input
                  id="embed-height"
                  type="number"
                  min={150}
                  max={1080}
                  value={height}
                  onChange={(e) => setHeight(Math.max(150, Math.min(1080, parseInt(e.target.value) || 400)))}
                  className="h-9"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 rounded-lg p-2 hover:bg-accent/50 transition-colors">
                <Checkbox
                  id="embed-marker"
                  checked={includeMarker}
                  onCheckedChange={(checked) => setIncludeMarker(checked === true)}
                />
                <Label htmlFor="embed-marker" className="text-sm cursor-pointer flex-1">
                  Include center point marker
                </Label>
                <Badge variant="outline" className="text-[10px] h-5 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  Marker
                </Badge>
              </div>

              <div className="flex items-center space-x-2 rounded-lg p-2 hover:bg-accent/50 transition-colors">
                <Checkbox
                  id="embed-dark"
                  checked={darkMode}
                  onCheckedChange={(checked) => setDarkMode(checked === true)}
                />
                <Label htmlFor="embed-dark" className="text-sm cursor-pointer flex-1">
                  Use dark map style
                </Label>
                <Badge variant="outline" className="text-[10px] h-5">
                  Style
                </Badge>
              </div>

              <div className="flex items-center space-x-2 rounded-lg p-2 hover:bg-accent/50 transition-colors">
                <Checkbox
                  id="embed-zoom"
                  checked={showZoomControls}
                  onCheckedChange={(checked) => setShowZoomControls(checked === true)}
                />
                <Label htmlFor="embed-zoom" className="text-sm cursor-pointer flex-1">
                  Show zoom controls
                </Label>
              </div>

              <div className="flex items-center space-x-2 rounded-lg p-2 hover:bg-accent/50 transition-colors">
                <Checkbox
                  id="embed-search"
                  checked={showSearchBar}
                  onCheckedChange={(checked) => setShowSearchBar(checked === true)}
                />
                <Label htmlFor="embed-search" className="text-sm cursor-pointer flex-1">
                  Show search bar
                </Label>
              </div>

              <div className="flex items-center space-x-2 rounded-lg p-2 hover:bg-accent/50 transition-colors">
                <Checkbox
                  id="embed-fullscreen"
                  checked={showFullscreen}
                  onCheckedChange={(checked) => setShowFullscreen(checked === true)}
                />
                <Label htmlFor="embed-fullscreen" className="text-sm cursor-pointer flex-1">
                  Show fullscreen button
                </Label>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
