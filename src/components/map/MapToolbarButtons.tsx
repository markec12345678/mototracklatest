'use client'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useMapStore } from '@/lib/map-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { LazyPanel } from '@/components/LazyPanel'
import {
  GitCompare,
  GitBranch,
  Save,
  LocateFixed,
  Minimize2,
  Maximize2,
  Globe2,
  Keyboard,
  Camera,
  Printer,
  Share2,
  Share,
  Code2,
  Play,
  Gauge,
  BarChart3,
  Wind,
  Activity,
  MapPin,
  BellRing,
  Tag,
  Palette,
  Type,
  Mountain,
  Boxes,
  BookOpen,
  Database,
  MapPinned,
  Calendar,
  Thermometer,
  Triangle,
  TreePine,
  PieChart,
  Image as ImageIcon,
  TrendingUp,
  LayoutGrid,
  CalendarDays,
  ArrowUpFromLine,
  Compass,
  Container,
  Waypoints,
  CloudSun,
  MessageCircle,
  QrCode,
  Monitor,
  Clapperboard,
  Route,
  BarChart2,
  ClipboardCheck,
  ShieldAlert,
  SplitSquareHorizontal,
  Volume2,
  Sun,
  Hammer,
  Mountain as MountainIcon,
  Anchor,
  Map,
  CloudCog,
  Bird,
  Landmark,
  Droplets,
  Activity as ActivityIcon,
  Sprout,
  Building2,
  Plane,
  Waves,
  Magnet,
  Droplet,
  Flame,
  Snowflake as SnowflakeIcon,
  Wheat,
  Satellite,
  Pyramid,
  Factory,
  Ship,
  Zap,
  Sun as SunIcon,
  Gem,
  Fish,
  ThermometerSnowflake,
  CloudLightning,
  Leaf,
  Droplet as DropletIcon,
  Sun as SunIcon3,
  CloudHail,
  Waves as WavesIcon,
  CloudCog as CloudSmoke,
  Bird as BirdIcon,
  MountainSnow,
  ThermometerSun,
  ArrowDownFromLine,
  Shell,
  Siren,
  CloudRain,
  Cloud as CloudIcon,
  Droplets as DropletsIcon,
  Globe as GlobeIcon,
  Wind as WindIcon,
  Snowflake as SnowflakeIcon2,
  Radio,
  TreeDeciduous,
  Flame as FlameIcon,
  Ship as ShipIcon,
  Moon as MoonIcon,
  Sparkles as SparklesIcon,
  Globe2 as Globe2Icon2,
  Wind as WindIcon2,
  Sparkles as SparklesIcon2,
  Building2 as Building2Icon,
  Bug,
  Magnet as MagnetIcon2,
  CloudFog,
  Factory as FactoryIcon2,
  CloudHail as CloudHailIcon,
  TreePine as TreePineIcon2,
  Flame as FlameIcon2,
  Waves as WavesIcon2,
  Trash2,
  Droplets as DropletsIcon2,
  Search as SearchIcon2,
  Radio as RadioIcon2,
  Mountain as MountainIcon2,
  Waves as WavesIcon3,
  Sun as SunIcon2,
  Activity as ActivityIcon2,
  TreeDeciduous as TreeDeciduousIcon2,
  Eye as EyeIcon2,
  Drill as DrillIcon,
  Volume2 as Volume2Icon,
  Wind as WindIcon3,
  Fish as FishIcon2,
  Clock,
  Github,
  SunDim,
  // Task 68 icons
  Flame as FlameIcon3,
  Wind as WindIcon4,
  Droplets as DropletsIcon3,
  Layers as LayersIcon2,
  ArrowUpFromLine as ArrowUpIcon2,
  Bug as BugIcon2,
  TreeDeciduous as TreeDeciduousIcon3,
  CloudRain as CloudRainIcon2,
  // Task 69 icons
  Flame as FlameIcon4,
  Waves as WavesIcon5,
  Flame as FlameIcon5,
  Sparkles as SparklesIcon4,
  Mountain as MountainIcon4,
  Sprout as SproutIcon2,
  TreePine as TreePineIcon4,
  Compass as CompassIcon3,
  // Task 70 icons
  Flame as FlameIcon6,
  Droplets as DropletsIcon4,
  Bird as BirdIcon3,
  Leaf as LeafIcon4,
  Thermometer as ThermometerIcon4,
  FlaskConical as FlaskConicalIcon,
  Sun as SunIcon4,
  CloudLightning as CloudLightningIcon,
  // Task 71 icons
  Anchor as AnchorIcon2,
  Shield,
  Activity as ActivityIcon3,
  CloudFog as CloudFogIcon2,
  Waves as WavesIcon7,
  MountainSnow as MountainSnowIcon2,
  Droplets as DropletsIcon5,
  Thermometer as ThermometerIcon5,
  // Task 72 icons
  CloudHail as CloudHailIcon2,
  Move as MoveIcon,
  Shell as ShellIcon2,
  Snowflake as SnowflakeIcon3,
  Flame as FlameIcon7,
  Waves as WavesIcon8,
  Orbit as OrbitIcon,
  Globe as GlobeIcon3,
  // Task 73 icons
  Triangle as TriangleIcon2,
  Sun as SunIcon5,
  Droplets as DropletsIcon6,
  Snowflake as SnowflakeIcon4,
  Wind as WindIcon6,
  Zap as ZapIcon2,
  Droplet as DropletIcon3,
  Flame as FlameIcon8,
  // Task 74 icons
  AlertTriangle as AlertTriangleIcon,
  CircleDot as CircleDotIcon,
  Cloud as CloudIcon3,
  Sun as SunIcon6,
  Waves as WavesIcon9,
  Mountain as MountainIcon6,
  Sun as SunIcon7,
  Sprout as SproutIcon3,
  // Task 75 icons
  TreePine as TreePineIcon5,
  Thermometer as ThermometerIcon6,
  Wind as WindIcon7,
  Bug as BugIcon3,
  Layers as LayersIcon3,
  Droplets as DropletsIcon7,
  Leaf as LeafIcon5,
  ArrowDown as ArrowDownIcon,
  // Task 76 icons
  Fish as FishIcon3,
  Mountain as MountainIcon7,
  Droplet as DropletIcon4,
  Ship as ShipIcon3,
  ArrowDown as ArrowDownIcon2,
  Sparkles as SparklesIcon5,
  CloudRain as CloudRainIcon3,
  Flame as FlameIcon9,
  // Task 77 icons
  Mountain as MountainIcon8,
  ArrowDown as ArrowDownIcon3,
  Layers as LayersIcon4,
  Snowflake as SnowflakeIcon5,
  Waves as WavesIcon10,
  Gem as GemIcon2,
  Bird as BirdIcon4,
  Flame as FlameIcon10,
  // Task 87 icons
  Triangle as TriangleIcon3,
  Cloud as CloudIcon4,
  MountainSnow as MountainSnowIcon3,
  Gem as GemIcon3,
  Snowflake as SnowflakeIcon7,
  TreePine as TreePineIcon6,
  Activity as ActivityIcon4,
  Thermometer as ThermometerIcon7,
  // Task 88 icons
  Droplet as DropletIcon5,
  Flame as FlameIcon11,
  Moon as MoonIcon2,
  Waves as WavesIcon11,
  Mountain as MountainIcon9,
  Droplets as DropletsIcon8,
  Wind as WindIcon8,
  ArrowDown as ArrowDownIcon4,
  // Task 89 icons
  Flame as FlameIcon12,
  Fish as FishIcon4,
  Snowflake as SnowflakeIcon8,
  Leaf as LeafIcon6,
  Waves as WavesIcon12,
  Wind as WindIcon9,
  Droplets as DropletsIcon9,
  Droplet as DropletIcon6,
  // Task 90 icons
  Snowflake as SnowflakeIcon9,
  Cloud as CloudIcon5,
  Thermometer as ThermometerIcon8,
  Droplets as DropletsIcon10,
  Mountain as MountainIcon10,
  Wind as WindIcon10,
  Droplet as DropletIcon7,
  MountainSnow as MountainSnowIcon4,
  // Task 90b icons
  Flame as FlameIcon13,
  CloudRain as CloudRainIcon4,
  Footprints as FootprintsIcon2,
  CircleDot as CircleDotIcon2,
  TreeDeciduous as TreeDeciduousIcon4,
  TriangleAlert as TriangleAlertIcon2,
  Waves as WavesIcon13,
  Activity as ActivityIcon5,
  // Task 91 icons
  Flame as FlameIcon14,
  Fish as FishIcon5,
  Snowflake as SnowflakeIcon10,
  Mountain as MountainIcon11,
  Shell as ShellIcon3,
  Droplets as DropletsIcon11,
  Layers as LayersIcon5,
  Droplet as DropletIcon8,
  // Task 92 icons
  MountainSnow as MountainSnowIcon5,
  CloudCog as CloudCogIcon2,
  TriangleAlert as TriangleAlertIcon3,
  Waves as WavesIcon14,
  Thermometer as ThermometerIcon9,
  Compass as CompassIcon4,
  Sun as SunIcon8,
  Fish as FishIcon6,
  // Task 93 icons
  Flame as FlameIcon15,
  Flame as FlameIcon16,
  Sparkles as SparklesIcon6,
  Droplets as DropletsIcon12,
  AlertTriangle as AlertTriangleIcon2,
  Flame as VolcanoIcon,
  Waves as WavesIcon15,
  CloudRain as CloudRainIcon5,
  // Task 94 icons
  Mountain as MountainIcon12,
  Zap as ZapIcon3,
  Waves as WavesIcon16,
  CloudRain as CloudRainIcon6,
  Snowflake as SnowflakeIcon11,
  ArrowUpFromLine as ArrowUpIcon3,
  Ship as ShipIcon4,
  Siren as SirenIcon2,
  // Task 95 icons
  Activity as ActivityIcon6,
  Hexagon as HexagonIcon,
  Layers as LayersIcon6,
  Fish as FishIcon7,
  TreePine as TreePineIcon7,
  Droplets as DropletsIcon13,
  Mountain as MountainIcon13,
  Wind as WindIcon11,
  // Task 96 icons
  Droplet as DropletIcon9,
  Droplets as DropletsIcon14,
  Waves as WavesIcon17,
  Leaf as LeafIcon7,
  Sparkles as SparklesIcon7,
  Wind as WindIcon12,
  Snowflake as SnowflakeIcon12,
  TriangleAlert as TriangleAlertIcon4,
  // Task 97 icons
  Flame as FlameIcon17,
  Waves as WavesIcon18,
  ArrowUpFromLine as ArrowUpIcon4,
  Droplet as DropletIcon10,
  TreePine as TreePineIcon8,
  MapPinned as MapPinnedIcon2,
  CircleDot as CircleDotIcon3,
  Droplets as DropletsIcon15,
  // Task 98 icons
  TriangleAlert as TriangleAlertIcon5,
  Waves as WavesIcon19,
  Mountain as MountainIcon14,
  ArrowDown as ArrowDownIcon5,
  Snowflake as SnowflakeIcon13,
  TrendingDown as TrendingDownIcon4,
  AlertTriangle as AlertTriangleIcon3,
  Layers as LayersIcon7,
  // Task 99 icons
  Shield as ShieldIcon3,
  Waves as WavesIcon20,
  ArrowRightLeft as ArrowRightLeftIcon,
  Square as SquareIcon,
  Anchor as AnchorIcon3,
  Sun as SunIcon9,
  ShieldCheck as ShieldCheckIcon,
  Map as MapIcon3,
  // Task 100 icons
  Leaf as LeafIcon8,
  FlaskConical as FlaskConicalIcon2,
  Droplets as DropletsIcon16,
  Box as BoxIcon2,
  Gem as GemIcon4,
  Layers as LayersIcon8,
  Droplet as DropletIcon11,
  Mountain as MountainIcon15,
  // Task 101 icons
  Gem as GemIcon5,
  AlertTriangle as AlertTriangleIcon4,
  Drill as DrillIcon2,
  Container as ContainerIcon,
  Wind as WindIcon13,
  Droplet as DropletIcon12,
  Database as DatabaseIcon2,
  Mountain as MountainIcon16,
  // Task 102 icons
  Waves as WavesIcon21,
  Wind as WindIcon14,
  Compass as CompassIcon5,
  ArrowUpFromLine as ArrowUpIcon5,
  ArrowRight as ArrowRightIcon,
  ArrowDown as ArrowDownIcon6,
  RotateCcw as RotateCcwIcon2,
  Sun as SunIcon10,
  // Task 103 icons
  Wind as WindIcon15,
  Gauge as GaugeIcon2,
  ArrowUpFromLine as ArrowUpIcon6,
  Activity as ActivityIcon7,
  RotateCcw as RotateCcwIcon3,
  CloudRain as CloudRainIcon7,
  Snowflake as SnowflakeIcon14,
  Ship as ShipIcon5,
  // Task 104 icons
  Bird as BirdIcon5,
  TreePine as TreePineIcon9,
  Sparkles as SparklesIcon8,
  Bug as BugIcon4,
  Route as RouteIcon2,
  Layers as LayersIcon9,
  TreeDeciduous as TreeDeciduousIcon5,
  Droplets as DropletsIcon17,
  // Task 105 icons
  Waves as WavesIcon22,
  Droplet as DropletIcon13,
  AlertTriangle as AlertTriangleIcon5,
  Layers as LayersIcon10,
  ArrowDown as ArrowDownIcon7,
  Snowflake as SnowflakeIcon15,
  Gauge as GaugeIcon3,
  Droplets as DropletsIcon18,
  // Task 106 icons
  MountainSnow as MountainSnowIcon6,
  Snowflake as SnowflakeIcon16,
  Mountain as MountainIcon17,
  Thermometer as ThermometerIcon22,
  FlaskConical as FlaskConicalIcon3,
  Cloud as CloudIcon6,
  ThermometerSun as ThermometerSunIcon2,
  Waves as WavesIcon23,
  // Task 107 icons
  Shield as ShieldIcon4,
  Sparkles as SparklesIcon9,
  Radio as RadioIcon3,
  Activity as ActivityIcon8,
  Zap as ZapIcon4,
  Sun as SunIcon11,
  Siren as SirenIcon3,
  Satellite as SatelliteIcon2,
} from 'lucide-react'

interface MapToolbarButtonsProps {
  onLocateMe: () => void
  onToggleFullscreen: () => void
  isFullscreen: boolean
  onExportMap: () => void
  onShare: () => void
  onSnapshotSave: () => void
  loadedPanels: Set<string>
  sidebarOpen: boolean
  comparisonEnabled: boolean
  setComparisonEnabled: (enabled: boolean) => void
}

export function MapToolbarButtons(props: Partial<MapToolbarButtonsProps>) {
  const {
    onLocateMe = () => {},
    onToggleFullscreen = () => {},
    isFullscreen = false,
    onExportMap = () => {},
    onShare = () => {},
    onSnapshotSave = () => {},
    loadedPanels = new Set<string>(),
    sidebarOpen = false,
    comparisonEnabled = false,
    setComparisonEnabled = () => {},
  } = props

  const pushNotification = useMapStore((s) => s.pushNotification)
  const measurementSuiteOpen = useMapStore((s) => s.measurementSuiteOpen)
  const trailFinderOpen = useMapStore((s) => s.trailFinderOpen)
  const pedometerVisible = useMapStore((s) => s.pedometerVisible)
  const usageStatsOpen = useMapStore((s) => s.usageStatsOpen)
  const collageCreatorOpen = useMapStore((s) => s.collageCreatorOpen)
  const eventsFinderOpen = useMapStore((s) => s.eventsFinderOpen)

  if (typeof window === 'undefined') return null

  return (
    <>
      {/* Top bar - buttons container */}
      <div className="absolute top-2 right-2 left-2 sm:top-3 sm:right-3 sm:left-3 z-10 flex items-start gap-1.5 sm:gap-2 transition-all duration-300 md:pl-0">
        {/* Search bar wrapper */}
        <div className="flex-1 md:flex-1 md:max-w-lg md:ml-0" style={{ marginLeft: sidebarOpen ? '0px' : undefined }}>
          <div className={sidebarOpen ? 'md:pl-[332px]' : ''} style={{ transition: 'padding-left 0.3s ease-in-out' }}>
            <div className="w-full md:min-w-[280px]">
              <LazyPanel
                importFn={() => import('@/components/map/SearchBar')}
                exportName="SearchBar"
                shouldLoad={true}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <LazyPanel
            importFn={() => import('@/components/map/panel-groups/TopBarPanels')}
            exportName="TopBarPanels"
            shouldLoad={loadedPanels.has('topbar')}
          />
          <Button
            variant="outline"
            size="icon"
            className={`map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${comparisonEnabled ? 'bg-primary/20 border-primary/50 text-primary' : ''}`}
            onClick={() => {
              setComparisonEnabled(!comparisonEnabled)
              if (!comparisonEnabled) {
                pushNotification({ type: 'style', icon: 'compare', message: 'Style comparison mode enabled' })
              }
            }}
            title="Compare map styles"
            aria-label="Toggle style comparison"
          >
            <GitCompare className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setDistanceMatrixOpen(true)}
            title="Distance Matrix"
            aria-label="Distance matrix calculator"
          >
            <GitBranch className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={onSnapshotSave}
            title="Save Map Snapshot"
            aria-label="Save map snapshot"
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={onLocateMe}
            title="My Location"
            aria-label="My Location"
          >
            <LocateFixed className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={onToggleFullscreen}
            title="Fullscreen"
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCoordInputDialogOpen(true)}
            title="Go to Coordinates (Ctrl+G)"
            aria-label="Go to coordinates"
          >
            <Globe2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden sm:flex map-control-glass h-10 w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setShortcutsDialogOpen(true)}
            title="Keyboard Shortcuts"
            aria-label="Keyboard shortcuts"
          >
            <Keyboard className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={onExportMap}
            title="Export Map as Image"
            aria-label="Export map as image"
          >
            <Camera className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setPrintDialogOpen(true)}
            title="Print Map"
            aria-label="Print map"
          >
            <Printer className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={onShare}
            title="Share Map View"
            aria-label="Share map view"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setRouteSharingOpen(true)}
            title="Share Route"
            aria-label="Share route"
          >
            <Share className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setEmbedDialogOpen(true)}
            title="Embed Map"
            aria-label="Generate embed code"
          >
            <Code2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setRoutePlaybackOpen(true)}
            title="Route Playback"
            aria-label="Open route playback"
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSpeedAlertOpen(true)}
            title="Speed Alerts"
            aria-label="Open speed alert system"
          >
            <Gauge className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAnalyticsPanelOpen(true)}
            title="Analytics Dashboard"
            aria-label="Open analytics dashboard"
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAqiPanelOpen(true)}
            title="Air Quality Index"
            aria-label="Open air quality panel"
          >
            <Wind className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setTrackStatsPanelOpen(true)}
            title="Track Statistics"
            aria-label="Open track statistics"
          >
            <Activity className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMarkerManagerOpen(true)}
            title="Advanced Marker Manager"
            aria-label="Open advanced marker manager"
          >
            <MapPin className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGeofenceAlertOpen(true)}
            title="Geofence Alert History"
            aria-label="Open geofence alert history"
          >
            <BellRing className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMarkerCategoriesOpen(true)}
            title="Marker Categories"
            aria-label="Manage marker categories"
          >
            <Tag className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setStylesMixerOpen(true)}
            title="Style Mixer"
            aria-label="Open style mixer"
          >
            <Palette className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMapLabelsOpen(true)}
            title="Map Labels"
            aria-label="Open map labels overlay"
          >
            <Type className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setContourGeneratorOpen(true)}
            title="Contour Generator"
            aria-label="Open contour generator"
          >
            <Mountain className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setClusteringOpen(true)}
            title="Location Clustering"
            aria-label="Open location clustering"
          >
            <Boxes className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setStoryCreatorOpen(true)}
            title="Map Story Creator"
            aria-label="Open map story creator"
          >
            <BookOpen className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setTerrainProfile3DOpen(true)}
            title="3D Terrain Profile"
            aria-label="Open 3D terrain profile"
          >
            <MountainSnow className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setImportExportOpen(true)}
            title="Data Import/Export"
            aria-label="Open data import/export"
          >
            <Database className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setOverlayGalleryOpen(true)}
            title="Map Overlay Gallery"
            aria-label="Open map overlay gallery"
          >
            <MapPinned className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setVisitTimelineOpen(true)}
            title="Location Visit Timeline"
            aria-label="Open location visit timeline"
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setWeatherCompareOpen(true)}
            title="Weather Comparison"
            aria-label="Open weather comparison"
          >
            <Thermometer className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setScreenshotManagerOpen(true)}
            title="Screenshot Manager"
            aria-label="Open screenshot manager"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setDifficultyAnalyzerOpen(true)}
            title="Route Difficulty Analyzer"
            aria-label="Open route difficulty analyzer"
          >
            <TrendingUp className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAltitudeAlertOpen(true)}
            title="Altitude Alerts"
            aria-label="Open altitude alert system"
          >
            <ArrowUpFromLine className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCompassRose({ visible: !useMapStore.getState().compassRose.visible })}
            title="Compass Rose"
            aria-label="Toggle compass rose"
          >
            <Compass className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMultiStopPlannerOpen(true)}
            title="Multi-Stop Route Planner"
            aria-label="Open multi-stop route planner"
          >
            <Waypoints className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setEnhancedWeatherOpen(true)}
            title="Enhanced Weather Dashboard"
            aria-label="Open enhanced weather dashboard"
          >
            <CloudSun className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setChatOpen(!useMapStore.getState().chatOpen)}
            title="Map Chat Assistant"
            aria-label="Open map chat assistant"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setShareCardOpen(true)}
            title="Coordinate Share Card"
            aria-label="Open coordinate share card"
          >
            <QrCode className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setWallpaperOpen(true)}
            title="Map Wallpaper Generator"
            aria-label="Open map wallpaper generator"
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAnimationStudioOpen(true)}
            title="Animation Studio"
            aria-label="Open map animation studio"
          >
            <Clapperboard className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSmartRoute({ open: true })}
            title="Smart Route Planner"
            aria-label="Open smart route planner"
          >
            <Route className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setDataVisualizer({ open: true })}
            title="Data Visualizer"
            aria-label="Open data visualizer"
          >
            <BarChart2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setFieldSurvey({ open: true })}
            title="Field Survey Tool"
            aria-label="Open field survey tool"
          >
            <ClipboardCheck className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setEmergencyRoute({ open: true })}
            title="Emergency Route Planner"
            aria-label="Open emergency route planner"
          >
            <ShieldAlert className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setComparisonSlider({ enabled: !useMapStore.getState().comparisonSlider.enabled })}
            title="Map Comparison Slider"
            aria-label="Toggle map comparison slider"
          >
            <SplitSquareHorizontal className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setNoiseHeatmap({ enabled: !useMapStore.getState().noiseHeatmap.enabled })}
            title="Noise Heatmap"
            aria-label="Toggle noise heatmap"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSolarExposure({ open: true })}
            title="Solar Exposure Analyzer"
            aria-label="Open solar exposure analyzer"
          >
            <Sun className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setStyleForge({ open: true })}
            title="Style Forge"
            aria-label="Open style forge"
          >
            <Hammer className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setTopoProfiler({ open: true })}
            title="Topographic Profiler"
            aria-label="Open topographic profiler"
          >
            <MountainIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMaritimeNav({ open: true })}
            title="Maritime Navigation"
            aria-label="Open maritime navigation"
          >
            <Anchor className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGeocaching({ open: true })}
            title="Geocaching Toolkit"
            aria-label="Open geocaching toolkit"
          >
            <Map className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAtmospheric({ open: true })}
            title="Atmospheric Dashboard"
            aria-label="Open atmospheric dashboard"
          >
            <CloudCog className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setWildlifeTracker({ open: true })}
            title="Wildlife Tracker"
            aria-label="Open wildlife tracker"
          >
            <Bird className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCulturalHeritage({ open: true })}
            title="Cultural Heritage Map"
            aria-label="Open cultural heritage map"
          >
            <Landmark className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setHydrology({ open: true })}
            title="Hydrology Analyzer"
            aria-label="Open hydrology analyzer"
          >
            <Droplets className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGlacierMonitor({ open: true })}
            title="Glacier Monitor"
            aria-label="Open glacier monitor"
          >
            <SnowflakeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSeismicActivity({ open: true })}
            title="Seismic Activity"
            aria-label="Open seismic activity map"
          >
            <ActivityIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSoilAnalysis({ open: true })}
            title="Soil Analysis"
            aria-label="Open soil analysis panel"
          >
            <Sprout className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setUrbanGrowth({ open: true })}
            title="Urban Growth Simulator"
            aria-label="Open urban growth simulator"
          >
            <Building2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAirspaceNav({ open: true })}
            title="Airspace Navigator"
            aria-label="Open airspace navigator"
          >
            <Plane className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setReefHealth({ open: true })}
            title="Reef Health Monitor"
            aria-label="Open reef health monitor"
          >
            <Waves className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMagneticField({ open: true })}
            title="Magnetic Field Mapper"
            aria-label="Open magnetic field mapper"
          >
            <Magnet className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setFloodRisk({ open: true })}
            title="Flood Risk Analyzer"
            aria-label="Open flood risk analyzer"
          >
            <Droplet className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setVolcanoMonitor({ open: true })}
            title="Volcano Monitor"
            aria-label="Open volcano monitor"
          >
            <Flame className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAvalancheRisk({ open: true })}
            title="Avalanche Risk Map"
            aria-label="Open avalanche risk map"
          >
            <SnowflakeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCropHealth({ open: true })}
            title="Crop Health Analyzer"
            aria-label="Open crop health analyzer"
          >
            <Wheat className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSpaceTrack({ open: true })}
            title="Space Track Viewer"
            aria-label="Open space track viewer"
          >
            <Satellite className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setArchaeologyMap({ open: true })}
            title="Archaeology Map"
            aria-label="Open archaeology map"
          >
            <Pyramid className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setPollutionTracker({ open: true })}
            title="Pollution Tracker"
            aria-label="Open pollution tracker"
          >
            <Factory className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setTidalPredictor({ open: true })}
            title="Tidal Predictor"
            aria-label="Open tidal predictor"
          >
            <Ship className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setWindFarm({ open: true })}
            title="Wind Farm Optimizer"
            aria-label="Open wind farm optimizer"
          >
            <Zap className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setDesertification({ open: true })}
            title="Desertification Monitor"
            aria-label="Open desertification monitor"
          >
            <SunIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMineralExploration({ open: true })}
            title="Mineral Exploration"
            aria-label="Open mineral exploration"
          >
            <Gem className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setOceanCurrent({ open: true })}
            title="Ocean Current Mapper"
            aria-label="Open ocean current mapper"
          >
            <Fish className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setPermafrost({ open: true })}
            title="Permafrost Thaw Tracker"
            aria-label="Open permafrost thaw tracker"
          >
            <ThermometerSnowflake className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setLightning({ open: true })}
            title="Lightning Strike Map"
            aria-label="Open lightning strike map"
          >
            <CloudLightning className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setBiome({ open: true })}
            title="Biome Classifier"
            aria-label="Open biome classifier"
          >
            <Leaf className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGroundwater({ open: true })}
            title="Groundwater Explorer"
            aria-label="Open groundwater explorer"
          >
            <DropletIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSolarPower({ open: true })}
            title="Solar Power Planner"
            aria-label="Open solar power planner"
          >
            <SunIcon3 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setVolcanicAsh({ open: true })}
            title="Volcanic Ash Tracker"
            aria-label="Open volcanic ash tracker"
          >
            <CloudHail className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCoastalErosion({ open: true })}
            title="Coastal Erosion Monitor"
            aria-label="Open coastal erosion monitor"
          >
            <WavesIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCarbonFootprint({ open: true })}
            title="Carbon Footprint Mapper"
            aria-label="Open carbon footprint mapper"
          >
            <CloudSmoke className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setWildlifeMigration({ open: true })}
            title="Wildlife Migration Tracker"
            aria-label="Open wildlife migration tracker"
          >
            <BirdIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setIceSheet({ open: true })}
            title="Ice Sheet Monitor"
            aria-label="Open ice sheet monitor"
          >
            <MountainSnow className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setDroughtMonitor({ open: true })}
            title="Drought Monitor"
            aria-label="Open drought monitor"
          >
            <ThermometerSun className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setLandSubsidence({ open: true })}
            title="Land Subsidence Tracker"
            aria-label="Open land subsidence tracker"
          >
            <ArrowDownFromLine className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCoralBleaching({ open: true })}
            title="Coral Bleaching Alert"
            aria-label="Open coral bleaching alert"
          >
            <Shell className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setTsunamiAlert({ open: true })}
            title="Tsunami Alert System"
            aria-label="Open tsunami alert system"
          >
            <Siren className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSoilErosion({ open: true })}
            title="Soil Erosion Monitor"
            aria-label="Open soil erosion monitor"
          >
            <CloudRain className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setWatershedManager({ open: true })}
            title="Watershed Manager"
            aria-label="Open watershed manager"
          >
            <DropletsIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setTectonicPlate({ open: true })}
            title="Tectonic Plate Viewer"
            aria-label="Open tectonic plate viewer"
          >
            <GlobeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAirQualityForecaster({ open: true })}
            title="Air Quality Forecaster"
            aria-label="Open air quality forecaster"
          >
            <WindIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGlacialLake({ open: true })}
            title="Glacial Lake Monitor"
            aria-label="Open glacial lake monitor"
          >
            <SnowflakeIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSpaceWeather({ open: true })}
            title="Space Weather Monitor"
            aria-label="Open space weather monitor"
          >
            <Radio className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setPeatlandMonitor({ open: true })}
            title="Peatland Monitor"
            aria-label="Open peatland monitor"
          >
            <TreeDeciduous className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMangroveMonitor({ open: true })}
            title="Mangrove Monitor"
            aria-label="Open mangrove monitor"
          >
            <Leaf className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSandstormTracker({ open: true })}
            title="Sandstorm Tracker"
            aria-label="Open sandstorm tracker"
          >
            <WindIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setWetlandMapper({ open: true })}
            title="Wetland Mapper"
            aria-label="Open wetland mapper"
          >
            <DropletsIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setUrbanHeatIsland({ open: true })}
            title="Urban Heat Island"
            aria-label="Open urban heat island"
          >
            <Thermometer className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setWildfireRisk({ open: true })}
            title="Wildfire Risk Assessor"
            aria-label="Open wildfire risk assessor"
          >
            <FlameIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAlgalBloom({ open: true })}
            title="Algal Bloom Tracker"
            aria-label="Open algal bloom tracker"
          >
            <Fish className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setLandslideRisk({ open: true })}
            title="Landslide Predictor"
            aria-label="Open landslide predictor"
          >
            <Mountain className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSeaIceNavigator({ open: true })}
            title="Sea Ice Navigator"
            aria-label="Open sea ice navigator"
          >
            <ShipIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCloudCover({ open: true })}
            title="Cloud Cover Analyzer"
            aria-label="Open cloud cover analyzer"
          >
            <CloudIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSoilMoisture({ open: true })}
            title="Soil Moisture Monitor"
            aria-label="Open soil moisture monitor"
          >
            <DropletsIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setLightPollution({ open: true })}
            title="Light Pollution Map"
            aria-label="Open light pollution map"
          >
            <MoonIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setRiverFlow({ open: true })}
            title="River Flow Monitor"
            aria-label="Open river flow monitor"
          >
            <WavesIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setVolcanoSeismic({ open: true })}
            title="Volcano Seismic Monitor"
            aria-label="Open volcano seismic monitor"
          >
            <Triangle className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setWhaleMigration({ open: true })}
            title="Whale Migration Tracker"
            aria-label="Open whale migration tracker"
          >
            <Fish className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAvalancheForecaster({ open: true })}
            title="Avalanche Forecaster"
            aria-label="Open avalanche forecaster"
          >
            <SnowflakeIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAuroraForecaster({ open: true })}
            title="Aurora Forecaster"
            aria-label="Open aurora forecaster"
          >
            <SparklesIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setOzoneLayer({ open: true })}
            title="Ozone Layer Monitor"
            aria-label="Open ozone layer monitor"
          >
            <Sun className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setDeforestation({ open: true })}
            title="Deforestation Tracker"
            aria-label="Open deforestation tracker"
          >
            <TreePine className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMethaneEmissions({ open: true })}
            title="Methane Emissions Tracker"
            aria-label="Open methane emissions tracker"
          >
            <Factory className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setOceanAcidification({ open: true })}
            title="Ocean Acidification Monitor"
            aria-label="Open ocean acidification monitor"
          >
            <DropletsIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSpaceDebris({ open: true })}
            title="Space Debris Tracker"
            aria-label="Open space debris tracker"
          >
            <Radio className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setTectonicStrain({ open: true })}
            title="Tectonic Strain Monitor"
            aria-label="Open tectonic strain monitor"
          >
            <Activity className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setPhytoBloom({ open: true })}
            title="Phytoplankton Bloom Monitor"
            aria-label="Open phytoplankton bloom monitor"
          >
            <Fish className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSnowCover({ open: true })}
            title="Snow Cover Monitor"
            aria-label="Open snow cover monitor"
          >
            <SnowflakeIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGeomagneticStorm({ open: true })}
            title="Geomagnetic Storm Tracker"
            aria-label="Open geomagnetic storm tracker"
          >
            <Zap className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setVolcanicGas({ open: true })}
            title="Volcanic Gas Monitor"
            aria-label="Open volcanic gas monitor"
          >
            <CloudIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAquiferDepletion({ open: true })}
            title="Aquifer Depletion Monitor"
            aria-label="Open aquifer depletion monitor"
          >
            <DropletsIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setStratosphericWind({ open: true })}
            title="Stratospheric Wind Monitor"
            aria-label="Open stratospheric wind monitor"
          >
            <WindIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMarineHeatwave({ open: true })}
            title="Marine Heatwave Tracker"
            aria-label="Open marine heatwave tracker"
          >
            <WavesIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setPrecipitation({ open: true })}
            title="Precipitation Analyzer"
            aria-label="Open precipitation analyzer"
          >
            <CloudRain className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCosmicRay({ open: true })}
            title="Cosmic Ray Monitor"
            aria-label="Open cosmic ray monitor"
          >
            <Activity className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGreenlandIce({ open: true })}
            title="Greenland Ice Tracker"
            aria-label="Open greenland ice tracker"
          >
            <Globe2Icon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setRadiationExposure({ open: true })}
            title="Radiation Exposure Monitor"
            aria-label="Open radiation exposure monitor"
          >
            <ShieldAlert className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setPeatFire({ open: true })}
            title="Peat Fire Tracker"
            aria-label="Open peat fire tracker"
          >
            <FlameIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSeaLevelRise({ open: true })}
            title="Sea Level Rise Projector"
            aria-label="Open sea level rise projector"
          >
            <WavesIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setThermocline({ open: true })}
            title="Thermocline Mapper"
            aria-label="Open thermocline mapper"
          >
            <Thermometer className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAcidRain({ open: true })}
            title="Acid Rain Tracker"
            aria-label="Open acid rain tracker"
          >
            <CloudRain className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMethaneHydrate({ open: true })}
            title="Methane Hydrate Monitor"
            aria-label="Open methane hydrate monitor"
          >
            <DropletsIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setKelpForest({ open: true })}
            title="Kelp Forest Monitor"
            aria-label="Open kelp forest monitor"
          >
            <Leaf className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGLOF({ open: true })}
            title="Glacier Lake Outburst Tracker"
            aria-label="Open glacier lake outburst tracker"
          >
            <Mountain className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setDustStorm({ open: true })}
            title="Dust Storm Tracker"
            aria-label="Open dust storm tracker"
          >
            <WindIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setBioluminescence({ open: true })}
            title="Bioluminescence Tracker"
            aria-label="Open bioluminescence tracker"
          >
            <SparklesIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setUrbanSprawl({ open: true })}
            title="Urban Sprawl Monitor"
            aria-label="Open urban sprawl monitor"
          >
            <Building2Icon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setViralOutbreak({ open: true })}
            title="Viral Outbreak Mapper"
            aria-label="Open viral outbreak mapper"
          >
            <Bug className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMagnetosphere({ open: true })}
            title="Magnetosphere Monitor"
            aria-label="Open magnetosphere monitor"
          >
            <MagnetIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setFogDensity({ open: true })}
            title="Fog Density Mapper"
            aria-label="Open fog density mapper"
          >
            <CloudFog className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCarbonCapture({ open: true })}
            title="Carbon Capture Tracker"
            aria-label="Open carbon capture tracker"
          >
            <FactoryIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setHailStorm({ open: true })}
            title="Hail Storm Tracker"
            aria-label="Open hail storm tracker"
          >
            <CloudHailIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSaharaReforestation({ open: true })}
            title="Sahara Reforestation Tracker"
            aria-label="Open sahara reforestation tracker"
          >
            <TreePineIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setDeepSeaVent({ open: true })}
            title="Deep Sea Vent Monitor"
            aria-label="Open deep sea vent monitor"
          >
            <FlameIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setStormSurge({ open: true })}
            title="Storm Surge Predictor"
            aria-label="Open storm surge predictor"
          >
            <WavesIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setLandfillMonitor({ open: true })}
            title="Landfill Monitor"
            aria-label="Open landfill monitor"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSalinityGradient({ open: true })}
            title="Salinity Gradient Mapper"
            aria-label="Open salinity gradient mapper"
          >
            <DropletsIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMicroplastics({ open: true })}
            title="Microplastics Tracker"
            aria-label="Open microplastics tracker"
          >
            <SearchIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setRadioSignal({ open: true })}
            title="Radio Signal Mapper"
            aria-label="Open radio signal mapper"
          >
            <RadioIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setVolcanicIsland({ open: true })}
            title="Volcanic Island Monitor"
            aria-label="Open volcanic island monitor"
          >
            <MountainIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setPermafrostThaw({ open: true })}
            title="Permafrost Thaw Monitor"
            aria-label="Open permafrost thaw monitor"
          >
            <ThermometerSnowflake className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setOceanCurrentTracker({ open: true })}
            title="Ocean Current Tracker"
            aria-label="Open ocean current tracker"
          >
            <WavesIcon3 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSpaceWeatherAlert({ open: true })}
            title="Space Weather Alert"
            aria-label="Open space weather alert"
          >
            <SunIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setDesertMonitor({ open: true })}
            title="Desert Monitor"
            aria-label="Open desert monitor"
          >
            <SunDim className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setTsunamiBuoy({ open: true })}
            title="Tsunami Buoy Tracker"
            aria-label="Open tsunami buoy tracker"
          >
            <Anchor className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGlacierVelocity({ open: true })}
            title="Glacier Velocity Tracker"
            aria-label="Open glacier velocity tracker"
          >
            <MountainSnow className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setEarthquakeSwarm({ open: true })}
            title="Earthquake Swarm Monitor"
            aria-label="Open earthquake swarm monitor"
          >
            <ActivityIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMangroveRestoration({ open: true })}
            title="Mangrove Restoration Tracker"
            aria-label="Open mangrove restoration tracker"
          >
            <TreeDeciduousIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCoralBleachingMonitor({ open: true })}
            title="Coral Bleaching Monitor"
            aria-label="Open coral bleaching monitor"
          >
            <FishIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setArcticSeaIce({ open: true })}
            title="Arctic Sea Ice Monitor"
            aria-label="Open arctic sea ice monitor"
          >
            <SnowflakeIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSoilMoistureAg({ open: true })}
            title="Soil Moisture Ag Mapper"
            aria-label="Open soil moisture mapper"
          >
            <DropletsIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setNoisePollution({ open: true })}
            title="Noise Pollution Mapper"
            aria-label="Open noise pollution mapper"
          >
            <Volume2Icon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setLightPollutionSky({ open: true })}
            title="Light Pollution Sky Mapper"
            aria-label="Open light pollution mapper"
          >
            <EyeIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGroundwaterRecharge({ open: true })}
            title="Groundwater Recharge Tracker"
            aria-label="Open groundwater recharge tracker"
          >
            <DrillIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAirQuality({ open: true })}
            title="Air Quality Monitor"
            aria-label="Open air quality monitor"
          >
            <WindIcon3 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSubglacialLake({ open: true })}
            title="Subglacial Lake Explorer"
            aria-label="Open subglacial lake explorer"
          >
            <WavesIcon3 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setThermokarstLake({ open: true })}
            title="Thermokarst Lake Monitor"
            aria-label="Open thermokarst lake monitor"
          >
            <DropletsIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setPaleoclimateProxy({ open: true })}
            title="Paleoclimate Proxy Explorer"
            aria-label="Open paleoclimate proxy explorer"
          >
            <Clock className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGicMonitor({ open: true })}
            title="GIC Monitor"
            aria-label="Open geomagnetically induced current monitor"
          >
            <Zap className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSabkhaEnvironment({ open: true })}
            title="Sabkha Environment"
            aria-label="Open sabkha environment monitor"
          >
            <SunIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCryosphereChange({ open: true })}
            title="Cryosphere Change Tracker"
            aria-label="Open cryosphere change tracker"
          >
            <SnowflakeIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAbyssalPlain({ open: true })}
            title="Abyssal Plain Mapper"
            aria-label="Open abyssal plain mapper"
          >
            <FishIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setFjordEcosystem({ open: true })}
            title="Fjord Ecosystem Monitor"
            aria-label="Open fjord ecosystem monitor"
          >
            <MountainIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGeothermalSpring({ open: true })}
            title="Geothermal Spring Monitor"
            aria-label="Open geothermal spring monitor"
          >
            <FlameIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAsteroidImpact({ open: true })}
            title="Asteroid Impact Risk Mapper"
            aria-label="Open asteroid impact risk mapper"
          >
            <Zap className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setDesertOasis({ open: true })}
            title="Desert Oasis Monitor"
            aria-label="Open desert oasis monitor"
          >
            <DropletsIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setVolcanicLightning({ open: true })}
            title="Volcanic Lightning Tracker"
            aria-label="Open volcanic lightning tracker"
          >
            <Zap className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setIceCoreData({ open: true })}
            title="Ice Core Data Explorer"
            aria-label="Open ice core data explorer"
          >
            <SnowflakeIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setStratosphericAerosol({ open: true })}
            title="Stratospheric Aerosol Monitor"
            aria-label="Open stratospheric aerosol monitor"
          >
            <CloudIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMegacityCarbon({ open: true })}
            title="Megacity Carbon Footprint"
            aria-label="Open megacity carbon footprint"
          >
            <Globe2Icon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setOceanEddy({ open: true })}
            title="Ocean Mesoscale Eddy Tracker"
            aria-label="Open ocean mesoscale eddy tracker"
          >
            <WavesIcon3 className="h-4 w-4" />
          </Button>
          {/* Task 68: New monitoring buttons */}
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSupervolcano({ open: true })}
            title="Supervolcano Monitor"
            aria-label="Open supervolcano monitor"
          >
            <FlameIcon3 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setPolarVortex({ open: true })}
            title="Polar Vortex Monitor"
            aria-label="Open polar vortex monitor"
          >
            <WindIcon4 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setKarstAquifer({ open: true })}
            title="Karst Aquifer Monitor"
            aria-label="Open karst aquifer monitor"
          >
            <DropletsIcon3 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSubductionZone({ open: true })}
            title="Subduction Zone Monitor"
            aria-label="Open subduction zone monitor"
          >
            <LayersIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setTropopause({ open: true })}
            title="Tropopause Monitor"
            aria-label="Open tropopause monitor"
          >
            <ArrowUpIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setInvasiveSpecies({ open: true })}
            title="Invasive Species Tracker"
            aria-label="Open invasive species tracker"
          >
            <BugIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setTundraCarbon({ open: true })}
            title="Tundra Carbon Monitor"
            aria-label="Open tundra carbon monitor"
          >
            <TreeDeciduousIcon3 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMonsoon({ open: true })}
            title="Monsoon Tracker"
            aria-label="Open monsoon tracker"
          >
            <CloudRainIcon2 className="h-4 w-4" />
          </Button>
          {/* Task 69: New monitoring buttons */}
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setLavaFlow({ open: true })}
            title="Lava Flow Tracker"
            aria-label="Open lava flow tracker"
          >
            <FlameIcon4 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setTidalEnergy({ open: true })}
            title="Tidal Energy Monitor"
            aria-label="Open tidal energy monitor"
          >
            <WavesIcon5 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setPeatFire({ open: true })}
            title="Peat Fire Monitor"
            aria-label="Open peat fire monitor"
          >
            <FlameIcon5 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCoralSpawn({ open: true })}
            title="Coral Spawn Tracker"
            aria-label="Open coral spawn tracker"
          >
            <SparklesIcon4 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGlacierCalving({ open: true })}
            title="Glacier Calving Monitor"
            aria-label="Open glacier calving monitor"
          >
            <MountainIcon4 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSoilCarbon({ open: true })}
            title="Soil Carbon Monitor"
            aria-label="Open soil carbon monitor"
          >
            <SproutIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setUrbanTreeCanopy({ open: true })}
            title="Urban Tree Canopy"
            aria-label="Open urban tree canopy"
          >
            <TreePineIcon4 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGeomagneticPole({ open: true })}
            title="Geomagnetic Pole Tracker"
            aria-label="Open geomagnetic pole tracker"
          >
            <CompassIcon3 className="h-4 w-4" />
          </Button>
          {/* Task 70: New monitoring buttons */}
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setHydrothermalVent({ open: true })} title="Hydrothermal Vent Monitor" aria-label="Open hydrothermal vent monitor"><FlameIcon6 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setWatershedHealth({ open: true })} title="Watershed Health Monitor" aria-label="Open watershed health monitor"><DropletsIcon4 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setMigratoryFlyway({ open: true })} title="Migratory Flyway Monitor" aria-label="Open migratory flyway monitor"><BirdIcon3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSeagrassMeadow({ open: true })} title="Seagrass Meadow Monitor" aria-label="Open seagrass meadow monitor"><LeafIcon4 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setUrbanHeatIslandDetail({ open: true })} title="Urban Heat Island Detail" aria-label="Open urban heat island detail"><ThermometerIcon4 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setOceanAcidificationDetail({ open: true })} title="Ocean Acidification Detail" aria-label="Open ocean acidification detail"><FlaskConicalIcon className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setDesertificationDetail({ open: true })} title="Desertification Detail Monitor" aria-label="Open desertification detail monitor"><SunIcon4 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setVolcanicGasTracker({ open: true })} title="Volcanic Gas Tracker" aria-label="Open volcanic gas tracker"><CloudLightningIcon className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setDeepOceanCurrent({ open: true })} title="Deep Ocean Current" aria-label="Open deep ocean current monitor"><AnchorIcon2 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setStratosphericOzone({ open: true })} title="Stratospheric Ozone" aria-label="Open stratospheric ozone monitor"><Shield className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSeismicHarmonic({ open: true })} title="Seismic Harmonic" aria-label="Open seismic harmonic monitor"><ActivityIcon3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setWildfireSmoke({ open: true })} title="Wildfire Smoke" aria-label="Open wildfire smoke tracker"><CloudFogIcon2 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setEstuaryHealth({ open: true })} title="Estuary Health" aria-label="Open estuary health monitor"><WavesIcon7 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setAlpineGlacier({ open: true })} title="Alpine Glacier" aria-label="Open alpine glacier monitor"><MountainSnowIcon2 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setOceanAnoxicZone({ open: true })} title="Ocean Anoxic Zone" aria-label="Open ocean anoxic zone monitor"><DropletsIcon5 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setPermafrostCarbonFeedback({ open: true })} title="Permafrost Carbon" aria-label="Open permafrost carbon feedback"><ThermometerIcon5 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setTropicalCyclone({ open: true })} title="Tropical Cyclone" aria-label="Open tropical cyclone tracker"><CloudHailIcon2 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setVolcanicDeformation({ open: true })} title="Volcanic Deformation" aria-label="Open volcanic deformation monitor"><MoveIcon className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setCoralReefBleachingDetail({ open: true })} title="Coral Reef Bleaching" aria-label="Open coral reef bleaching detail"><ShellIcon2 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setArcticPermafrostLakes({ open: true })} title="Arctic Permafrost Lakes" aria-label="Open arctic permafrost lakes monitor"><SnowflakeIcon3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setMethaneEmissionHotspot({ open: true })} title="Methane Emission" aria-label="Open methane emission hotspot"><FlameIcon7 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setCoastalUpwelling({ open: true })} title="Coastal Upwelling" aria-label="Open coastal upwelling monitor"><WavesIcon8 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSpaceDebrisOrbit({ open: true })} title="Space Debris Orbit" aria-label="Open space debris orbit tracker"><OrbitIcon className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setTectonicPlateBoundary({ open: true })} title="Tectonic Plate Boundary" aria-label="Open tectonic plate boundary monitor"><GlobeIcon3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setLandslideSusceptibility({ open: true })} title="Landslide Susceptibility" aria-label="Open landslide susceptibility monitor"><TriangleIcon2 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSolarFlareActivity({ open: true })} title="Solar Flare Activity" aria-label="Open solar flare activity monitor"><SunIcon5 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setRiverDeltaErosion({ open: true })} title="River Delta Erosion" aria-label="Open river delta erosion monitor"><DropletsIcon6 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSeaIceThickness({ open: true })} title="Sea Ice Thickness" aria-label="Open sea ice thickness monitor"><SnowflakeIcon4 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setUrbanAirQuality({ open: true })} title="Urban Air Quality" aria-label="Open urban air quality monitor"><WindIcon6 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setGeothermalEnergy({ open: true })} title="Geothermal Energy" aria-label="Open geothermal energy monitor"><ZapIcon2 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setAquiferSalinization({ open: true })} title="Aquifer Salinization" aria-label="Open aquifer salinization monitor"><DropletIcon3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setBiomassBurning({ open: true })} title="Biomass Burning" aria-label="Open biomass burning monitor"><FlameIcon8 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setGlacialLakeOutburst({ open: true })} title="Glacial Lake Outburst" aria-label="Open glacial lake outburst monitor"><AlertTriangleIcon className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setOceanMicroplastic({ open: true })} title="Ocean Microplastic" aria-label="Open ocean microplastic tracker"><CircleDotIcon className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setVolcanicAshDispersion({ open: true })} title="Volcanic Ash Dispersion" aria-label="Open volcanic ash dispersion monitor"><CloudIcon3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setDroughtSeverity({ open: true })} title="Drought Severity" aria-label="Open drought severity monitor"><SunIcon6 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setTsunamiWaveHeight({ open: true })} title="Tsunami Wave Height" aria-label="Open tsunami wave height monitor"><WavesIcon9 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setCaveEcosystem({ open: true })} title="Cave Ecosystem" aria-label="Open cave ecosystem monitor"><MountainIcon6 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSolarIrradiance({ open: true })} title="Solar Irradiance" aria-label="Open solar irradiance monitor"><SunIcon7 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setPeatlandRestoration({ open: true })} title="Peatland Restoration" aria-label="Open peatland restoration tracker"><SproutIcon3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setMangroveCarbon({ open: true })} title="Mangrove Carbon" aria-label="Open mangrove carbon monitor"><TreePineIcon5 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setOceanHeatContent({ open: true })} title="Ocean Heat Content" aria-label="Open ocean heat content monitor"><ThermometerIcon6 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setDustStormTracker({ open: true })} title="Dust Storm Tracker" aria-label="Open dust storm tracker"><WindIcon7 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setCoralDiseaseMonitor({ open: true })} title="Coral Disease" aria-label="Open coral disease monitor"><BugIcon3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setIceShelfCollapse({ open: true })} title="Ice Shelf Collapse" aria-label="Open ice shelf collapse monitor"><LayersIcon3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setUrbanFloodRisk({ open: true })} title="Urban Flood Risk" aria-label="Open urban flood risk monitor"><DropletsIcon7 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setPhytoplanktonBloom({ open: true })} title="Phytoplankton Bloom" aria-label="Open phytoplankton bloom monitor"><LeafIcon5 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSubmarineCanyon({ open: true })} title="Submarine Canyon" aria-label="Open submarine canyon monitor"><ArrowDownIcon className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setKelpForestMonitor({ open: true })} title="Kelp Forest" aria-label="Open kelp forest monitor"><FishIcon3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setVolcanicIslandFormation({ open: true })} title="Volcanic Island Formation" aria-label="Open volcanic island formation monitor"><MountainIcon7 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSaltwaterIntrusion({ open: true })} title="Saltwater Intrusion" aria-label="Open saltwater intrusion monitor"><DropletIcon4 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setArcticShippingRoute({ open: true })} title="Arctic Shipping Route" aria-label="Open arctic shipping route monitor"><ShipIcon3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setThermoclineDepth({ open: true })} title="Thermocline Depth" aria-label="Open thermocline depth monitor"><ArrowDownIcon2 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setBioluminescentBay({ open: true })} title="Bioluminescent Bay" aria-label="Open bioluminescent bay monitor"><SparklesIcon5 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setOrographicRainfall({ open: true })} title="Orographic Rainfall" aria-label="Open orographic rainfall monitor"><CloudRainIcon3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setHydrothermalPlume({ open: true })} title="Hydrothermal Plume" aria-label="Open hydrothermal plume monitor"><FlameIcon9 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSeamountEcosystem({ open: true })} title="Seamount Ecosystem" aria-label="Open seamount ecosystem monitor"><MountainIcon8 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setGroundSubsidence({ open: true })} title="Ground Subsidence" aria-label="Open ground subsidence monitor"><ArrowDownIcon3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setOceanStratification({ open: true })} title="Ocean Stratification" aria-label="Open ocean stratification monitor"><LayersIcon4 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSnowCoverExtent({ open: true })} title="Snow Cover Extent" aria-label="Open snow cover extent monitor"><SnowflakeIcon5 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setCoastalErosionDetail({ open: true })} title="Coastal Erosion Detail" aria-label="Open coastal erosion detail"><WavesIcon10 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setEcosystemServiceValue({ open: true })} title="Ecosystem Service Value" aria-label="Open ecosystem service value"><GemIcon2 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setTidalFlatMonitor({ open: true })} title="Tidal Flat Monitor" aria-label="Open tidal flat monitor"><BirdIcon4 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setWildfireRiskAssessment({ open: true })} title="Wildfire Risk Assessment" aria-label="Open wildfire risk assessment"><FlameIcon10 className="h-4 w-4" /></Button>
          {/* Task 87 buttons */}
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setKarstSinkhole({ open: true })} title="Karst Sinkhole" aria-label="Open karst sinkhole monitor"><TriangleIcon3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setVolcanicSO2({ open: true })} title="Volcanic SO2" aria-label="Open volcanic SO2 monitor"><CloudIcon4 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setIcebergTracker({ open: true })} title="Iceberg Tracker" aria-label="Open iceberg tracker"><MountainSnowIcon3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setCaveMineral({ open: true })} title="Cave Mineral Formation" aria-label="Open cave mineral formation monitor"><GemIcon3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSeafloorHydrate({ open: true })} title="Seafloor Hydrate" aria-label="Open seafloor hydrate monitor"><SnowflakeIcon7 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setMangroveLoss({ open: true })} title="Mangrove Loss" aria-label="Open mangrove loss monitor"><TreePineIcon6 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setUrbanNoiseCorridor({ open: true })} title="Urban Noise Corridor" aria-label="Open urban noise corridor monitor"><ActivityIcon4 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setStratosphericWarming({ open: true })} title="Stratospheric Warming" aria-label="Open stratospheric warming monitor"><ThermometerIcon7 className="h-4 w-4" /></Button>
          {/* Task 88 buttons */}
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSubmarineGroundwater({ open: true })} title="Submarine Groundwater" aria-label="Open submarine groundwater monitor"><DropletIcon5 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setHydrothermalSulfide({ open: true })} title="Hydrothermal Sulfide" aria-label="Open hydrothermal sulfide monitor"><FlameIcon11 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setLunarTidalForce({ open: true })} title="Lunar Tidal Force" aria-label="Open lunar tidal force monitor"><MoonIcon2 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setRipCurrent({ open: true })} title="Rip Current" aria-label="Open rip current monitor"><WavesIcon11 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setAvalancheDebrisFlow({ open: true })} title="Avalanche Debris Flow" aria-label="Open avalanche debris flow monitor"><MountainIcon9 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setCoastalAcidification({ open: true })} title="Coastal Acidification" aria-label="Open coastal acidification monitor"><DropletsIcon8 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setDesertSandSea({ open: true })} title="Desert Sand Sea" aria-label="Open desert sand sea monitor"><WindIcon8 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSubsidenceHazard({ open: true })} title="Subsidence Hazard" aria-label="Open subsidence hazard monitor"><ArrowDownIcon4 className="h-4 w-4" /></Button>
          {/* Task 89 buttons */}
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setVolcanicLahar({ open: true })} title="Volcanic Lahar" aria-label="Open volcanic lahar monitor"><FlameIcon12 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setDeepWaterCoral({ open: true })} title="Deep Water Coral" aria-label="Open deep water coral monitor"><FishIcon4 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setPolarBearHabitat({ open: true })} title="Polar Bear Habitat" aria-label="Open polar bear habitat monitor"><SnowflakeIcon8 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSoilSalinization({ open: true })} title="Soil Salinization" aria-label="Open soil salinization monitor"><LeafIcon6 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setTsunamiRunup({ open: true })} title="Tsunami Runup" aria-label="Open tsunami runup monitor"><WavesIcon12 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setUrbanHeatVentilation({ open: true })} title="Urban Heat Ventilation" aria-label="Open urban heat ventilation monitor"><WindIcon9 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setBrinePool({ open: true })} title="Brine Pool" aria-label="Open brine pool monitor"><DropletsIcon9 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSupraglacialStream({ open: true })} title="Supraglacial Stream" aria-label="Open supraglacial stream monitor"><DropletIcon6 className="h-4 w-4" /></Button>
          {/* Task 90 buttons */}
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setMethaneHydrateStability({ open: true })} title="Methane Hydrate Stability" aria-label="Open methane hydrate stability monitor"><SnowflakeIcon9 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setVolcanicAshCloud({ open: true })} title="Volcanic Ash Cloud" aria-label="Open volcanic ash cloud monitor"><CloudIcon5 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setGeothermalGradient({ open: true })} title="Geothermal Gradient" aria-label="Open geothermal gradient monitor"><ThermometerIcon8 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setOceanDeoxygenation({ open: true })} title="Ocean Deoxygenation" aria-label="Open ocean deoxygenation monitor"><DropletsIcon10 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setRockGlacier({ open: true })} title="Rock Glacier" aria-label="Open rock glacier monitor"><MountainIcon10 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setDustHemisphere({ open: true })} title="Dust Hemisphere Transport" aria-label="Open dust hemisphere transport monitor"><WindIcon10 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setMicroplasticOcean({ open: true })} title="Microplastic Ocean" aria-label="Open microplastic ocean monitor"><DropletIcon7 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setGlacierBasalSlide({ open: true })} title="Glacier Basal Slide" aria-label="Open glacier basal slide monitor"><MountainSnowIcon4 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setVolcanicFumarole({ open: true })} title="Volcanic Fumarole" aria-label="Open volcanic fumarole monitor"><FlameIcon13 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setHydroclimateExtremes({ open: true })} title="Hydroclimate Extremes" aria-label="Open hydroclimate extremes monitor"><CloudRainIcon4 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setMegafaunaTracking({ open: true })} title="Megafauna Tracking" aria-label="Open megafauna tracking monitor"><FootprintsIcon2 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setCryoconiteHole({ open: true })} title="Cryoconite Hole" aria-label="Open cryoconite hole monitor"><CircleDotIcon2 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSapFlow({ open: true })} title="Sap Flow Monitor" aria-label="Open sap flow monitor"><TreeDeciduousIcon4 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setRockfallHazard({ open: true })} title="Rockfall Hazard" aria-label="Open rockfall hazard monitor"><TriangleAlertIcon2 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setThermohalineCirculation({ open: true })} title="Thermohaline Circulation" aria-label="Open thermohaline circulation monitor"><WavesIcon13 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setHydroseismicActivity({ open: true })} title="Hydroseismic Activity" aria-label="Open hydroseismic activity monitor"><ActivityIcon5 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setLavaTubeCave({ open: true })} title="Lava Tube Cave" aria-label="Open lava tube cave monitor"><FlameIcon14 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSubmarineCanyonFisheries({ open: true })} title="Submarine Canyon Fisheries" aria-label="Open submarine canyon fisheries monitor"><FishIcon5 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setPolynyaIce({ open: true })} title="Polynya Ice" aria-label="Open polynya ice monitor"><SnowflakeIcon10 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setVolcanicDomeGrowth({ open: true })} title="Volcanic Dome Growth" aria-label="Open volcanic dome growth monitor"><MountainIcon11 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSeamountBiodiversity({ open: true })} title="Seamount Biodiversity" aria-label="Open seamount biodiversity monitor"><ShellIcon3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setEstuaryAcidification({ open: true })} title="Estuary Acidification" aria-label="Open estuary acidification monitor"><DropletsIcon11 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setAbyssalSedimentFlux({ open: true })} title="Abyssal Sediment Flux" aria-label="Open abyssal sediment flux monitor"><LayersIcon5 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setGlacialMoulin({ open: true })} title="Glacial Moulin Explorer" aria-label="Open glacial moulin explorer"><DropletIcon8 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setIceShelfCalving({ open: true })} title="Ice Shelf Calving" aria-label="Open ice shelf calving monitor"><MountainSnowIcon5 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setVolcanicGasPlume({ open: true })} title="Volcanic Gas Plume" aria-label="Open volcanic gas plume tracker"><CloudCogIcon2 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSubmarineLandslide({ open: true })} title="Submarine Landslide" aria-label="Open submarine landslide monitor"><TriangleAlertIcon3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setCoastalWetlandLoss({ open: true })} title="Coastal Wetland Loss" aria-label="Open coastal wetland loss monitor"><WavesIcon14 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setTundraPermafrostThaw({ open: true })} title="Tundra Permafrost Thaw" aria-label="Open tundra permafrost thaw monitor"><ThermometerIcon9 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setOceanCurrentProfiler({ open: true })} title="Ocean Current Profiler" aria-label="Open ocean current profiler monitor"><CompassIcon4 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setDesertificationFront({ open: true })} title="Desertification Front" aria-label="Open desertification front monitor"><SunIcon8 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setCoralReefRecovery({ open: true })} title="Coral Reef Recovery" aria-label="Open coral reef recovery monitor"><FishIcon6 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setMethaneCrater({ open: true })} title="Methane Crater" aria-label="Open methane crater monitor"><FlameIcon15 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSubglacialVolcano({ open: true })} title="Subglacial Volcano" aria-label="Open subglacial volcano tracker"><FlameIcon16 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setCoralSpawnPrediction({ open: true })} title="Coral Spawn Prediction" aria-label="Open coral spawn prediction"><SparklesIcon6 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setHydrothermalDiffuseFlow({ open: true })} title="Hydrothermal Diffuse Flow" aria-label="Open hydrothermal diffuse flow monitor"><DropletsIcon12 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setPermafrostCarbonPipeline({ open: true })} title="Permafrost Carbon Pipeline" aria-label="Open permafrost carbon pipeline monitor"><AlertTriangleIcon2 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSubaqueousLavaFlow({ open: true })} title="Subaqueous Lava Flow" aria-label="Open subaqueous lava flow monitor"><VolcanoIcon className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setIntertidalZone({ open: true })} title="Intertidal Zone" aria-label="Open intertidal zone monitor"><WavesIcon15 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setDesertFlashFlood({ open: true })} title="Desert Flash Flood" aria-label="Open desert flash flood monitor"><CloudRainIcon5 className="h-4 w-4" /></Button>
          {/* Task 94: New Monitor Buttons */}
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setMudVolcanoActivity({ open: true })} title="Mud Volcano Activity" aria-label="Open mud volcano activity monitor"><MountainIcon12 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setGlacierSurgeEvent({ open: true })} title="Glacier Surge Event" aria-label="Open glacier surge event monitor"><ZapIcon3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSeicheWaveOscillation({ open: true })} title="Seiche Wave Oscillation" aria-label="Open seiche wave oscillation monitor"><WavesIcon16 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setLaharFlowTracker({ open: true })} title="Lahar Flow Tracker" aria-label="Open lahar flow tracker"><CloudRainIcon6 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setIcePenitentMonitor({ open: true })} title="Ice Penitent Monitor" aria-label="Open ice penitent monitor"><SnowflakeIcon11 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setFrostHeaveMonitor({ open: true })} title="Frost Heave Monitor" aria-label="Open frost heave monitor"><ArrowUpIcon3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setPumiceRaftDrift({ open: true })} title="Pumice Raft Drift" aria-label="Open pumice raft drift tracker"><ShipIcon4 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setLimnicEruptionMonitor({ open: true })} title="Limnic Eruption Monitor" aria-label="Open limnic eruption monitor"><SirenIcon2 className="h-4 w-4" /></Button>
          {/* Task 95: New Monitor Buttons */}
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setVolcanicTremor({ open: true })} title="Volcanic Tremor" aria-label="Open volcanic tremor monitor"><ActivityIcon6 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setIceWedgePolygon({ open: true })} title="Ice Wedge Polygon" aria-label="Open ice wedge polygon monitor"><HexagonIcon className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSaltFlatCrust({ open: true })} title="Salt Flat Crust" aria-label="Open salt flat crust monitor"><LayersIcon6 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setColdWaterCoralReef({ open: true })} title="Cold Water Coral Reef" aria-label="Open cold water coral reef monitor"><FishIcon7 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setPeatlandCarbonSink({ open: true })} title="Peatland Carbon Sink" aria-label="Open peatland carbon sink monitor"><TreePineIcon7 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setHyporheicZone({ open: true })} title="Hyporheic Zone" aria-label="Open hyporheic zone monitor"><DropletsIcon13 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSubmarineFan({ open: true })} title="Submarine Fan" aria-label="Open submarine fan monitor"><MountainIcon13 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setCoastalDuneSystem({ open: true })} title="Coastal Dune System" aria-label="Open coastal dune system monitor"><WindIcon11 className="h-4 w-4" /></Button>
          {/* Task 96: New Monitor Buttons */}
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setKarstSpringDischarge({ open: true })} title="Karst Spring Discharge" aria-label="Open karst spring discharge monitor"><DropletIcon9 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setCaveDripMonitor({ open: true })} title="Cave Drip Monitor" aria-label="Open cave drip monitor"><DropletsIcon14 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setTidalCreekMonitor({ open: true })} title="Tidal Creek Monitor" aria-label="Open tidal creek monitor"><WavesIcon17 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSaltMarshCarbon({ open: true })} title="Salt Marsh Carbon" aria-label="Open salt marsh carbon monitor"><LeafIcon7 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setOpalPaleoMonitor({ open: true })} title="Opal Paleo Monitor" aria-label="Open opal paleo monitor"><SparklesIcon7 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setAeolianDustDeposition({ open: true })} title="Aeolian Dust Deposition" aria-label="Open aeolian dust deposition monitor"><WindIcon12 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setKatabaticWindMonitor({ open: true })} title="Katabatic Wind Monitor" aria-label="Open katabatic wind monitor"><SnowflakeIcon12 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSnowAvalancheTracker({ open: true })} title="Snow Avalanche Tracker" aria-label="Open snow avalanche tracker"><TriangleAlertIcon4 className="h-4 w-4" /></Button>
          {/* Task 97: New Monitor Buttons */}
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setRiftValleyVolcano({ open: true })} title="Rift Valley Volcano" aria-label="Open rift valley volcano monitor"><FlameIcon17 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setStreamBankErosion({ open: true })} title="Stream Bank Erosion" aria-label="Open stream bank erosion monitor"><WavesIcon18 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setIceStreamVelocity({ open: true })} title="Ice Stream Velocity" aria-label="Open ice stream velocity monitor"><ArrowUpIcon4 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setCoastalAquifer({ open: true })} title="Coastal Aquifer" aria-label="Open coastal aquifer monitor"><DropletIcon10 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setMangroveRootSystem({ open: true })} title="Mangrove Root System" aria-label="Open mangrove root system monitor"><TreePineIcon8 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setPaleoshorelineTracker({ open: true })} title="Paleoshoreline Tracker" aria-label="Open paleoshoreline tracker"><MapPinnedIcon2 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setCryoconiteGranule({ open: true })} title="Cryoconite Granule" aria-label="Open cryoconite granule monitor"><CircleDotIcon3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSubglacialWaterSystem({ open: true })} title="Subglacial Water System" aria-label="Open subglacial water system monitor"><DropletsIcon15 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setLandslideVelocity({ open: true })} title="Landslide Velocity" aria-label="Open landslide velocity monitor"><TriangleAlertIcon5 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setDebrisFlowSurge({ open: true })} title="Debris Flow Surge" aria-label="Open debris flow surge monitor"><WavesIcon19 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setRockfallImpact({ open: true })} title="Rockfall Impact" aria-label="Open rockfall impact monitor"><MountainIcon14 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSoilCreepRate({ open: true })} title="Soil Creep Rate" aria-label="Open soil creep rate monitor"><ArrowDownIcon5 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSolifluctionLobe({ open: true })} title="Solifluction Lobe" aria-label="Open solifluction lobe monitor"><SnowflakeIcon13 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setEarthflowDisplacement({ open: true })} title="Earthflow Displacement" aria-label="Open earthflow displacement monitor"><TrendingDownIcon4 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSlumpFailure({ open: true })} title="Slump Failure" aria-label="Open slump failure monitor"><AlertTriangleIcon3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setTalusAccumulation({ open: true })} title="Talus Accumulation" aria-label="Open talus accumulation monitor"><LayersIcon7 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setBreakwaterIntegrity({ open: true })} title="Breakwater Integrity" aria-label="Open breakwater integrity monitor"><ShieldIcon3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSeawallErosion({ open: true })} title="Seawall Erosion" aria-label="Open seawall erosion monitor"><WavesIcon20 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setGroinSediment({ open: true })} title="Groin Sediment" aria-label="Open groin sediment monitor"><ArrowRightLeftIcon className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setRevetmentStability({ open: true })} title="Revetment Stability" aria-label="Open revetment stability monitor"><SquareIcon className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setJettyCurrent({ open: true })} title="Jetty Current" aria-label="Open jetty current monitor"><AnchorIcon3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setBeachNourishment({ open: true })} title="Beach Nourishment" aria-label="Open beach nourishment monitor"><SunIcon9 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setCoastalArmor({ open: true })} title="Coastal Armor" aria-label="Open coastal armor monitor"><ShieldCheckIcon className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setShorelineRetreat({ open: true })} title="Shoreline Retreat" aria-label="Open shoreline retreat monitor"><MapIcon3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSoilOrganicCarbon({ open: true })} title="Soil Organic Carbon" aria-label="Open soil organic carbon monitor"><LeafIcon8 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setCationExchange({ open: true })} title="Cation Exchange" aria-label="Open cation exchange monitor"><FlaskConicalIcon2 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSoilPhosphorus({ open: true })} title="Soil Phosphorus" aria-label="Open soil phosphorus monitor"><DropletsIcon16 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSoilCompaction({ open: true })} title="Soil Compaction" aria-label="Open soil compaction monitor"><BoxIcon2 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setClayMineral({ open: true })} title="Clay Mineral" aria-label="Open clay mineral monitor"><GemIcon4 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setPodzolProfile({ open: true })} title="Podzol Profile" aria-label="Open podzol profile monitor"><LayersIcon8 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setGleyRedox({ open: true })} title="Gley Redox" aria-label="Open gley redox monitor"><DropletIcon11 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setCalcicHorizon({ open: true })} title="Calcic Horizon" aria-label="Open calcic Horizon monitor"><MountainIcon15 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setOreGradeAssay({ open: true })} title="Ore Grade Assay" aria-label="Open ore grade assay monitor"><GemIcon5 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setMineTailingsDam({ open: true })} title="Mine Tailings Dam" aria-label="Open mine tailings dam monitor"><AlertTriangleIcon4 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setMineralVeinThickness({ open: true })} title="Mineral Vein Thickness" aria-label="Open mineral vein thickness monitor"><DrillIcon2 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setStripMineRatio({ open: true })} title="Strip Mine Ratio" aria-label="Open strip mine ratio monitor"><ContainerIcon className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setUndergroundMineVent({ open: true })} title="Underground Mine Vent" aria-label="Open underground mine vent monitor"><WindIcon13 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setAcidMineDrainage({ open: true })} title="Acid Mine Drainage" aria-label="Open acid mine drainage monitor"><DropletIcon12 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setOreReserveEstimate({ open: true })} title="Ore Reserve Estimate" aria-label="Open ore reserve estimate monitor"><DatabaseIcon2 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setMineralDepositGrade({ open: true })} title="Mineral Deposit Grade" aria-label="Open mineral deposit grade monitor"><MountainIcon16 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setThermohalineCell({ open: true })} title="Thermohaline Cell" aria-label="Open thermohaline cell monitor"><WavesIcon21 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setEkmanTransport({ open: true })} title="Ekman Transport" aria-label="Open ekman transport monitor"><WindIcon14 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setGeostrophicCurrent({ open: true })} title="Geostrophic Current" aria-label="Open geostrophic current monitor"><CompassIcon5 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setUpwellingIntensity({ open: true })} title="Upwelling Intensity" aria-label="Open upwelling intensity monitor"><ArrowUpIcon5 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setWesternBoundary({ open: true })} title="Western Boundary" aria-label="Open western boundary monitor"><ArrowRightIcon className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setDeepWaterFormation({ open: true })} title="Deep Water Formation" aria-label="Open deep water formation monitor"><ArrowDownIcon6 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setOceanGyre({ open: true })} title="Ocean Gyre" aria-label="Open ocean gyre monitor"><RotateCcwIcon2 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setTropicalCurrent({ open: true })} title="Tropical Current" aria-label="Open tropical current monitor"><SunIcon10 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setJetStreamPosition({ open: true })} title="Jet Stream Position" aria-label="Open jet stream position monitor"><WindIcon15 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setAtmosphericPressureCell({ open: true })} title="Atmospheric Pressure Cell" aria-label="Open atmospheric pressure cell monitor"><GaugeIcon2 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setTropopauseHeight({ open: true })} title="Tropopause Height" aria-label="Open tropopause height monitor"><ArrowUpIcon6 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setRossbyWaveAmplitude({ open: true })} title="Rossby Wave Amplitude" aria-label="Open rossby wave amplitude monitor"><ActivityIcon7 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setHadleyCellCirculation({ open: true })} title="Hadley Cell Circulation" aria-label="Open hadley cell circulation monitor"><RotateCcwIcon3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setAtmosphericRiverFlow({ open: true })} title="Atmospheric River Flow" aria-label="Open atmospheric river flow monitor"><CloudRainIcon7 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setPolarFrontJet({ open: true })} title="Polar Front Jet" aria-label="Open polar front jet monitor"><SnowflakeIcon14 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setTradeWindBelt({ open: true })} title="Trade Wind Belt" aria-label="Open trade wind belt monitor"><ShipIcon5 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSpeciesMigrationRoute({ open: true })} title="Species Migration Route" aria-label="Open species migration route monitor"><BirdIcon5 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setHabitatCorridor({ open: true })} title="Habitat Corridor" aria-label="Open habitat corridor monitor"><TreePineIcon9 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setEndemicHotspot({ open: true })} title="Endemic Hotspot" aria-label="Open endemic hotspot monitor"><SparklesIcon8 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setKeystonePopulation({ open: true })} title="Keystone Population" aria-label="Open keystone population monitor"><BugIcon4 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setWildlifeCorridor({ open: true })} title="Wildlife Corridor" aria-label="Open wildlife corridor monitor"><RouteIcon2 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setBiomeTransition({ open: true })} title="Biome Transition" aria-label="Open biome transition monitor"><LayersIcon9 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setForestCanopyCover({ open: true })} title="Forest Canopy Cover" aria-label="Open forest canopy cover monitor"><TreeDeciduousIcon5 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setWetlandBiodiversityIndex({ open: true })} title="Wetland Biodiversity" aria-label="Open wetland biodiversity index monitor"><DropletsIcon17 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setWatershedDischarge({ open: true })} title="Watershed Discharge" aria-label="Open watershed discharge monitor"><WavesIcon22 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setAquiferRechargeRate({ open: true })} title="Aquifer Recharge Rate" aria-label="Open aquifer recharge rate monitor"><DropletIcon13 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setFloodInundationMap({ open: true })} title="Flood Inundation Map" aria-label="Open flood inundation map monitor"><AlertTriangleIcon5 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setRiverSedimentLoad({ open: true })} title="River Sediment Load" aria-label="Open river sediment load monitor"><LayersIcon10 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setGroundwaterTableLevel({ open: true })} title="Groundwater Table Level" aria-label="Open groundwater table level monitor"><ArrowDownIcon7 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSnowpackWaterEquivalent({ open: true })} title="Snowpack Water Equivalent" aria-label="Open snowpack water equivalent monitor"><SnowflakeIcon15 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setReservoirStorageLevel({ open: true })} title="Reservoir Storage Level" aria-label="Open reservoir storage level monitor"><GaugeIcon3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setBaseflowIndex({ open: true })} title="Baseflow Index" aria-label="Open baseflow index monitor"><DropletsIcon18 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setIceShelfThickness({ open: true })} title="Ice Shelf Thickness" aria-label="Open ice shelf thickness monitor"><MountainSnowIcon6 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSeaIceExtent({ open: true })} title="Sea Ice Extent" aria-label="Open sea ice extent monitor"><SnowflakeIcon16 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setGlacierMassBalance({ open: true })} title="Glacier Mass Balance" aria-label="Open glacier mass balance monitor"><MountainIcon17 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setPermafrostActiveLayer({ open: true })} title="Permafrost Active Layer" aria-label="Open permafrost active layer monitor"><ThermometerIcon22 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setIceCoreRecord({ open: true })} title="Ice Core Record" aria-label="Open ice core record monitor"><FlaskConicalIcon3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSnowCoverDuration({ open: true })} title="Snow Cover Duration" aria-label="Open snow cover duration monitor"><CloudIcon6 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setFrostThawCycle({ open: true })} title="Frost-Thaw Cycle" aria-label="Open frost-thaw cycle monitor"><ThermometerSunIcon2 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setIcebergCalving({ open: true })} title="Iceberg Calving" aria-label="Open iceberg calving monitor"><WavesIcon23 className="h-4 w-4" /></Button>
          {/* Task 107: Space Weather and Geomagnetism */}
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setMagnetopauseStandoff({ open: true })} title="Magnetopause Standoff" aria-label="Open magnetopause standoff monitor"><ShieldIcon4 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setAuroraOvalPosition({ open: true })} title="Aurora Oval Position" aria-label="Open aurora oval position monitor"><SparklesIcon9 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setVanAllenRadiation({ open: true })} title="Van Allen Radiation" aria-label="Open van allen radiation monitor"><RadioIcon3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setIonosphericDisturbance({ open: true })} title="Ionospheric Disturbance" aria-label="Open ionospheric disturbance monitor"><ActivityIcon8 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setCosmicRayFlux({ open: true })} title="Cosmic Ray Flux" aria-label="Open cosmic ray flux monitor"><ZapIcon4 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSolarFluxIndex({ open: true })} title="Solar Flux Index" aria-label="Open solar flux index monitor"><SunIcon11 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSpaceRadiationDose({ open: true })} title="Space Radiation Dose" aria-label="Open space radiation dose monitor"><SirenIcon3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => useMapStore.getState().setSatelliteDrag({ open: true })} title="Satellite Drag" aria-label="Open satellite drag monitor"><SatelliteIcon2 className="h-4 w-4" /></Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden sm:flex map-control-glass h-10 w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() =>
              window.open('https://github.com/maplibre/maplibre-native', '_blank')
            }
            title="GitHub"
            aria-label="View on GitHub"
          >
            <Github className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tool toolbar - left side (desktop only) */}
      <div className="hidden md:block absolute left-4 z-10 transition-all duration-300" style={{ top: '80px' }}>
        {/* Track Record Button - lazy loaded */}
        <div className="mt-2 flex justify-center">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <LazyPanel
                  importFn={() => import('@/components/map/TrackRecorder')}
                  exportName="TrackRecordButton"
                  shouldLoad={loadedPanels.has('topbar')}
                  props={{
                    onClick: () => {
                      const { isRecording, startRecording, stopRecording } = useMapStore.getState()
                      if (isRecording) {
                        stopRecording()
                      } else {
                        if (typeof navigator !== 'undefined' && navigator.geolocation) {
                          startRecording()
                          navigator.geolocation.watchPosition(
                            (position) => {
                              useMapStore.getState().addTrackPoint({
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude,
                                elevation: position.coords.altitude,
                                timestamp: position.timestamp,
                                speed: position.coords.speed,
                                accuracy: position.coords.accuracy,
                              })
                            },
                            (error) => {
                              toast.error(`GPS Error: ${error.message}`)
                            },
                            { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
                          )
                          toast.success('GPS recording started')
                        } else {
                          toast.error('Geolocation is not supported')
                        }
                      }
                    }
                  }}
                />
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                GPS Track Recording
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {/* Measurement Suite & Trail Finder buttons */}
        <div className="mt-2 flex flex-col items-center gap-2">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-11 w-11 rounded-xl transition-all duration-200',
                    measurementSuiteOpen
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setMeasurementSuiteOpen(true)}
                  aria-label="Measurement Suite"
                >
                  <Triangle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Measurement Suite
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-11 w-11 rounded-xl transition-all duration-200',
                    trailFinderOpen
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setTrailFinderOpen(true)}
                  aria-label="Trail Finder"
                >
                  <TreePine className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Trail Finder
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-11 w-11 rounded-xl transition-all duration-200',
                    pedometerVisible
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setPedometerVisible(!useMapStore.getState().pedometerVisible)}
                  aria-label="Pedometer"
                >
                  <Activity className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Pedometer
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-11 w-11 rounded-xl transition-all duration-200',
                    usageStatsOpen
                      ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setUsageStatsOpen(true)}
                  aria-label="Usage Statistics"
                >
                  <PieChart className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Usage Statistics
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-11 w-11 rounded-xl transition-all duration-200',
                    collageCreatorOpen
                      ? 'bg-violet-500 text-white shadow-md shadow-violet-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setCollageCreatorOpen(true)}
                  aria-label="Map Collage Creator"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Map Collage Creator
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-11 w-11 rounded-xl transition-all duration-200',
                    eventsFinderOpen
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setEventsFinderOpen(true)}
                  aria-label="Nearby Events Finder"
                >
                  <CalendarDays className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Nearby Events Finder
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </>
  )
}
