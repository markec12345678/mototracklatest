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
  // Task 108 icons
  Car as CarIcon2,
  Construction as ConstructionIcon,
  Cylinder as PipeIcon,
  Zap as ZapIcon5,
  Trash2 as TrashIcon2,
  Wind as WindIcon16,
  Volume2 as Volume2Icon2,
  ParkingCircle as ParkingIcon,
  // Task 109 icons
  Leaf as LeafIcon9,
  Droplets as DropletsIcon19,
  Droplet as DropletIcon14,
  Bug as BugIcon5,
  FlaskConical as FlaskConicalIcon4,
  Sprout as WheatIcon,
  Thermometer as ThermometerIcon23,
  Footprints as FootprintsIcon3,
  // Task 110 icons
  Wind as WindIcon17,
  Waves as WavesIcon24,
  TreePine as TreePineIcon10,
  Anchor as AnchorIcon4,
  Activity as ActivityIcon9,
  BatteryMedium as BatteryIcon,
  // Task 111 icons
  Biohazard as VirusIcon,
  Syringe as SyringeIcon,
  Droplets as DropletsIcon20,
  Building2 as Building2Icon2,
  CloudCog as CloudCogIcon3,
  Bug as BugIcon6,
  Cherry as AppleIcon,
  Globe as GlobeIcon4,
  // Task 112 icons
  Plane as PlaneIcon,
  Ship as ShipIcon6,
  TrainFront as TrainIcon,
  Route as RouteIcon3,
  Container as ContainerIcon2,
  Users as UsersIcon,
  Fuel as FuelIcon,
  Warehouse as WarehouseIcon,
  // Task 113 icons
  Thermometer as ThermometerIcon24,
  Cloud as CloudIcon7,
  Waves as WavesIcon25,
  Snowflake as SnowflakeIcon17,
  ThermometerSun as ThermometerSunIcon3,
  CloudRain as CloudRainIcon8,
  Mountain as MountainIcon18,
  Droplet as DropletIcon15,
  // Task 114 icons
  Shield as ShieldIcon5,
  Route as RouteIcon4,
  Cross as CrossIcon,
  Search as SearchIcon3,
  Package as PackageIcon,
  Radio as RadioIcon4,
  AlertTriangle as AlertTriangleIcon6,
  Activity as ActivityIcon10,
  // Task 115 icons
  Database as DatabaseIcon3,
  Construction as ConstructionIcon2,
  Droplets as DropletsIcon21,
  FlaskConical as FlaskConicalIcon5,
  Biohazard as BiohazardIcon2,
  CloudRain as CloudRainIcon9,
  GlassWater as GlassWaterIcon,
  Waves as WavesIcon26,
  // Task 116 icons
  Factory as FactoryIcon3,
  FlaskConical as FlaskConicalIcon6,
  Wind as WindIcon18,
  Layers as LayersIcon11,
  Volume2 as Volume2Icon3,
  Moon as MoonIcon3,
  Flame as FlameIcon19,
  Monitor as MonitorIcon,
  // Task 117 icons
  PawPrint as PawPrintIcon,
  Fish as FishIcon8,
  Bird as BirdIcon6,
  Shell as ShellIcon4,
  Bug as BugIcon7,
  Grid3x3 as GridIcon,
  Flower as FlowerIcon,
  Route as RouteIcon5,
  // Task 118 icons
  Activity as ActivityIcon11,
  Flame as FlameIcon20,
  Waves as WavesIcon27,
  Mountain as MountainIcon19,
  ArrowDown as ArrowDownIcon8,
  Split as SplitIcon4,
  Droplet as DropletIcon16,
  TriangleAlert as TriangleAlertIcon6,
  // Task 119 icons
  Sun as SunIcon13,
  Flame as FlameIcon21,
  Cloud as CloudIcon8,
  CloudFog as CloudFogIcon3,
  CloudCog as CloudCogIcon4,
  Wind as WindIcon19,
  CircleDot as CircleDotIcon4,
  FlaskConical as FlaskConicalIcon7,
  // Task 120 icons
  Camera as CameraIcon,
  Building2 as Building2Icon3,
  Trees as TreesIcon,
  Landmark as LandmarkIcon,
  Umbrella as UmbrellaIcon,
  Snowflake as SnowflakeIcon18,
  Ship as ShipIcon7,
  FerrisWheel as FerrisWheelIcon,
  // Task 121 icons
  ShoppingBag as ShoppingBagIcon,
  Store as StoreIcon,
  Utensils as UtensilsIcon,
  ShoppingCart as ShoppingCartIcon,
  Store as StoreIcon2,
  Film as FilmIcon,
  Dumbbell as DumbbellIcon,
  Music as MusicIcon,
  // Task 122 icons
  GraduationCap as GraduationCapIcon,
  Library as LibraryIcon,
  Microscope as MicroscopeIcon,
  FlaskConical as FlaskConicalIcon8,
  Atom as AtomIcon,
  Brain as BrainIcon,
  Lightbulb as LightbulbIcon,
  PencilRuler as PencilRulerIcon,
  // Task 123 icons
  Landmark as LandmarkIcon3,
  TrendingUp as TrendingUpIcon,
  CreditCard as CreditCardIcon,
  Pickaxe as PickaxeIcon,
  Wallet as WalletIcon,
  Rocket as RocketIcon,
  Gem as GemIcon6,
  // Task 124 icons
  Trophy as TrophyIcon,
  Clapperboard as ClapperboardIcon2,
  Music as MusicIcon2,
  Medal as MedalIcon,
  Award as AwardIcon3,
  Flag as FlagIcon3,
  Flag as FlagIcon4,
  Waves as WavesIcon4,
  // Task 125 icons
  Shield as ShieldIcon6,
  Flame as FlameIcon22,
  PhoneCall as PhoneCallIcon,
  Lock as LockIcon3,
  Scale as ScaleIcon,
  DoorOpen as DoorOpenIcon,
  Car as CarIcon3,
  LifeBuoy as LifeBuoyIcon,
  // Task 126 icons
  RadioTower as RadioTowerIcon,
  Globe as GlobeIcon5,
  Server as ServerIcon,
  Radio as RadioIcon5,
  Tv as TvIcon,
  Satellite as SatelliteIcon3,
  Wifi as WifiIcon,
  Shuffle as ShuffleIcon,
  // Task 127 icons
  Building2 as Building2Icon5,
  Stethoscope as StethoscopeIcon,
  Pill as PillIcon,
  Droplet as DropletIcon17,
  Microscope as MicroscopeIcon2,
  Brain as BrainIcon2,
  Accessibility as AccessibilityIcon,
  Syringe as SyringeIcon2,
  // Task 128 icons
  Wheat as WheatIcon2,
  Beef as BeefIcon,
  Milk as MilkIcon,
  Egg as EggIcon,
  Fish as FishIcon9,
  Factory as FactoryIcon4,
  Soup as SoupIcon,
  Snowflake as SnowflakeIcon19,
  // Task 129 icons
  Atom as AtomIcon2,
  Flame as FlameIcon23,
  Factory as FactoryIcon5,
  Waves as WavesIcon28,
  PlugZap as PlugZapIcon,
  Battery as BatteryIcon2,
  Thermometer as ThermometerIcon25,
  Droplet as DropletIcon18,
  // Task 130 icons
  Medal as MedalIcon2,
  Circle as CopperCircleIcon,
  Pickaxe as PickaxeIcon3,
  Mountain as MountainIcon3,
  Diamond as DiamondIcon2,
  Gem as GemIcon8,
  Battery as BatteryIcon3,
  Atom as AtomIcon3,
  // Task 131 icons - Transportation & Logistics Hubs
  PlaneLanding as PlaneLandingIcon,
  ShipWheel as ShipWheelIcon,
  TrainTrack as TrainTrackIcon,
  Warehouse as WarehouseIcon2,
  FlagTriangleRight as FlagTriangleRightIcon,
  Coins as CoinsIcon2,
  Container as ContainerIcon3,
  PackageCheck as PackageCheckIcon,
  // Task 132 icons - Maritime & Shipping
  Radar as RadarIcon,
  Skull as SkullIcon,
  Sailboat as SailboatIcon,
  LifeBuoy as LifeBuoyIcon2,
  Biohazard as BiohazardIcon3,
  Compass as CompassIcon6,
  Recycle as RecycleIcon,
  Fuel as FuelIcon2,
  // Task 133 icons - Aviation & Aerospace
  PlaneTakeoff as PlaneTakeoffIcon,
  Rocket as RocketIcon2,
  CloudRain as CloudRainIcon10,
  Plane as PlaneIcon2,
  Building as BuildingIcon4,
  PlaneLanding as PlaneLandingIcon2,
  SatelliteDish as SatelliteDishIcon,
  Fuel as FuelIcon3,
  // Task 134 icons - Construction & Infrastructure
  HardHat as HardHatIcon,
  Landmark as LandmarkIcon4,
  Wind as WindIcon20,
  ArrowUpDown as ArrowUpDownIcon,
  Droplet as DropletIcon19,
  TrafficCone as TrafficConeIcon,
  Factory as FactoryIcon6,
  Construction as ConstructionIcon3,
  Flame as FlameIcon24,
  Zap as ZapIcon6,
  Cpu as CpuIcon,
  Car as CarIcon4,
  FileText as FileTextIcon,
  Sparkles as SparklesIcon10,
  FlaskConical as FlaskConicalIcon9,
  Shirt as ShirtIcon,
  Anchor as AnchorIcon5,
  Plane as PlaneIcon3,
  Shield as ShieldIcon7,
  Target as TargetIcon,
  Radar as RadarIcon2,
  Crosshair as CrosshairIcon,
  Shield as ShieldIcon8,
  Package as PackageIcon2,
  Landmark as LandmarkIcon5,
  Crown as CrownIcon,
  Scale as ScaleIcon2,
  Flag as FlagIcon5,
  Building2 as Building2Icon6,
  Building as BuildingIcon5,
  Vote as VoteIcon,
  Home as HomeIcon,
  Landmark as LandmarkIcon6,
  Sunrise as SunriseIcon,
  Moon as MoonIcon4,
  Star as StarIcon,
  Flame as FlameIcon25,
  TreePine as TreePineIcon11,
  Mountain as MountainIcon20,
  Footprints as FootprintsIcon4,
  Beer as BeerIcon,
  Grape as GrapeIcon,
  FlaskConical as FlaskConicalIcon10,
  Factory as FactoryIcon7,
  Coffee as CoffeeIcon,
  Leaf as LeafIcon10,
  Citrus as CitrusIcon,
  CupSoda as CupSodaIcon,
  Dices as DicesIcon,
  PawPrint as PawPrintIcon2,
  Fish as FishIcon10,
  Orbit as OrbitIcon2,
  Music as MusicIcon3,
  Palette as PaletteIcon,
  Flower as FlowerIcon2,
  CircleDot as CircleDotIcon5,
  Building2 as Building2Icon7,
  Bath as BathIcon,
  Bed as BedIcon,
  Home as HomeIcon2,
  Key as KeyIcon,
  Calendar as CalendarIcon,
  Building as BuildingIcon7,
  Tent as TentIcon,
  Drumstick as DrumstickIcon,
  Coffee as CoffeeIcon2,
  Croissant as CroissantIcon,
  Utensils as UtensilsIcon2,
  Wine as WineIcon,
  Truck as TruckIcon,
  IceCream as IceCreamIcon,
  Pizza as PizzaIcon,
  Scissors as ScissorsIcon,
  Brush as BrushIcon,
  Flower as FlowerIcon3,
  Heart as HeartIcon,
  SprayCan as SprayCanIcon,
  Hand as HandIcon,
  Smile as SmileIcon,
  Sun as SunIcon14,
  Car as CarIcon5,
  Wrench as WrenchIcon,
  CarFront as CarFrontIcon,
  CircleDot as CircleDotIcon6,
  Droplet as DropletIcon20,
  Gauge as GaugeIcon4,
  Cog as CogIcon,
  KeyRound as KeyRoundIcon,
  // Task 145: Pet & Veterinary icons
  Stethoscope as StethoscopeIcon2,
  Scissors as ScissorsIcon2,
  Home as HomeIcon3,
  Heart as HeartIcon2,
  ShoppingBag as ShoppingBagIcon3,
  TreePine as TreePineIcon12,
  Siren as SirenIcon4,
  Baby as BabyIcon2,
  GraduationCap as GraduationCapIcon2,
  // Task 146: Childcare & Daycare icons
  BookOpen as BookOpenIcon,
  Puzzle as PuzzleIcon,
  Baby as BabyIcon3,
  Backpack as BackpackIcon,
  Apple as AppleIcon2,
  Blocks as BlocksIcon,
  Smile as SmileIcon2,
  Heart as HeartIcon3,
  // Task 147: Hardware & Tools Retail
  Drill as DrillIcon3,
  Cog as CogIcon5,
  Plug as PlugIcon,
  HardHat as HardHatIcon2,
  Bolt as BoltIcon,
  PaintBucket as PaintBucketIcon,
  Sprout as SproutIcon4,
  // Task 148: Jewelry & Watches
  Gem as GemIcon7,
  Watch as WatchIcon2,
  Diamond as DiamondIcon3,
  Diamond as DiamondIcon4,
  Sparkles as SparklesIcon11,
  Crown as CrownIcon2,
  Award as AwardIcon4,
  Hourglass as HourglassIcon,
  // Task 149: Florist & Garden Center icons
  Flower as FlowerIcon4,
  Sprout as SproutIcon5,
  Trees as TreesIcon2,
  Shovel as ShovelIcon,
  Flower2 as Flower2Icon,
  Scissors as ScissorsIcon3,
  Leaf as LeafIcon11,
  Tractor as TractorIcon,
  // Task 150: Home Improvement & Furniture icons
  Sofa as SofaIcon,
  Bed as BedIcon2,
  Lamp as LampIcon,
  LampCeiling as LampCeilingIcon,
  Grid3x3 as Grid3x3Icon,
  Ruler as RulerIcon2,
  Lightbulb as LightbulbIcon2,
  BrickWall as BrickWallIcon,
  Trash2 as Trash2Icon,
  Recycle as RecycleIcon2,
  Trash as TrashIcon,
  Leaf as LeafIcon12,
  Biohazard as BiohazardIcon,
  Anvil as AnvilIcon,
  Cpu as CpuIcon2,
  PackagePlus as PackagePlusIcon,
  Gamepad as GamepadIcon3,
  Blocks as BlocksIcon2,
  Dices as DicesIcon2,
  Book as BookIcon3,
  Palette as PaletteIcon4,
  Plane as PlaneIcon4,
  Bike as BikeIcon3,
  Guitar as GuitarIcon2,
  Piano as PianoIcon2,
  Drum as DrumIcon2,
  Mic as MicIcon2,
  Headphones as HeadphonesIcon2,
  Music4 as MusicIcon4,
  Disc3 as Disc3Icon,
  Dumbbell as DumbbellIcon2,
  Footprints as FootprintsIcon5,
  Tent as TentIcon2,
  Activity as ActivityIcon12,
  Trophy as TrophyIcon2,
  Snowflake as SnowflakeIcon20,
  Waves as WavesIcon29,
  Goal as GoalIcon,
  ShoppingBag as ShoppingBagIcon4,
  Footprints as FootprintsIcon6,
  Store as StoreIcon3,
  Shirt as ShirtIcon2,
  Sparkles as SparklesIcon12,
  Crown as CrownIcon3,
  Scissors as ScissorsIcon4,
  Tag as TagIcon,
  Laptop as LaptopIcon,
  Monitor as MonitorIcon2,
  Smartphone as SmartphoneIcon,
  Tv as TvIcon2,
  Gamepad2 as Gamepad2Icon,
  Camera as CameraIcon2,
  Cctv as CctvIcon,
  Recycle as RecycleIcon3,
  Briefcase as BriefcaseIcon,
  Feather as FeatherIcon,
  Printer as PrinterIcon,
  Clipboard as ClipboardIcon,
  Folder as FolderIcon,
  Pen as PenIcon,
  Highlighter as HighlighterIcon,
  Box as BoxIcon,
  // Task 158: Retail & Commercial Districts mix
  BookOpen as BookOpenIcon2,
  Gift as GiftIcon2,
  Warehouse as WarehouseIcon3,
  PartyPopper as PartyPopperIcon2,
  Pill as PillIcon2,
  Hammer as HammerIcon2,
  Flower2 as Flower2Icon2,
  // Task 159: Home, Hobby & Specialty Retail mix
  ToyBrick as ToyBrickIcon2,
  Watch as WatchIcon3,
  Sofa as SofaIcon2,
  SquareStack as SquareStackIcon,
  Bath as BathIcon2,
  Lightbulb as LightbulbIcon4,
  Palette as PaletteIcon2,
  Crown as CrownIcon4,
  Cigarette as CigaretteIcon,
  Newspaper as NewspaperIcon,
  Dumbbell as DumbbellIcon3,
  Bike as BikeIcon4,
  Waves as WavesIcon6,
  Crosshair as CrosshairIcon3,
  Fish as FishIcon11,
  Beer as BeerIcon3,
  Wine as WineIcon2,
  Coffee as CoffeeIcon3,
  Leaf as LeafIcon2,
  Cookie as CookieIcon,
  Donut as DonutIcon,
  IceCreamCone as IceCreamConeIcon,
  Sandwich as SandwichIcon,
  Pizza as PizzaIcon2,
  Beef as BeefIcon2,
  Soup as SoupIcon2,
  Fish as FishIcon12,
  Drumstick as DrumstickIcon2,
  Croissant as CroissantIcon2,
  Shrimp as ShrimpIcon,
  Egg as EggIcon2,
  Citrus as CitrusIcon2,
  IceCreamCone as IceCreamConeIcon2,
  Candy as CandyIcon,
  HeartPulse as HeartPulseIcon,
  Pill as PillIcon3,
  Sprout as SproutIcon6,
  Wheat as WheatIcon3,
  Globe2 as Globe2Icon3,
  Scale as ScaleIcon3,
  Truck as TruckIcon2,
  CircleDollarSign as CircleDollarSignIcon,
  UtensilsCrossed as UtensilsCrossedIcon,
  PartyPopper as PartyPopperIcon,
  ChefHat as ChefHatIcon,
  HandHeart as HandHeartIcon,
  Soup as SoupIcon3,
  Apple as AppleIcon3,
  HeartPulse as HeartPulseIcon2,
  Building2 as BuildingIcon,
  Hotel as HotelIcon,
  Wine as WineIcon3,
  Beer as BeerIcon2,
  Beaker as BeakerIcon,
  Grape as GrapeIcon2,
  Cake as CakeIcon,
  Building as BuildingIcon3,
  Music as MusicIcon5,
  Trophy as TrophyIcon3,
  Film as FilmIcon2,
  Landmark as LandmarkIcon2,
  Palette as PaletteIcon3,
  Ship as ShipIcon2,
  Plane as PlaneIcon5,
  Coffee as CoffeeIcon4,
  BellRing as BellRingIcon,
  Spade as SpadeIcon,
  Crown as CrownIcon5,
  Fish as FishIcon13,
  PawPrint as PawPrintIcon3,
  Leaf as LeafIcon3,
  Mountain as MountainIcon5,
  // Task 168: Travel & Recreation Venue monitors
  Palmtree as PalmtreeIcon,
  Snowflake as SnowflakeIcon6,
  Flag as FlagIcon6,
  Sailboat as SailboatIcon2,
  Dices as DicesIcon3,
  Milestone as MilestoneIcon,
  Train as TrainIcon2,
  Ship as ShipIcon8,
  // Task 169: Sports & Event Venue monitors
  Plane as PlaneIcon6,
  Trophy as TrophyIcon4,
  Car as CarIcon6,
  PersonStanding as PersonStandingIcon,
  Goal as GoalIcon2,
  Volleyball as VolleyballIcon,
  Flag as FlagIcon7,
  Dumbbell as DumbbellIcon4,
  // Task 170: Outdoor Recreation & Amusement Venue monitors
  Beer as BeerIcon4,
  Umbrella as UmbrellaIcon2,
  TreePalm as TreePalmIcon,
  Sailboat as SailboatIcon3,
  Wine as WineIcon4,
  FerrisWheel as FerrisWheelIcon2,
  Film as FilmIcon4,
  Flag as FlagIcon,
  Car as CarIcon,
  Disc3 as Disc3Icon2,
  CloudSnow as CloudSnowIcon,
  SprayCan as SprayCanIcon2,
  Cable as CableIcon,
  MoveVertical as MoveVerticalIcon,
  Zap as ZapIcon,
  Crosshair as CrosshairIcon2,
  Lock as LockIcon,
  Axe as AxeIcon,
  Radical as RadicalIcon,
  Disc as DiscIcon,
  Bike as BikeIcon,
  Mountain as MountainIcon21,
  CircleDot as CircleDotIcon1,
  Wind as WindIcon1,
  Waves as WavesIcon1,
  Bird as BirdIcon1,
  Sailboat as SailboatIcon1,
  Droplets as DropletsIcon1,
  Anchor as AnchorIcon,
  Shell as ShellIcon,
  // Task 174 icons: Water Concession & Wellness Retreat
  Waves as WavesIcon30,
  Wind as WindIcon5,
  Ship as ShipIcon1,
  Anchor as AnchorIcon1,
  Palmtree as PalmtreeIcon1,
  Sparkles as SparklesIcon1,
  Gem as GemIcon,
  Flower as FlowerIcon1,
  // Task 175 icons: Thermal & Mind-Body Wellness Retreat
  Flame as FlameIcon1,
  Cloud as CloudIcon1,
  Snowflake as SnowflakeIcon1,
  Droplet as DropletIcon1,
  Moon as MoonIcon1,
  Leaf as LeafIcon1,
  Star as StarIcon1,
  Heart as HeartIcon1,
  // Task 176 icons: Holistic & Integrative Wellness Clinic
  Flame as FlameIcon18,
  ConciergeBell as ConciergeBellIcon1,
  Flower as FlowerIcon5,
  HandHeart as HandHeartIcon1,
  Sparkle as SparkleIcon1,
  Activity as ActivityIcon1,
  Stethoscope as StethoscopeIcon1,
  Leaf as LeafIcon13,
  Scissors as ScissorsIcon5,
  Brush as BrushIcon1,
  Hand as HandIcon1,
  Sparkles as SparklesIcon13,
  Eye as EyeIcon3,
  Flame as FlameIcon26,
  Palette as PaletteIcon5,
  Sun as SunIcon15,
  Wrench as WrenchIcon1,
  Disc as DiscIcon1,
  Droplet as DropletIcon21,
  Car as CarIcon7,
  Package as PackageIcon3,
  Hammer as HammerIcon3,
  Wind as WindIcon21,
  Cog as CogIcon6,
  Landmark as LandmarkIcon7,
  Building2 as Building2Icon8,
  Calculator as CalculatorIcon,
  Receipt as ReceiptIcon,
  Shield as ShieldIcon9,
  Scale as ScaleIcon4,
  Stamp as StampIcon,
  Briefcase as BriefcaseIcon2,
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
  // Task 108: Urban Infrastructure & Smart City
  const trafficFlowMonitorOpen = useMapStore((s) => s.trafficFlowMonitor.open)
  const bridgeStructuralHealthOpen = useMapStore((s) => s.bridgeStructuralHealth.open)
  const waterPipeNetworkOpen = useMapStore((s) => s.waterPipeNetwork.open)
  const powerGridLoadOpen = useMapStore((s) => s.powerGridLoad.open)
  const wasteCollectionRouteOpen = useMapStore((s) => s.wasteCollectionRoute.open)
  const airQualityUrbanOpen = useMapStore((s) => s.airQualityUrban.open)
  const noiseLevelMapperOpen = useMapStore((s) => s.noiseLevelMapper.open)
  const smartParkingCapacityOpen = useMapStore((s) => s.smartParkingCapacity.open)
  // Task 109: Agricultural Monitoring & Precision Farming
  const cropHealthIndexOpen = useMapStore((s) => s.cropHealthIndex.open)
  const soilMoistureFieldOpen = useMapStore((s) => s.soilMoistureField.open)
  const irrigationEfficiencyOpen = useMapStore((s) => s.irrigationEfficiency.open)
  const pestOutbreakTrackerOpen = useMapStore((s) => s.pestOutbreakTracker.open)
  const fertilizerRunoffOpen = useMapStore((s) => s.fertilizerRunoff.open)
  const harvestYieldPredictOpen = useMapStore((s) => s.harvestYieldPredict.open)
  const greenhouseClimateOpen = useMapStore((s) => s.greenhouseClimate.open)
  const livestockMovementOpen = useMapStore((s) => s.livestockMovement.open)
  // Task 110: Renewable Energy & Grid Monitoring
  const windFarmOutputOpen = useMapStore((s) => s.windFarmOutput.open)
  const hydroelectricFlowOpen = useMapStore((s) => s.hydroelectricFlow.open)
  const biomassEnergyYieldOpen = useMapStore((s) => s.biomassEnergyYield.open)
  const tidalEnergyPotentialOpen = useMapStore((s) => s.tidalEnergyPotential.open)
  const gridStabilityIndexOpen = useMapStore((s) => s.gridStabilityIndex.open)
  const energyStorageLevelOpen = useMapStore((s) => s.energyStorageLevel.open)
  // Task 111: Public Health & Epidemiology
  const diseaseOutbreakMapOpen = useMapStore((s) => s.diseaseOutbreakMap.open)
  const vaccinationCoverageOpen = useMapStore((s) => s.vaccinationCoverage.open)
  const waterQualityIndexOpen = useMapStore((s) => s.waterQualityIndex.open)
  const hospitalCapacityOpen = useMapStore((s) => s.hospitalCapacity.open)
  const airPollutionHealthOpen = useMapStore((s) => s.airPollutionHealth.open)
  const vectorHabitatRiskOpen = useMapStore((s) => s.vectorHabitatRisk.open)
  const nutritionSecurityOpen = useMapStore((s) => s.nutritionSecurity.open)
  const pandemicSpreadRateOpen = useMapStore((s) => s.pandemicSpreadRate.open)
  // Task 112: Transportation & Logistics
  const flightPathTrackerOpen = useMapStore((s) => s.flightPathTracker.open)
  const portCongestionMapOpen = useMapStore((s) => s.portCongestionMap.open)
  const railNetworkStatusOpen = useMapStore((s) => s.railNetworkStatus.open)
  const highwayBottleneckOpen = useMapStore((s) => s.highwayBottleneck.open)
  const cargoShipTrackerOpen = useMapStore((s) => s.cargoShipTracker.open)
  const transitRidershipOpen = useMapStore((s) => s.transitRidership.open)
  const fuelStationNetworkOpen = useMapStore((s) => s.fuelStationNetwork.open)
  const logisticsDepotStatusOpen = useMapStore((s) => s.logisticsDepotStatus.open)
  // Task 113: Climate Change Indicators
  const globalTemperatureAnomalyOpen = useMapStore((s) => s.globalTemperatureAnomaly.open)
  const co2AtmosphericOpen = useMapStore((s) => s.co2Atmospheric.open)
  const seaLevelRiseTrackOpen = useMapStore((s) => s.seaLevelRiseTrack.open)
  const iceCapExtentOpen = useMapStore((s) => s.iceCapExtent.open)
  const permafrostThawTrackOpen = useMapStore((s) => s.permafrostThawTrack.open)
  const extremeWeatherIndexOpen = useMapStore((s) => s.extremeWeatherIndex.open)
  const glacierRetreatTrackOpen = useMapStore((s) => s.glacierRetreatTrack.open)
  const oceanAcidificationTrackOpen = useMapStore((s) => s.oceanAcidificationTrack.open)
  // Task 114: Disaster Response & Emergency Management
  const emergencyShelterMapOpen = useMapStore((s) => s.emergencyShelterMap.open)
  const evacuationRouteOpen = useMapStore((s) => s.evacuationRoute.open)
  const firstAidStationOpen = useMapStore((s) => s.firstAidStation.open)
  const searchRescueGridOpen = useMapStore((s) => s.searchRescueGrid.open)
  const supplyChainReliefOpen = useMapStore((s) => s.supplyChainRelief.open)
  const communicationNetworkOpen = useMapStore((s) => s.communicationNetwork.open)
  const damageAssessmentOpen = useMapStore((s) => s.damageAssessment.open)
  const casualtyTrackingOpen = useMapStore((s) => s.casualtyTracking.open)
  // Task 115: Water Resources Management
  const reservoirCapacityOpen = useMapStore((s) => s.reservoirCapacity.open)
  const damIntegrityOpen = useMapStore((s) => s.damIntegrity.open)
  const irrigationCommandOpen = useMapStore((s) => s.irrigationCommand.open)
  const waterTreatmentPlantOpen = useMapStore((s) => s.waterTreatmentPlant.open)
  const watershedPollutionOpen = useMapStore((s) => s.watershedPollution.open)
  const floodControlSystemOpen = useMapStore((s) => s.floodControlSystem.open)
  const drinkingWaterQualityOpen = useMapStore((s) => s.drinkingWaterQuality.open)
  const desalinationOutputOpen = useMapStore((s) => s.desalinationOutput.open)
  // Task 116: Environmental Pollution & Industrial Monitoring
  const industrialEmissionOpen = useMapStore((s) => s.industrialEmission.open)
  const chemicalSpillTrackerOpen = useMapStore((s) => s.chemicalSpillTracker.open)
  const airToxicMonitorOpen = useMapStore((s) => s.airToxicMonitor.open)
  const soilContaminationMapOpen = useMapStore((s) => s.soilContaminationMap.open)
  const noiseIndustrialMonitorOpen = useMapStore((s) => s.noiseIndustrialMonitor.open)
  const lightPollutionAtlasOpen = useMapStore((s) => s.lightPollutionAtlas.open)
  const thermalPollutionMonitorOpen = useMapStore((s) => s.thermalPollutionMonitor.open)
  const ewasteDumpMonitorOpen = useMapStore((s) => s.ewasteDumpMonitor.open)
  // Task 117: Wildlife Conservation & Biodiversity
  const endangeredSpeciesOpen = useMapStore((s) => s.endangeredSpecies.open)
  const marineMammalTrackerOpen = useMapStore((s) => s.marineMammalTracker.open)
  const birdMigrationFlywayOpen = useMapStore((s) => s.birdMigrationFlyway.open)
  const coralReefBleachingTrackOpen = useMapStore((s) => s.coralReefBleachingTrack.open)
  const invasiveSpeciesTrackOpen = useMapStore((s) => s.invasiveSpeciesTrack.open)
  const habitatFragmentationOpen = useMapStore((s) => s.habitatFragmentation.open)
  const biodiversityHotspotOpen = useMapStore((s) => s.biodiversityHotspot.open)
  const wildlifeCorridorMapTrackOpen = useMapStore((s) => s.wildlifeCorridorMapTrack.open)
  // Task 118: Geological Hazards & Tectonic Activity
  const earthquakeForecastTrackOpen = useMapStore((s) => s.earthquakeForecastTrack.open)
  const volcanoEruptionAlertTrackOpen = useMapStore((s) => s.volcanoEruptionAlertTrack.open)
  const tsunamiWarningTrackOpen = useMapStore((s) => s.tsunamiWarningTrack.open)
  const landslideHazardMapTrackOpen = useMapStore((s) => s.landslideHazardMapTrack.open)
  const subsidenceMonitorTrackOpen = useMapStore((s) => s.subsidenceMonitorTrack.open)
  const faultLineActivityOpen = useMapStore((s) => s.faultLineActivity.open)
  const geothermalActivityTrackOpen = useMapStore((s) => s.geothermalActivityTrack.open)
  const rockburstRiskMonitorOpen = useMapStore((s) => s.rockburstRiskMonitor.open)
  // Task 119: Atmospheric Chemistry & Air Quality
  const ozoneLayerTrack119Open = useMapStore((s) => s.ozoneLayerTrack119.open)
  const methaneEmissionSourceTrackOpen = useMapStore((s) => s.methaneEmissionSourceTrack.open)
  const aerosolOpticalDepthOpen = useMapStore((s) => s.aerosolOpticalDepth.open)
  const nitrogenDioxideColumnOpen = useMapStore((s) => s.nitrogenDioxideColumn.open)
  const sulfurDioxideFluxOpen = useMapStore((s) => s.sulfurDioxideFlux.open)
  const carbonMonoxideColumnOpen = useMapStore((s) => s.carbonMonoxideColumn.open)
  const particulateMatterTrack119Open = useMapStore((s) => s.particulateMatterTrack119.open)
  const vocConcentrationMapOpen = useMapStore((s) => s.vocConcentrationMap.open)
  // Task 120: Tourism & Travel Infrastructure
  const touristAttractionMonitorOpen = useMapStore((s) => s.touristAttractionMonitor.open)
  const hotelOccupancyMonitorOpen = useMapStore((s) => s.hotelOccupancyMonitor.open)
  const nationalParkVisitorMonitorOpen = useMapStore((s) => s.nationalParkVisitorMonitor.open)
  const museumFootfallMonitorOpen = useMapStore((s) => s.museumFootfallMonitor.open)
  const beachSafetyMonitorOpen = useMapStore((s) => s.beachSafetyMonitor.open)
  const skiResortConditionMonitorOpen = useMapStore((s) => s.skiResortConditionMonitor.open)
  const cruisePortActivityMonitorOpen = useMapStore((s) => s.cruisePortActivityMonitor.open)
  const themeParkQueueMonitorOpen = useMapStore((s) => s.themeParkQueueMonitor.open)
  // Task 121: Retail & Commercial Intelligence
  const shoppingMallTrafficOpen = useMapStore((s) => s.shoppingMallTraffic.open)
  const retailStorePerformanceOpen = useMapStore((s) => s.retailStorePerformance.open)
  const restaurantOccupancyOpen = useMapStore((s) => s.restaurantOccupancy.open)
  const supermarketQueueOpen = useMapStore((s) => s.supermarketQueue.open)
  const streetMarketActivityOpen = useMapStore((s) => s.streetMarketActivity.open)
  const cinemaTheaterAttendanceOpen = useMapStore((s) => s.cinemaTheaterAttendance.open)
  const gymFitnessCenterOpen = useMapStore((s) => s.gymFitnessCenter.open)
  const nightlifeVenueOpen = useMapStore((s) => s.nightlifeVenue.open)
  // Task 122: Education & Research Institutions
  const universityCampusMonitorOpen = useMapStore((s) => s.universityCampusMonitor.open)
  const libraryResourceMonitorOpen = useMapStore((s) => s.libraryResourceMonitor.open)
  const laboratorySafetyMonitorOpen = useMapStore((s) => s.laboratorySafetyMonitor.open)
  const researchOutputMonitorOpen = useMapStore((s) => s.researchOutputMonitor.open)
  const studentEnrollmentMonitorOpen = useMapStore((s) => s.studentEnrollmentMonitor.open)
  const academicCitationMonitorOpen = useMapStore((s) => s.academicCitationMonitor.open)
  const innovationPatentMonitorOpen = useMapStore((s) => s.innovationPatentMonitor.open)
  const fieldStationResearchOpen = useMapStore((s) => s.fieldStationResearch.open)
  // Task 123: Financial & Banking Centers
  const bankBranchTrafficOpen = useMapStore((s) => s.bankBranchTraffic.open)
  const stockExchangeMonitorOpen = useMapStore((s) => s.stockExchangeMonitor.open)
  const atmNetworkStatusOpen = useMapStore((s) => s.atmNetworkStatus.open)
  const cryptocurrencyMiningOpen = useMapStore((s) => s.cryptocurrencyMining.open)
  const insuranceClaimCenterOpen = useMapStore((s) => s.insuranceClaimCenter.open)
  const paymentGatewayStatusOpen = useMapStore((s) => s.paymentGatewayStatus.open)
  const fintechHubActivityOpen = useMapStore((s) => s.fintechHubActivity.open)
  const goldReserveVaultOpen = useMapStore((s) => s.goldReserveVault.open)
  // Task 124: Sports & Entertainment Venues
  const stadiumCrowdMonitorOpen = useMapStore((s) => s.stadiumCrowdMonitor.open)
  const arenaEventMonitorOpen = useMapStore((s) => s.arenaEventMonitor.open)
  const concertVenueMonitorOpen = useMapStore((s) => s.concertVenueMonitor.open)
  const sportLeagueStandingOpen = useMapStore((s) => s.sportLeagueStanding.open)
  const olympicVenueMonitorOpen = useMapStore((s) => s.olympicVenueMonitor.open)
  const racetrackActivityOpen = useMapStore((s) => s.racetrackActivity.open)
  const golfCourseStatusOpen = useMapStore((s) => s.golfCourseStatus.open)
  const waterParkCapacityOpen = useMapStore((s) => s.waterParkCapacity.open)
  // Task 125: Public Safety & Law Enforcement
  const policeStationStatusOpen = useMapStore((s) => s.policeStationStatus.open)
  const fireDepartmentResponseOpen = useMapStore((s) => s.fireDepartmentResponse.open)
  const emergencyDispatch911Open = useMapStore((s) => s.emergencyDispatch911.open)
  const prisonFacilityMonitorOpen = useMapStore((s) => s.prisonFacilityMonitor.open)
  const courtHouseScheduleOpen = useMapStore((s) => s.courtHouseSchedule.open)
  const borderPatrolActivityOpen = useMapStore((s) => s.borderPatrolActivity.open)
  const trafficEnforcementUnitOpen = useMapStore((s) => s.trafficEnforcementUnit.open)
  const disasterResponseCoordOpen = useMapStore((s) => s.disasterResponseCoord.open)
  // Task 126: Telecommunications & Broadcasting
  const cellTowerNetworkOpen = useMapStore((s) => s.cellTowerNetwork.open)
  const fiberOpticBackboneOpen = useMapStore((s) => s.fiberOpticBackbone.open)
  const dataCenterCloudOpen = useMapStore((s) => s.dataCenterCloud.open)
  const radioBroadcastStationOpen = useMapStore((s) => s.radioBroadcastStation.open)
  const tvTransmissionTowerOpen = useMapStore((s) => s.tvTransmissionTower.open)
  const satelliteGroundStationOpen = useMapStore((s) => s.satelliteGroundStation.open)
  const wifiHotspotNetworkOpen = useMapStore((s) => s.wifiHotspotNetwork.open)
  const internetExchangePointOpen = useMapStore((s) => s.internetExchangePoint.open)
  // Task 127: Healthcare & Medical Facilities
  const hospitalCapacityTrack127Open = useMapStore((s) => s.hospitalCapacityTrack127.open)
  const clinicUrgentCareOpen = useMapStore((s) => s.clinicUrgentCare.open)
  const pharmacyNetworkOpen = useMapStore((s) => s.pharmacyNetwork.open)
  const bloodBankSupplyOpen = useMapStore((s) => s.bloodBankSupply.open)
  const medicalResearchLabOpen = useMapStore((s) => s.medicalResearchLab.open)
  const mentalHealthCenterOpen = useMapStore((s) => s.mentalHealthCenter.open)
  const rehabilitationCenterOpen = useMapStore((s) => s.rehabilitationCenter.open)
  const vaccinationDriveOpen = useMapStore((s) => s.vaccinationDrive.open)
  // Task 128: Agricultural Production & Food Supply
  const cropYieldForecastOpen = useMapStore((s) => s.cropYieldForecast.open)
  const livestockPopulationOpen = useMapStore((s) => s.livestockPopulation.open)
  const dairyFarmProductionOpen = useMapStore((s) => s.dairyFarmProduction.open)
  const poultryFarmOutputOpen = useMapStore((s) => s.poultryFarmOutput.open)
  const aquacultureFisheryOpen = useMapStore((s) => s.aquacultureFishery.open)
  const grainSiloStorageOpen = useMapStore((s) => s.grainSiloStorage.open)
  const foodProcessingPlantOpen = useMapStore((s) => s.foodProcessingPlant.open)
  const coldChainLogisticsOpen = useMapStore((s) => s.coldChainLogistics.open)
  // Task 129: Energy Generation & Utilities
  const nuclearPowerPlantOpen = useMapStore((s) => s.nuclearPowerPlant.open)
  const naturalGasTerminalOpen = useMapStore((s) => s.naturalGasTerminal.open)
  const coalPowerStationOpen = useMapStore((s) => s.coalPowerStation.open)
  const hydroelectricDamOpen = useMapStore((s) => s.hydroelectricDam.open)
  const evChargingNetworkOpen = useMapStore((s) => s.evChargingNetwork.open)
  const batteryStorageFacilityOpen = useMapStore((s) => s.batteryStorageFacility.open)
  const districtHeatingPlantOpen = useMapStore((s) => s.districtHeatingPlant.open)
  const waterTreatmentUtilityOpen = useMapStore((s) => s.waterTreatmentUtility.open)
  // Task 130: Mining, Minerals & Raw Materials
  const goldMineOperationOpen = useMapStore((s) => s.goldMineOperation.open)
  const copperMineOutputOpen = useMapStore((s) => s.copperMineOutput.open)
  const ironOreExtractionOpen = useMapStore((s) => s.ironOreExtraction.open)
  const coalMineProductionOpen = useMapStore((s) => s.coalMineProduction.open)
  const diamondMineOutputOpen = useMapStore((s) => s.diamondMineOutput.open)
  const rareEarthMineralOpen = useMapStore((s) => s.rareEarthMineral.open)
  const lithiumExtractionOpen = useMapStore((s) => s.lithiumExtraction.open)
  const uraniumMiningSiteOpen = useMapStore((s) => s.uraniumMiningSite.open)
  // Task 131: Transportation & Logistics Hubs
  const airportTerminalStatusOpen = useMapStore((s) => s.airportTerminalStatus.open)
  const seaportContainerTerminalOpen = useMapStore((s) => s.seaportContainerTerminal.open)
  const railwayStationTrafficOpen = useMapStore((s) => s.railwayStationTraffic.open)
  const cargoWarehouseStatusOpen = useMapStore((s) => s.cargoWarehouseStatus.open)
  const borderCrossingQueueOpen = useMapStore((s) => s.borderCrossingQueue.open)
  const highwayTollPlazaOpen = useMapStore((s) => s.highwayTollPlaza.open)
  const inlandContainerDepotOpen = useMapStore((s) => s.inlandContainerDepot.open)
  const lastMileDeliveryHubOpen = useMapStore((s) => s.lastMileDeliveryHub.open)
  // Task 132: Maritime & Shipping
  const vesselTrafficManagementOpen = useMapStore((s) => s.vesselTrafficManagement.open)
  const maritimePiracyAlertOpen = useMapStore((s) => s.maritimePiracyAlert.open)
  const lighthouseNavigationOpen = useMapStore((s) => s.lighthouseNavigation.open)
  const searchAndRescueOperationOpen = useMapStore((s) => s.searchAndRescueOperation.open)
  const marinePollutionResponseOpen = useMapStore((s) => s.marinePollutionResponse.open)
  const coastalPilotServiceOpen = useMapStore((s) => s.coastalPilotService.open)
  const shipbreakingYardOpen = useMapStore((s) => s.shipbreakingYard.open)
  const maritimeFuelBunkerOpen = useMapStore((s) => s.maritimeFuelBunker.open)
  // Task 133: Aviation & Aerospace
  const airTrafficControlOpen = useMapStore((s) => s.airTrafficControl.open)
  const spaceportLaunchSiteOpen = useMapStore((s) => s.spaceportLaunchSite.open)
  const weatherRadarStationOpen = useMapStore((s) => s.weatherRadarStation.open)
  const flightRouteCongestionOpen = useMapStore((s) => s.flightRouteCongestion.open)
  const aircraftHangarFacilityOpen = useMapStore((s) => s.aircraftHangarFacility.open)
  const runwayOccupancyOpen = useMapStore((s) => s.runwayOccupancy.open)
  const satelliteLaunchScheduleOpen = useMapStore((s) => s.satelliteLaunchSchedule.open)
  const aviationFuelDepotOpen = useMapStore((s) => s.aviationFuelDepot.open)
  // Task 134: Construction & Infrastructure
  const megaProjectConstructionOpen = useMapStore((s) => s.megaProjectConstruction.open)
  const bridgeStructuralIntegrityOpen = useMapStore((s) => s.bridgeStructuralIntegrity.open)
  const tunnelVentilationSystemOpen = useMapStore((s) => s.tunnelVentilationSystem.open)
  const skyscraperElevatorOpen = useMapStore((s) => s.skyscraperElevator.open)
  const damConstructionProgressOpen = useMapStore((s) => s.damConstructionProgress.open)
  const highwayExpansionProjectOpen = useMapStore((s) => s.highwayExpansionProject.open)
  const cementPlantOutputOpen = useMapStore((s) => s.cementPlantOutput.open)
  const craneFleetOperationOpen = useMapStore((s) => s.craneFleetOperation.open)
  const steelMillOperationOpen = useMapStore((s) => s.steelMillOperation.open)
  const aluminumSmelterOpen = useMapStore((s) => s.aluminumSmelter.open)
  const semiconductorFabOpen = useMapStore((s) => s.semiconductorFab.open)
  const automobileAssemblyPlantOpen = useMapStore((s) => s.automobileAssemblyPlant.open)
  const paperPulpMillOpen = useMapStore((s) => s.paperPulpMill.open)
  const glassManufacturingOpen = useMapStore((s) => s.glassManufacturing.open)
  const chemicalProcessingPlantOpen = useMapStore((s) => s.chemicalProcessingPlant.open)
  const textileMillOperationOpen = useMapStore((s) => s.textileMillOperation.open)
  const navalBaseOperationOpen = useMapStore((s) => s.navalBaseOperation.open)
  const airForceBaseOpen = useMapStore((s) => s.airForceBase.open)
  const armyBaseReadinessOpen = useMapStore((s) => s.armyBaseReadiness.open)
  const missileDefenseBatteryOpen = useMapStore((s) => s.missileDefenseBattery.open)
  const earlyWarningRadarOpen = useMapStore((s) => s.earlyWarningRadar.open)
  const militaryTrainingRangeOpen = useMapStore((s) => s.militaryTrainingRange.open)
  const commandBunkerFacilityOpen = useMapStore((s) => s.commandBunkerFacility.open)
  const defenseLogisticsDepotOpen = useMapStore((s) => s.defenseLogisticsDepot.open)
  const parliamentChamberOpen = useMapStore((s) => s.parliamentChamber.open)
  const presidentialPalaceOpen = useMapStore((s) => s.presidentialPalace.open)
  const supremeCourtOpen = useMapStore((s) => s.supremeCourt.open)
  const embassyCompoundOpen = useMapStore((s) => s.embassyCompound.open)
  const ministryHeadquartersOpen = useMapStore((s) => s.ministryHeadquarters.open)
  const cityHallCivicOpen = useMapStore((s) => s.cityHallCivic.open)
  const stateLegislatureOpen = useMapStore((s) => s.stateLegislature.open)
  const governorMansionOpen = useMapStore((s) => s.governorMansion.open)
  const cathedralBasilicaOpen = useMapStore((s) => s.cathedralBasilica.open)
  const buddhistTempleOpen = useMapStore((s) => s.buddhistTemple.open)
  const mosqueCompoundOpen = useMapStore((s) => s.mosqueCompound.open)
  const synagogueHeritageOpen = useMapStore((s) => s.synagogueHeritage.open)
  const hinduTempleOpen = useMapStore((s) => s.hinduTemple.open)
  const shintoShrineOpen = useMapStore((s) => s.shintoShrine.open)
  const monasteryAbbeyOpen = useMapStore((s) => s.monasteryAbbey.open)
  const pilgrimageSiteOpen = useMapStore((s) => s.pilgrimageSite.open)
  const breweryFermentationOpen = useMapStore((s) => s.breweryFermentation.open)
  const wineryVineyardCellarOpen = useMapStore((s) => s.wineryVineyardCellar.open)
  const distilleryOperationOpen = useMapStore((s) => s.distilleryOperation.open)
  const bottlingPlantLineOpen = useMapStore((s) => s.bottlingPlantLine.open)
  const coffeeRoasteryBatchOpen = useMapStore((s) => s.coffeeRoasteryBatch.open)
  const teaProcessingFacilityOpen = useMapStore((s) => s.teaProcessingFacility.open)
  const juiceProcessingLineOpen = useMapStore((s) => s.juiceProcessingLine.open)
  const softDrinkBottlingOpen = useMapStore((s) => s.softDrinkBottling.open)
  const casinoGamingFloorOpen = useMapStore((s) => s.casinoGamingFloor.open)
  const zooWildlifeParkOpen = useMapStore((s) => s.zooWildlifePark.open)
  const aquariumMarineExhibitOpen = useMapStore((s) => s.aquariumMarineExhibit.open)
  const planetariumShowOpen = useMapStore((s) => s.planetariumShow.open)
  const operaHouseScheduleOpen = useMapStore((s) => s.operaHouseSchedule.open)
  const artGalleryExhibitOpen = useMapStore((s) => s.artGalleryExhibit.open)
  const botanicalGardenOpen = useMapStore((s) => s.botanicalGarden.open)
  const bowlingAlleyLaneOpen = useMapStore((s) => s.bowlingAlleyLane.open)
  const hotelChainOperationOpen = useMapStore((s) => s.hotelChainOperation.open)
  const resortSpaWellnessOpen = useMapStore((s) => s.resortSpaWellness.open)
  const hostelBackpackerOpen = useMapStore((s) => s.hostelBackpacker.open)
  const bedBreakfastInnOpen = useMapStore((s) => s.bedBreakfastInn.open)
  const vacationRentalPropertyOpen = useMapStore((s) => s.vacationRentalProperty.open)
  const conventionCenterBookingOpen = useMapStore((s) => s.conventionCenterBooking.open)
  const servicedApartmentOpen = useMapStore((s) => s.servicedApartment.open)
  const campgroundRvParkOpen = useMapStore((s) => s.campgroundRvPark.open)
  const fastFoodChainOpen = useMapStore((s) => s.fastFoodChain.open)
  const coffeeShopCafeOpen = useMapStore((s) => s.coffeeShopCafe.open)
  const bakeryPastryShopOpen = useMapStore((s) => s.bakeryPastryShop.open)
  const fineDiningRestaurantOpen = useMapStore((s) => s.fineDiningRestaurant.open)
  const barPubTavernOpen = useMapStore((s) => s.barPubTavern.open)
  const foodTruckFleetOpen = useMapStore((s) => s.foodTruckFleet.open)
  const iceCreamParlorOpen = useMapStore((s) => s.iceCreamParlor.open)
  const pizzeriaChainOpen = useMapStore((s) => s.pizzeriaChain.open)
  const hairSalonChainOpen = useMapStore((s) => s.hairSalonChain.open)
  const barberShopClassicOpen = useMapStore((s) => s.barberShopClassic.open)
  const nailSpaManicureOpen = useMapStore((s) => s.nailSpaManicure.open)
  const tattooParlorStudioOpen = useMapStore((s) => s.tattooParlorStudio.open)
  const cosmeticsBeautyStoreOpen = useMapStore((s) => s.cosmeticsBeautyStore.open)
  const massageTherapySpaOpen = useMapStore((s) => s.massageTherapySpa.open)
  const estheticianMedSpaOpen = useMapStore((s) => s.estheticianMedSpa.open)
  const tanningSalonStudioOpen = useMapStore((s) => s.tanningSalonStudio.open)
  const carWashTunnelOpen = useMapStore((s) => s.carWashTunnel.open)
  const autoRepairGarageOpen = useMapStore((s) => s.autoRepairGarage.open)
  const carDealershipShowroomOpen = useMapStore((s) => s.carDealershipShowroom.open)
  const tireAutoCareOpen = useMapStore((s) => s.tireAutoCare.open)
  const oilChangeQuickOpen = useMapStore((s) => s.oilChangeQuick.open)
  const emissionsInspectionOpen = useMapStore((s) => s.emissionsInspection.open)
  const autoPartsStoreOpen = useMapStore((s) => s.autoPartsStore.open)
  const carRentalAgencyOpen = useMapStore((s) => s.carRentalAgency.open)
  // Task 145: Pet & Veterinary Services
  const veterinaryClinicOpen = useMapStore((s) => s.veterinaryClinic.open)
  const petGroomingSalonOpen = useMapStore((s) => s.petGroomingSalon.open)
  const petBoardingKennelOpen = useMapStore((s) => s.petBoardingKennel.open)
  const animalShelterRescueOpen = useMapStore((s) => s.animalShelterRescue.open)
  const petStoreRetailOpen = useMapStore((s) => s.petStoreRetail.open)
  const dogParkActivityOpen = useMapStore((s) => s.dogParkActivity.open)
  const veterinaryHospitalEmergencyOpen = useMapStore((s) => s.veterinaryHospitalEmergency.open)
  const petDaycareCenterOpen = useMapStore((s) => s.petDaycareCenter.open)
  const petTrainingObedienceSchoolOpen = useMapStore((s) => s.petTrainingObedienceSchool.open)
  // Task 146: Childcare & Daycare Services
  const preschoolKindergartenOpen = useMapStore((s) => s.preschoolKindergarten.open)
  const montessoriEarlyLearningOpen = useMapStore((s) => s.montessoriEarlyLearning.open)
  const daycareInfantCenterOpen = useMapStore((s) => s.daycareInfantCenter.open)
  const afterSchoolProgramOpen = useMapStore((s) => s.afterSchoolProgram.open)
  const nurserySchoolOpen = useMapStore((s) => s.nurserySchool.open)
  const earlyLearningCenterOpen = useMapStore((s) => s.earlyLearningCenter.open)
  const nannyAgencyServiceOpen = useMapStore((s) => s.nannyAgencyService.open)
  const babysittingServiceOpen = useMapStore((s) => s.babysittingService.open)
  // Task 147: Hardware & Tools Retail
  const hardwareStoreOpen = useMapStore((s) => s.hardwareStore.open)
  const powerToolsRetailOpen = useMapStore((s) => s.powerToolsRetail.open)
  const plumbingSupplyOpen = useMapStore((s) => s.plumbingSupply.open)
  const electricalSupplyOpen = useMapStore((s) => s.electricalSupply.open)
  const buildingMaterialsOpen = useMapStore((s) => s.buildingMaterials.open)
  const fastenersIndustrialOpen = useMapStore((s) => s.fastenersIndustrial.open)
  const paintDecoratingOpen = useMapStore((s) => s.paintDecorating.open)
  const lawnGardenEquipmentOpen = useMapStore((s) => s.lawnGardenEquipment.open)
  // Task 148: Jewelry & Watches
  const luxuryJewelryBoutiqueOpen = useMapStore((s) => s.luxuryJewelryBoutique.open)
  const watchBoutiqueRetailOpen = useMapStore((s) => s.watchBoutiqueRetail.open)
  const engagementRingStoreOpen = useMapStore((s) => s.engagementRingStore.open)
  const diamondWholesaleDealerOpen = useMapStore((s) => s.diamondWholesaleDealer.open)
  const gemstoneJewelryDealerOpen = useMapStore((s) => s.gemstoneJewelryDealer.open)
  const estateJewelryAuctionOpen = useMapStore((s) => s.estateJewelryAuction.open)
  const customJewelryDesignOpen = useMapStore((s) => s.customJewelryDesign.open)
  const jewelryRepairAppraisalOpen = useMapStore((s) => s.jewelryRepairAppraisal.open)
  // Task 149: Florist & Garden Center
  const floristBoutiqueShopOpen = useMapStore((s) => s.floristBoutiqueShop.open)
  const gardenCenterNurseryOpen = useMapStore((s) => s.gardenCenterNursery.open)
  const greenhouseGrowerOpen = useMapStore((s) => s.greenhouseGrower.open)
  const landscapeSupplyYardOpen = useMapStore((s) => s.landscapeSupplyYard.open)
  const flowerMarketWholesaleOpen = useMapStore((s) => s.flowerMarketWholesale.open)
  const floralDesignStudioOpen = useMapStore((s) => s.floralDesignStudio.open)
  const plantNurseryRetailOpen = useMapStore((s) => s.plantNurseryRetail.open)
  const gardenToolEquipmentOpen = useMapStore((s) => s.gardenToolEquipment.open)
  // Task 150: Home Improvement & Furniture
  const furnitureRetailChainOpen = useMapStore((s) => s.furnitureRetailChain.open)
  const mattressBeddingStoreOpen = useMapStore((s) => s.mattressBeddingStore.open)
  const homeDecorBoutiqueOpen = useMapStore((s) => s.homeDecorBoutique.open)
  const lightingShowroomOpen = useMapStore((s) => s.lightingShowroom.open)
  const flooringStoreOpen = useMapStore((s) => s.flooringStore.open)
  const kitchenBathShowroomOpen = useMapStore((s) => s.kitchenBathShowroom.open)
  const applianceRetailStoreOpen = useMapStore((s) => s.applianceRetailStore.open)
  const windowTreatmentStoreOpen = useMapStore((s) => s.windowTreatmentStore.open)
  const municipalWasteCollectionOpen = useMapStore((s) => s.municipalWasteCollection.open)
  const recyclingCenterOpen = useMapStore((s) => s.recyclingCenter.open)
  const landfillOperationOpen = useMapStore((s) => s.landfillOperation.open)
  const compostingFacilityOpen = useMapStore((s) => s.compostingFacility.open)
  const hazardousWasteDisposalOpen = useMapStore((s) => s.hazardousWasteDisposal.open)
  const scrapMetalYardOpen = useMapStore((s) => s.scrapMetalYard.open)
  const electronicWasteFacilityOpen = useMapStore((s) => s.electronicWasteFacility.open)
  const transferStationOpen = useMapStore((s) => s.transferStation.open)
  const toyRetailChainOpen = useMapStore((s) => s.toyRetailChain.open)
  const legoBrandStoreOpen = useMapStore((s) => s.legoBrandStore.open)
  const boardGameCafeOpen = useMapStore((s) => s.boardGameCafe.open)
  const comicBookShopOpen = useMapStore((s) => s.comicBookShop.open)
  const hobbyCraftStoreOpen = useMapStore((s) => s.hobbyCraftStore.open)
  const modelHobbyShopOpen = useMapStore((s) => s.modelHobbyShop.open)
  const videoGameRetailerOpen = useMapStore((s) => s.videoGameRetailer.open)
  const bicycleRetailerOpen = useMapStore((s) => s.bicycleRetailer.open)
  const musicInstrumentStoreOpen = useMapStore((s) => s.musicInstrumentStore.open)
  const guitarShopOpen = useMapStore((s) => s.guitarShop.open)
  const pianoShowroomOpen = useMapStore((s) => s.pianoShowroom.open)
  const drumShopOpen = useMapStore((s) => s.drumShop.open)
  const recordingStudioOpen = useMapStore((s) => s.recordingStudio.open)
  const audioEquipmentStoreOpen = useMapStore((s) => s.audioEquipmentStore.open)
  const sheetMusicShopOpen = useMapStore((s) => s.sheetMusicShop.open)
  const vinylRecordStoreOpen = useMapStore((s) => s.vinylRecordStore.open)
  const sportingGoodsChainOpen = useMapStore((s) => s.sportingGoodsChain.open)
  const athleticFootwearStoreOpen = useMapStore((s) => s.athleticFootwearStore.open)
  const outdoorAdventureGearOpen = useMapStore((s) => s.outdoorAdventureGear.open)
  const fitnessEquipmentStoreOpen = useMapStore((s) => s.fitnessEquipmentStore.open)
  const teamSportApparelOpen = useMapStore((s) => s.teamSportApparel.open)
  const skiSnowboardShopOpen = useMapStore((s) => s.skiSnowboardShop.open)
  const surfWatersportShopOpen = useMapStore((s) => s.surfWatersportShop.open)
  const soccerSpecialtyStoreOpen = useMapStore((s) => s.soccerSpecialtyStore.open)
  const apparelRetailChainOpen = useMapStore((s) => s.apparelRetailChain.open)
  const footwearBoutiqueOpen = useMapStore((s) => s.footwearBoutique.open)
  const fashionDepartmentStoreOpen = useMapStore((s) => s.fashionDepartmentStore.open)
  const denimJeansStoreOpen = useMapStore((s) => s.denimJeansStore.open)
  const streetwearBoutiqueOpen = useMapStore((s) => s.streetwearBoutique.open)
  const womensClothingStoreOpen = useMapStore((s) => s.womensClothingStore.open)
  const mensClothingStoreOpen = useMapStore((s) => s.mensClothingStore.open)
  const childrensClothingStoreOpen = useMapStore((s) => s.childrensClothingStore.open)
  const electronicsRetailChainOpen = useMapStore((s) => s.electronicsRetailChain.open)
  const computerSpecialtyStoreOpen = useMapStore((s) => s.computerSpecialtyStore.open)
  const smartphoneStoreOpen = useMapStore((s) => s.smartphoneStore.open)
  const audioVideoStoreOpen = useMapStore((s) => s.audioVideoStore.open)
  const gamingElectronicsStoreOpen = useMapStore((s) => s.gamingElectronicsStore.open)
  const cameraPhotoStoreOpen = useMapStore((s) => s.cameraPhotoStore.open)
  const smartHomeTechStoreOpen = useMapStore((s) => s.smartHomeTechStore.open)
  const refurbishedElectronicsStoreOpen = useMapStore((s) => s.refurbishedElectronicsStore.open)
  const officeSupplyChainOpen = useMapStore((s) => s.officeSupplyChain.open)
  const stationeryStoreOpen = useMapStore((s) => s.stationeryStore.open)
  const printCopyCenterOpen = useMapStore((s) => s.printCopyCenter.open)
  const businessFurnitureStoreOpen = useMapStore((s) => s.businessFurnitureStore.open)
  const filingStorageStoreOpen = useMapStore((s) => s.filingStorageStore.open)
  const penWritingStoreOpen = useMapStore((s) => s.penWritingStore.open)
  const corporateGiftingStoreOpen = useMapStore((s) => s.corporateGiftingStore.open)
  const shippingPackagingStoreOpen = useMapStore((s) => s.shippingPackagingStore.open)
  const bookstoreRetailChainOpen = useMapStore((s) => s.bookstoreRetailChain.open)
  const giftSpecialtyShopOpen = useMapStore((s) => s.giftSpecialtyShop.open)
  const wholesaleClubWarehouseOpen = useMapStore((s) => s.wholesaleClubWarehouse.open)
  const partySupplyStoreOpen = useMapStore((s) => s.partySupplyStore.open)
  const pharmacyDrugStoreOpen = useMapStore((s) => s.pharmacyDrugStore.open)
  const buildingSupplyCenterOpen = useMapStore((s) => s.buildingSupplyCenter.open)
  const gardenCenterFloristOpen = useMapStore((s) => s.gardenCenterFlorist.open)
  const aquariumPetSupplyOpen = useMapStore((s) => s.aquariumPetSupply.open)
  const toyHobbyStoreOpen = useMapStore((s) => s.toyHobbyStore.open)
  const jewelryWatchStoreOpen = useMapStore((s) => s.jewelryWatchStore.open)
  const furnitureHomeDecorStoreOpen = useMapStore((s) => s.furnitureHomeDecorStore.open)
  const flooringCarpetStoreOpen = useMapStore((s) => s.flooringCarpetStore.open)
  const kitchenBathFixtureStoreOpen = useMapStore((s) => s.kitchenBathFixtureStore.open)
  const lightingCeilingFanStoreOpen = useMapStore((s) => s.lightingCeilingFanStore.open)
  const artFramingGalleryStoreOpen = useMapStore((s) => s.artFramingGalleryStore.open)
  const antiquesCollectiblesStoreOpen = useMapStore((s) => s.antiquesCollectiblesStore.open)
  const vapeTobaccoShopOpen = useMapStore((s) => s.vapeTobaccoShop.open)
  const lotteryNewsStandOpen = useMapStore((s) => s.lotteryNewsStand.open)
  const sportingGoodsOutdoorOpen = useMapStore((s) => s.sportingGoodsOutdoor.open)
  const bicycleShopOpen = useMapStore((s) => s.bicycleShop.open)
  const skateSurfShopOpen = useMapStore((s) => s.skateSurfShop.open)
  const gunArcheryShopOpen = useMapStore((s) => s.gunArcheryShop.open)
  const fishingTackleShopOpen = useMapStore((s) => s.fishingTackleShop.open)
  const craftBeerHomebrewShopOpen = useMapStore((s) => s.craftBeerHomebrewShop.open)
  const wineSpiritsShopOpen = useMapStore((s) => s.wineSpiritsShop.open)
  const coffeeRoasterCafeOpen = useMapStore((s) => s.coffeeRoasterCafe.open)
  const teaSpiceMerchantOpen = useMapStore((s) => s.teaSpiceMerchant.open)
  const chocolateConfectioneryOpen = useMapStore((s) => s.chocolateConfectionery.open)
  const donutBakeryShopOpen = useMapStore((s) => s.donutBakeryShop.open)
  const iceCreamDessertShopOpen = useMapStore((s) => s.iceCreamDessertShop.open)
  const bagelDeliShopOpen = useMapStore((s) => s.bagelDeliShop.open)
  const pizzaItalianRestaurantOpen = useMapStore((s) => s.pizzaItalianRestaurant.open)
  const burgerFryJointOpen = useMapStore((s) => s.burgerFryJoint.open)
  const tacoBurritoCantinaOpen = useMapStore((s) => s.tacoBurritoCantina.open)
  const sushiJapaneseRestaurantOpen = useMapStore((s) => s.sushiJapaneseRestaurant.open)
  const steakhouseGrillOpen = useMapStore((s) => s.steakhouseGrill.open)
  const butcherCharcuterieShopOpen = useMapStore((s) => s.butcherCharcuterieShop.open)
  const seafoodFishMarketOpen = useMapStore((s) => s.seafoodFishMarket.open)
  const dinerBreakfastSpotOpen = useMapStore((s) => s.dinerBreakfastSpot.open)
  const juiceBarSmoothieShopOpen = useMapStore((s) => s.juiceBarSmoothieShop.open)
  const frozenYogurtShopOpen = useMapStore((s) => s.frozenYogurtShop.open)
  const candySweetShopOpen = useMapStore((s) => s.candySweetShop.open)
  const healthFoodStoreOpen = useMapStore((s) => s.healthFoodStore.open)
  const vitaminSupplementShopOpen = useMapStore((s) => s.vitaminSupplementShop.open)
  const organicGroceryStoreOpen = useMapStore((s) => s.organicGroceryStore.open)
  const farmersMarketStandOpen = useMapStore((s) => s.farmersMarketStand.open)
  const ethnicGroceryStoreOpen = useMapStore((s) => s.ethnicGroceryStore.open)
  const halalKosherMarketOpen = useMapStore((s) => s.halalKosherMarket.open)
  const beverageDistributionCenterOpen = useMapStore((s) => s.beverageDistributionCenter.open)
  const vendingMachineOperatorOpen = useMapStore((s) => s.vendingMachineOperator.open)
  const foodTruckCommissaryOpen = useMapStore((s) => s.foodTruckCommissary.open)
  const cateringEventHallOpen = useMapStore((s) => s.cateringEventHall.open)
  const cookingSchoolCulinaryInstituteOpen = useMapStore((s) => s.cookingSchoolCulinaryInstitute.open)
  const foodBankPantryOpen = useMapStore((s) => s.foodBankPantry.open)
  const soupKitchenShelterOpen = useMapStore((s) => s.soupKitchenShelter.open)
  const schoolCafeteriaOperatorOpen = useMapStore((s) => s.schoolCafeteriaOperator.open)
  const hospitalFoodServiceOpen = useMapStore((s) => s.hospitalFoodService.open)
  const corporateDiningServiceOpen = useMapStore((s) => s.corporateDiningService.open)
  const hotelRestaurantSupplyOpen = useMapStore((s) => s.hotelRestaurantSupply.open)
  const barNightclubSupplyOpen = useMapStore((s) => s.barNightclubSupply.open)
  const breweryTaproomOpen = useMapStore((s) => s.breweryTaproom.open)
  const distilleryTastingRoomOpen = useMapStore((s) => s.distilleryTastingRoom.open)
  const wineryVineyardOpen = useMapStore((s) => s.wineryVineyard.open)
  const weddingEventVenueOpen = useMapStore((s) => s.weddingEventVenue.open)
  const conferenceConventionCenterOpen = useMapStore((s) => s.conferenceConventionCenter.open)
  const concertMusicHallOpen = useMapStore((s) => s.concertMusicHall.open)
  const stadiumArenaConcessionOpen = useMapStore((s) => s.stadiumArenaConcession.open)
  const movieTheaterConcessionOpen = useMapStore((s) => s.movieTheaterConcession.open)
  const museumCafeGiftOpen = useMapStore((s) => s.museumCafeGift.open)
  const themeParkRestaurantOpen = useMapStore((s) => s.themeParkRestaurant.open)
  const cruiseShipGalleyOpen = useMapStore((s) => s.cruiseShipGalley.open)
  const airportFoodCourtOpen = useMapStore((s) => s.airportFoodCourt.open)
  const hospitalCafeGiftShopOpen = useMapStore((s) => s.hospitalCafeGiftShop.open)
  const hotelRoomServiceOpen = useMapStore((s) => s.hotelRoomService.open)
  const casinoRestaurantOpen = useMapStore((s) => s.casinoRestaurant.open)
  const stadiumPremiumSuiteOpen = useMapStore((s) => s.stadiumPremiumSuite.open)
  const aquariumCafeOpen = useMapStore((s) => s.aquariumCafe.open)
  const zooConcessionOpen = useMapStore((s) => s.zooConcession.open)
  const botanicalGardenCafeOpen = useMapStore((s) => s.botanicalGardenCafe.open)
  const nationalParkLodgeOpen = useMapStore((s) => s.nationalParkLodge.open)
  // Task 168: Travel & Recreation Venue monitors
  const beachResortRestaurantOpen = useMapStore((s) => s.beachResortRestaurant.open)
  const mountainSkiLodgeRestaurantOpen = useMapStore((s) => s.mountainSkiLodgeRestaurant.open)
  const golfCountryClubRestaurantOpen = useMapStore((s) => s.golfCountryClubRestaurant.open)
  const marinaYachtClubOpen = useMapStore((s) => s.marinaYachtClub.open)
  const casinoHotelBuffetOpen = useMapStore((s) => s.casinoHotelBuffet.open)
  const highwayRestAreaOpen = useMapStore((s) => s.highwayRestArea.open)
  const trainStationDiningOpen = useMapStore((s) => s.trainStationDining.open)
  const ferryTerminalCafeOpen = useMapStore((s) => s.ferryTerminalCafe.open)
  // Task 169: Sports & Event Venue monitors
  const airportLoungeDiningOpen = useMapStore((s) => s.airportLoungeDining.open)
  const baseballSpringTrainingOpen = useMapStore((s) => s.baseballSpringTraining.open)
  const autoRaceTrackConcessionOpen = useMapStore((s) => s.autoRaceTrackConcession.open)
  const rodeoArenaConcessionOpen = useMapStore((s) => s.rodeoArenaConcession.open)
  const poloEquestrianClubOpen = useMapStore((s) => s.poloEquestrianClub.open)
  const tennisTournamentDiningOpen = useMapStore((s) => s.tennisTournamentDining.open)
  const golfTournamentHospitalityOpen = useMapStore((s) => s.golfTournamentHospitality.open)
  const marathonExpoSportsOpen = useMapStore((s) => s.marathonExpoSports.open)
  // Task 170: Outdoor Recreation & Amusement Venue monitors
  const stadiumBeerGardenOpen = useMapStore((s) => s.stadiumBeerGarden.open)
  const skiResortApresSkiBarOpen = useMapStore((s) => s.skiResortApresSkiBar.open)
  const beachBoardwalkFoodOpen = useMapStore((s) => s.beachBoardwalkFood.open)
  const lakeHouseRestaurantOpen = useMapStore((s) => s.lakeHouseRestaurant.open)
  const riverboatCruiseDiningOpen = useMapStore((s) => s.riverboatCruiseDining.open)
  const dinnerCruiseOpen = useMapStore((s) => s.dinnerCruise.open)
  const themeParkFoodCourtOpen = useMapStore((s) => s.themeParkFoodCourt.open)
  const waterParkSnackBarOpen = useMapStore((s) => s.waterParkSnackBar.open)
  const driveInTheaterConcessionOpen = useMapStore((s) => s.driveInTheaterConcession.open)
  const miniGolfSnackBarOpen = useMapStore((s) => s.miniGolfSnackBar.open)
  const goKartTrackConcessionOpen = useMapStore((s) => s.goKartTrackConcession.open)
  const rollerRinkSnackBarOpen = useMapStore((s) => s.rollerRinkSnackBar.open)
  const iceRinkCafeOpen = useMapStore((s) => s.iceRinkCafe.open)
  const paintballParkCafeOpen = useMapStore((s) => s.paintballParkCafe.open)
  const zipLineTourCafeOpen = useMapStore((s) => s.zipLineTourCafe.open)
  const bungeeJumpSiteCafeOpen = useMapStore((s) => s.bungeeJumpSiteCafe.open)
  const trampolineParkCafeOpen = useMapStore((s) => s.trampolineParkCafe.open)
  const laserTagArenaSnackBarOpen = useMapStore((s) => s.laserTagArenaSnackBar.open)
  const escapeRoomLoungeOpen = useMapStore((s) => s.escapeRoomLounge.open)
  const axeThrowingVenueBarOpen = useMapStore((s) => s.axeThrowingVenueBar.open)
  const climbingGymCafeOpen = useMapStore((s) => s.climbingGymCafe.open)
  const skateParkSnackBarOpen = useMapStore((s) => s.skateParkSnackBar.open)
  const discGolfCourseConcessionOpen = useMapStore((s) => s.discGolfCourseConcession.open)
  const bmxTrackConcessionOpen = useMapStore((s) => s.bmxTrackConcession.open)
  const rollerDerbyVenueBarOpen = useMapStore((s) => s.rollerDerbyVenueBar.open)
  const indoorSkydivingLoungeOpen = useMapStore((s) => s.indoorSkydivingLounge.open)
  const surfSchoolCafeOpen = useMapStore((s) => s.surfSchoolCafe.open)
  const kiteboardingBeachBarOpen = useMapStore((s) => s.kiteboardingBeachBar.open)
  const windsurfingShoreCafeOpen = useMapStore((s) => s.windsurfingShoreCafe.open)
  const kayakTourSnackBarOpen = useMapStore((s) => s.kayakTourSnackBar.open)
  const canoeRentalCafeOpen = useMapStore((s) => s.canoeRentalCafe.open)
  const paddleboardRentalCafeOpen = useMapStore((s) => s.paddleboardRentalCafe.open)
  // Task 174: Water Concession & Wellness Retreat
  const whitewaterRaftingConcessionOpen = useMapStore((s) => s.whitewaterRaftingConcession.open)
  const jetSkiRentalSnackBarOpen = useMapStore((s) => s.jetSkiRentalSnackBar.open)
  const sailingClubBarOpen = useMapStore((s) => s.sailingClubBar.open)
  const marinaRestaurantOpen = useMapStore((s) => s.marinaRestaurant.open)
  const houseboatRentalCafeOpen = useMapStore((s) => s.houseboatRentalCafe.open)
  const floatSpaLoungeOpen = useMapStore((s) => s.floatSpaLounge.open)
  const saltCaveRelaxationCafeOpen = useMapStore((s) => s.saltCaveRelaxationCafe.open)
  const daySpaCafeOpen = useMapStore((s) => s.daySpaCafe.open)
  // Task 175: Thermal & Mind-Body Wellness Retreat
  const hotSpringResortCafeOpen = useMapStore((s) => s.hotSpringResortCafe.open)
  const thermalBathLoungeOpen = useMapStore((s) => s.thermalBathLounge.open)
  const cryotherapyClinicCafeOpen = useMapStore((s) => s.cryotherapyClinicCafe.open)
  const infraredSaunaLoungeOpen = useMapStore((s) => s.infraredSaunaLounge.open)
  const meditationStudioCafeOpen = useMapStore((s) => s.meditationStudioCafe.open)
  const yogaRetreatCafeOpen = useMapStore((s) => s.yogaRetreatCafe.open)
  const pilatesStudioBarreOpen = useMapStore((s) => s.pilatesStudioBarre.open)
  const barreFitnessStudioCafeOpen = useMapStore((s) => s.barreFitnessStudioCafe.open)
  // Task 176: Holistic & Integrative Wellness Clinic
  const hotYogaStudioCafeOpen = useMapStore((s) => s.hotYogaStudioCafe.open)
  const soundBathMeditationLoungeOpen = useMapStore((s) => s.soundBathMeditationLounge.open)
  const aromatherapySpaCafeOpen = useMapStore((s) => s.aromatherapySpaCafe.open)
  const reflexologyLoungeCafeOpen = useMapStore((s) => s.reflexologyLoungeCafe.open)
  const reikiHealingCenterCafeOpen = useMapStore((s) => s.reikiHealingCenterCafe.open)
  const acupunctureClinicCafeOpen = useMapStore((s) => s.acupunctureClinicCafe.open)
  const chiropracticWellnessCafeOpen = useMapStore((s) => s.chiropracticWellnessCafe.open)
  const naturopathicClinicCafeOpen = useMapStore((s) => s.naturopathicClinicCafe.open)
  const hairSalonStudioOpen = useMapStore((s) => s.hairSalonStudio.open)
  const barberShopLoungeOpen = useMapStore((s) => s.barberShopLounge.open)
  const manicurePedicureSpaOpen = useMapStore((s) => s.manicurePedicureSpa.open)
  const skinCareClinicOpen = useMapStore((s) => s.skinCareClinic.open)
  const lashBrowBarOpen = useMapStore((s) => s.lashBrowBar.open)
  const waxingHairRemovalOpen = useMapStore((s) => s.waxingHairRemoval.open)
  const makeupCosmeticsStudioOpen = useMapStore((s) => s.makeupCosmeticsStudio.open)
  const sprayTanStudioOpen = useMapStore((s) => s.sprayTanStudio.open)
  const autoMechanicShopOpen = useMapStore((s) => s.autoMechanicShop.open)
  const tireRotationShopOpen = useMapStore((s) => s.tireRotationShop.open)
  const oilChangeExpressOpen = useMapStore((s) => s.oilChangeExpress.open)
  const carWashDetailingOpen = useMapStore((s) => s.carWashDetailing.open)
  const aftermarketPartsStoreOpen = useMapStore((s) => s.aftermarketPartsStore.open)
  const bodyCollisionShopOpen = useMapStore((s) => s.bodyCollisionShop.open)
  const mufflerExhaustShopOpen = useMapStore((s) => s.mufflerExhaustShop.open)
  const transmissionRepairShopOpen = useMapStore((s) => s.transmissionRepairShop.open)
  const bankBranchOfficeOpen = useMapStore((s) => s.bankBranchOffice.open)
  const creditUnionBranchOpen = useMapStore((s) => s.creditUnionBranch.open)
  const accountingFirmOfficeOpen = useMapStore((s) => s.accountingFirmOffice.open)
  const taxPrepServiceOpen = useMapStore((s) => s.taxPrepService.open)
  const insuranceAgencyOfficeOpen = useMapStore((s) => s.insuranceAgencyOffice.open)
  const lawFirmPracticeOpen = useMapStore((s) => s.lawFirmPractice.open)
  const notarySigningServiceOpen = useMapStore((s) => s.notarySigningService.open)
  const realEstateAgencyOpen = useMapStore((s) => s.realEstateAgency.open)

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
          {/* Task 108: Urban Infrastructure & Smart City */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-11 w-11 rounded-xl transition-all duration-200',
                    trafficFlowMonitorOpen
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setTrafficFlowMonitor({ open: true })}
                  aria-label="Traffic Flow Monitor"
                >
                  <CarIcon2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Traffic Flow Monitor
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
                    bridgeStructuralHealthOpen
                      ? 'bg-stone-500 text-white shadow-md shadow-stone-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setBridgeStructuralHealth({ open: true })}
                  aria-label="Bridge Structural Health Monitor"
                >
                  <ConstructionIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Bridge Structural Health Monitor
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
                    waterPipeNetworkOpen
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setWaterPipeNetwork({ open: true })}
                  aria-label="Water Pipe Network Monitor"
                >
                  <PipeIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Water Pipe Network Monitor
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
                    powerGridLoadOpen
                      ? 'bg-yellow-500 text-white shadow-md shadow-yellow-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setPowerGridLoad({ open: true })}
                  aria-label="Power Grid Load Monitor"
                >
                  <ZapIcon5 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Power Grid Load Monitor
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
                    wasteCollectionRouteOpen
                      ? 'bg-green-500 text-white shadow-md shadow-green-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setWasteCollectionRoute({ open: true })}
                  aria-label="Waste Collection Route Monitor"
                >
                  <TrashIcon2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Waste Collection Route Monitor
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
                    airQualityUrbanOpen
                      ? 'bg-slate-500 text-white shadow-md shadow-slate-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setAirQualityUrban({ open: true })}
                  aria-label="Air Quality Urban Monitor"
                >
                  <WindIcon16 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Air Quality Urban Monitor
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
                    noiseLevelMapperOpen
                      ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setNoiseLevelMapper({ open: true })}
                  aria-label="Noise Level Mapper Monitor"
                >
                  <Volume2Icon2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Noise Level Mapper Monitor
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
                    smartParkingCapacityOpen
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setSmartParkingCapacity({ open: true })}
                  aria-label="Smart Parking Capacity Monitor"
                >
                  <ParkingIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Smart Parking Capacity Monitor
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* Task 109: Agricultural Monitoring & Precision Farming */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-11 w-11 rounded-xl transition-all duration-200',
                    cropHealthIndexOpen
                      ? 'bg-green-500 text-white shadow-md shadow-green-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setCropHealthIndex({ open: true })}
                  aria-label="Crop Health Index Monitor"
                >
                  <LeafIcon9 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Crop Health Index Monitor
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
                    soilMoistureFieldOpen
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setSoilMoistureField({ open: true })}
                  aria-label="Soil Moisture Field Monitor"
                >
                  <DropletsIcon19 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Soil Moisture Field Monitor
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
                    irrigationEfficiencyOpen
                      ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setIrrigationEfficiency({ open: true })}
                  aria-label="Irrigation Efficiency Monitor"
                >
                  <DropletIcon14 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Irrigation Efficiency Monitor
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
                    pestOutbreakTrackerOpen
                      ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setPestOutbreakTracker({ open: true })}
                  aria-label="Pest Outbreak Tracker Monitor"
                >
                  <BugIcon5 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Pest Outbreak Tracker Monitor
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
                    fertilizerRunoffOpen
                      ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setFertilizerRunoff({ open: true })}
                  aria-label="Fertilizer Runoff Monitor"
                >
                  <FlaskConicalIcon4 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Fertilizer Runoff Monitor
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
                    harvestYieldPredictOpen
                      ? 'bg-yellow-500 text-white shadow-md shadow-yellow-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setHarvestYieldPredict({ open: true })}
                  aria-label="Harvest Yield Predict Monitor"
                >
                  <WheatIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Harvest Yield Predict Monitor
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
                    greenhouseClimateOpen
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setGreenhouseClimate({ open: true })}
                  aria-label="Greenhouse Climate Monitor"
                >
                  <ThermometerIcon23 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Greenhouse Climate Monitor
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
                    livestockMovementOpen
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setLivestockMovement({ open: true })}
                  aria-label="Livestock Movement Monitor"
                >
                  <FootprintsIcon3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Livestock Movement Monitor
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* Task 110: Renewable Energy & Grid Monitoring */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-11 w-11 rounded-xl transition-all duration-200',
                    windFarmOutputOpen
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setWindFarmOutput({ open: true })}
                  aria-label="Wind Farm Output Monitor"
                >
                  <WindIcon17 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Wind Farm Output Monitor
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
                    hydroelectricFlowOpen
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setHydroelectricFlow({ open: true })}
                  aria-label="Hydroelectric Flow Monitor"
                >
                  <WavesIcon24 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Hydroelectric Flow Monitor
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
                    biomassEnergyYieldOpen
                      ? 'bg-green-500 text-white shadow-md shadow-green-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setBiomassEnergyYield({ open: true })}
                  aria-label="Biomass Energy Yield Monitor"
                >
                  <TreePineIcon10 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Biomass Energy Yield Monitor
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
                    tidalEnergyPotentialOpen
                      ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setTidalEnergyPotential({ open: true })}
                  aria-label="Tidal Energy Potential Monitor"
                >
                  <AnchorIcon4 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Tidal Energy Potential Monitor
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
                    gridStabilityIndexOpen
                      ? 'bg-violet-500 text-white shadow-md shadow-violet-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setGridStabilityIndex({ open: true })}
                  aria-label="Grid Stability Index Monitor"
                >
                  <ActivityIcon9 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Grid Stability Index Monitor
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
                    energyStorageLevelOpen
                      ? 'bg-lime-500 text-white shadow-md shadow-lime-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setEnergyStorageLevel({ open: true })}
                  aria-label="Energy Storage Level Monitor"
                >
                  <BatteryIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Energy Storage Level Monitor
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
                    diseaseOutbreakMapOpen
                      ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setDiseaseOutbreakMap({ open: true })}
                  aria-label="Disease Outbreak Map Monitor"
                >
                  <VirusIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Disease Outbreak Map Monitor
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
                    vaccinationCoverageOpen
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setVaccinationCoverage({ open: true })}
                  aria-label="Vaccination Coverage Monitor"
                >
                  <SyringeIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Vaccination Coverage Monitor
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
                    waterQualityIndexOpen
                      ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setWaterQualityIndex({ open: true })}
                  aria-label="Water Quality Index Monitor"
                >
                  <DropletsIcon20 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Water Quality Index Monitor
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
                    hospitalCapacityOpen
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setHospitalCapacity({ open: true })}
                  aria-label="Hospital Capacity Monitor"
                >
                  <Building2Icon2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Hospital Capacity Monitor
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
                    airPollutionHealthOpen
                      ? 'bg-gray-500 text-white shadow-md shadow-gray-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setAirPollutionHealth({ open: true })}
                  aria-label="Air Pollution Health Monitor"
                >
                  <CloudCogIcon3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Air Pollution Health Monitor
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
                    vectorHabitatRiskOpen
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setVectorHabitatRisk({ open: true })}
                  aria-label="Vector Habitat Risk Monitor"
                >
                  <BugIcon6 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Vector Habitat Risk Monitor
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
                    nutritionSecurityOpen
                      ? 'bg-green-500 text-white shadow-md shadow-green-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setNutritionSecurity({ open: true })}
                  aria-label="Nutrition Security Monitor"
                >
                  <AppleIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Nutrition Security Monitor
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
                    pandemicSpreadRateOpen
                      ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setPandemicSpreadRate({ open: true })}
                  aria-label="Pandemic Spread Rate Monitor"
                >
                  <GlobeIcon4 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Pandemic Spread Rate Monitor
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* Task 112: Transportation & Logistics */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-11 w-11 rounded-xl transition-all duration-200',
                    flightPathTrackerOpen
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setFlightPathTracker({ open: true })}
                  aria-label="Flight Path Tracker Monitor"
                >
                  <PlaneIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Flight Path Tracker Monitor
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
                    portCongestionMapOpen
                      ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setPortCongestionMap({ open: true })}
                  aria-label="Port Congestion Map Monitor"
                >
                  <ShipIcon6 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Port Congestion Map Monitor
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
                    railNetworkStatusOpen
                      ? 'bg-stone-500 text-white shadow-md shadow-stone-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setRailNetworkStatus({ open: true })}
                  aria-label="Rail Network Status Monitor"
                >
                  <TrainIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Rail Network Status Monitor
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
                    highwayBottleneckOpen
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setHighwayBottleneck({ open: true })}
                  aria-label="Highway Bottleneck Monitor"
                >
                  <RouteIcon3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Highway Bottleneck Monitor
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
                    cargoShipTrackerOpen
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setCargoShipTracker({ open: true })}
                  aria-label="Cargo Ship Tracker Monitor"
                >
                  <ContainerIcon2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Cargo Ship Tracker Monitor
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
                    transitRidershipOpen
                      ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setTransitRidership({ open: true })}
                  aria-label="Transit Ridership Monitor"
                >
                  <UsersIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Transit Ridership Monitor
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
                    fuelStationNetworkOpen
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setFuelStationNetwork({ open: true })}
                  aria-label="Fuel Station Network Monitor"
                >
                  <FuelIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Fuel Station Network Monitor
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
                    logisticsDepotStatusOpen
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setLogisticsDepotStatus({ open: true })}
                  aria-label="Logistics Depot Status Monitor"
                >
                  <WarehouseIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Logistics Depot Status Monitor
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* Task 113: Climate Change Indicators */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-11 w-11 rounded-xl transition-all duration-200',
                    globalTemperatureAnomalyOpen
                      ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setGlobalTemperatureAnomaly({ open: true })}
                  aria-label="Global Temperature Anomaly Monitor"
                >
                  <ThermometerIcon24 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Global Temperature Anomaly Monitor
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
                    co2AtmosphericOpen
                      ? 'bg-gray-500 text-white shadow-md shadow-gray-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setCo2Atmospheric({ open: true })}
                  aria-label="CO2 Atmospheric Monitor"
                >
                  <CloudIcon7 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                CO2 Atmospheric Monitor
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
                    seaLevelRiseTrackOpen
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setSeaLevelRiseTrack({ open: true })}
                  aria-label="Sea Level Rise Tracker Monitor"
                >
                  <WavesIcon25 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Sea Level Rise Tracker Monitor
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
                    iceCapExtentOpen
                      ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setIceCapExtent({ open: true })}
                  aria-label="Ice Cap Extent Monitor"
                >
                  <SnowflakeIcon17 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Ice Cap Extent Monitor
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
                    permafrostThawTrackOpen
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setPermafrostThawTrack({ open: true })}
                  aria-label="Permafrost Thaw Tracker Monitor"
                >
                  <ThermometerSunIcon3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Permafrost Thaw Tracker Monitor
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
                    extremeWeatherIndexOpen
                      ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setExtremeWeatherIndex({ open: true })}
                  aria-label="Extreme Weather Index Monitor"
                >
                  <CloudRainIcon8 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Extreme Weather Index Monitor
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
                    glacierRetreatTrackOpen
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setGlacierRetreatTrack({ open: true })}
                  aria-label="Glacier Retreat Tracker Monitor"
                >
                  <MountainIcon18 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Glacier Retreat Tracker Monitor
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
                    oceanAcidificationTrackOpen
                      ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setOceanAcidificationTrack({ open: true })}
                  aria-label="Ocean Acidification Tracker Monitor"
                >
                  <DropletIcon15 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Ocean Acidification Tracker Monitor
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* Task 114: Disaster Response & Emergency Management */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-11 w-11 rounded-xl transition-all duration-200',
                    emergencyShelterMapOpen
                      ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setEmergencyShelterMap({ open: true })}
                  aria-label="Emergency Shelter Map Monitor"
                >
                  <ShieldIcon5 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Emergency Shelter Map Monitor
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
                    evacuationRouteOpen
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setEvacuationRoute({ open: true })}
                  aria-label="Evacuation Route Monitor"
                >
                  <RouteIcon4 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Evacuation Route Monitor
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
                    firstAidStationOpen
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setFirstAidStation({ open: true })}
                  aria-label="First Aid Station Monitor"
                >
                  <CrossIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                First Aid Station Monitor
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
                    searchRescueGridOpen
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setSearchRescueGrid({ open: true })}
                  aria-label="Search and Rescue Grid Monitor"
                >
                  <SearchIcon3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Search and Rescue Grid Monitor
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
                    supplyChainReliefOpen
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setSupplyChainRelief({ open: true })}
                  aria-label="Supply Chain Relief Monitor"
                >
                  <PackageIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Supply Chain Relief Monitor
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
                    communicationNetworkOpen
                      ? 'bg-violet-500 text-white shadow-md shadow-violet-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setCommunicationNetwork({ open: true })}
                  aria-label="Communication Network Monitor"
                >
                  <RadioIcon4 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Communication Network Monitor
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
                    damageAssessmentOpen
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setDamageAssessment({ open: true })}
                  aria-label="Damage Assessment Monitor"
                >
                  <AlertTriangleIcon6 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Damage Assessment Monitor
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
                    casualtyTrackingOpen
                      ? 'bg-slate-500 text-white shadow-md shadow-slate-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setCasualtyTracking({ open: true })}
                  aria-label="Casualty Tracking Monitor"
                >
                  <ActivityIcon10 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Casualty Tracking Monitor
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* Task 115: Water Resources Management */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-11 w-11 rounded-xl transition-all duration-200',
                    reservoirCapacityOpen
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setReservoirCapacity({ open: true })}
                  aria-label="Reservoir Capacity Monitor"
                >
                  <DatabaseIcon3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Reservoir Capacity Monitor
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
                    damIntegrityOpen
                      ? 'bg-stone-500 text-white shadow-md shadow-stone-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setDamIntegrity({ open: true })}
                  aria-label="Dam Integrity Monitor"
                >
                  <ConstructionIcon2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Dam Integrity Monitor
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
                    irrigationCommandOpen
                      ? 'bg-green-500 text-white shadow-md shadow-green-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setIrrigationCommand({ open: true })}
                  aria-label="Irrigation Command Monitor"
                >
                  <DropletsIcon21 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Irrigation Command Monitor
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
                    waterTreatmentPlantOpen
                      ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setWaterTreatmentPlant({ open: true })}
                  aria-label="Water Treatment Plant Monitor"
                >
                  <FlaskConicalIcon5 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Water Treatment Plant Monitor
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
                    watershedPollutionOpen
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setWatershedPollution({ open: true })}
                  aria-label="Watershed Pollution Monitor"
                >
                  <BiohazardIcon2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Watershed Pollution Monitor
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
                    floodControlSystemOpen
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setFloodControlSystem({ open: true })}
                  aria-label="Flood Control System Monitor"
                >
                  <CloudRainIcon9 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Flood Control System Monitor
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
                    drinkingWaterQualityOpen
                      ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setDrinkingWaterQuality({ open: true })}
                  aria-label="Drinking Water Quality Monitor"
                >
                  <GlassWaterIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Drinking Water Quality Monitor
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
                    desalinationOutputOpen
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setDesalinationOutput({ open: true })}
                  aria-label="Desalination Output Monitor"
                >
                  <WavesIcon26 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Desalination Output Monitor
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* Task 116: Environmental Pollution & Industrial Monitoring */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-11 w-11 rounded-xl transition-all duration-200',
                    industrialEmissionOpen
                      ? 'bg-gray-500 text-white shadow-md shadow-gray-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setIndustrialEmission({ open: true })}
                  aria-label="Industrial Emission Monitor"
                >
                  <FactoryIcon3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Industrial Emission Monitor
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
                    chemicalSpillTrackerOpen
                      ? 'bg-yellow-500 text-white shadow-md shadow-yellow-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setChemicalSpillTracker({ open: true })}
                  aria-label="Chemical Spill Tracker"
                >
                  <FlaskConicalIcon6 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Chemical Spill Tracker
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
                    airToxicMonitorOpen
                      ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setAirToxicMonitor({ open: true })}
                  aria-label="Air Toxic Monitor"
                >
                  <WindIcon18 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Air Toxic Monitor
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
                    soilContaminationMapOpen
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setSoilContaminationMap({ open: true })}
                  aria-label="Soil Contamination Map"
                >
                  <LayersIcon11 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Soil Contamination Map
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
                    noiseIndustrialMonitorOpen
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setNoiseIndustrialMonitor({ open: true })}
                  aria-label="Noise Industrial Monitor"
                >
                  <Volume2Icon3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Noise Industrial Monitor
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
                    lightPollutionAtlasOpen
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setLightPollutionAtlas({ open: true })}
                  aria-label="Light Pollution Atlas"
                >
                  <MoonIcon3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Light Pollution Atlas
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
                    thermalPollutionMonitorOpen
                      ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setThermalPollutionMonitor({ open: true })}
                  aria-label="Thermal Pollution Monitor"
                >
                  <FlameIcon19 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Thermal Pollution Monitor
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
                    ewasteDumpMonitorOpen
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setEwasteDumpMonitor({ open: true })}
                  aria-label="Ewaste Dump Monitor"
                >
                  <MonitorIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Ewaste Dump Monitor
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* Task 117: Wildlife Conservation & Biodiversity */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-11 w-11 rounded-xl transition-all duration-200',
                    endangeredSpeciesOpen
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setEndangeredSpecies({ open: true })}
                  aria-label="Endangered Species Monitor"
                >
                  <PawPrintIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Endangered Species Monitor
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
                    marineMammalTrackerOpen
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setMarineMammalTracker({ open: true })}
                  aria-label="Marine Mammal Tracker"
                >
                  <FishIcon8 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Marine Mammal Tracker
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
                    birdMigrationFlywayOpen
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setBirdMigrationFlyway({ open: true })}
                  aria-label="Bird Migration Flyway"
                >
                  <BirdIcon6 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Bird Migration Flyway
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
                    coralReefBleachingTrackOpen
                      ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setCoralReefBleachingTrack({ open: true })}
                  aria-label="Coral Reef Bleaching Monitor"
                >
                  <ShellIcon4 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Coral Reef Bleaching Monitor
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
                    invasiveSpeciesTrackOpen
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setInvasiveSpeciesTrack({ open: true })}
                  aria-label="Invasive Species Monitor"
                >
                  <BugIcon7 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Invasive Species Monitor
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
                    habitatFragmentationOpen
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setHabitatFragmentation({ open: true })}
                  aria-label="Habitat Fragmentation Monitor"
                >
                  <GridIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Habitat Fragmentation Monitor
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
                    biodiversityHotspotOpen
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setBiodiversityHotspot({ open: true })}
                  aria-label="Biodiversity Hotspot Monitor"
                >
                  <FlowerIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Biodiversity Hotspot Monitor
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
                    wildlifeCorridorMapTrackOpen
                      ? 'bg-green-500 text-white shadow-md shadow-green-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setWildlifeCorridorMapTrack({ open: true })}
                  aria-label="Wildlife Corridor Map"
                >
                  <RouteIcon5 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Wildlife Corridor Map
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* Task 118: Geological Hazards & Tectonic Activity */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-11 w-11 rounded-xl transition-all duration-200',
                    earthquakeForecastTrackOpen
                      ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setEarthquakeForecastTrack({ open: true })}
                  aria-label="Earthquake Forecast Monitor"
                >
                  <ActivityIcon11 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Earthquake Forecast Monitor
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
                    volcanoEruptionAlertTrackOpen
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setVolcanoEruptionAlertTrack({ open: true })}
                  aria-label="Volcano Eruption Alert"
                >
                  <FlameIcon20 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Volcano Eruption Alert
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
                    tsunamiWarningTrackOpen
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setTsunamiWarningTrack({ open: true })}
                  aria-label="Tsunami Warning System"
                >
                  <WavesIcon27 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Tsunami Warning System
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
                    landslideHazardMapTrackOpen
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setLandslideHazardMapTrack({ open: true })}
                  aria-label="Landslide Hazard Map"
                >
                  <MountainIcon19 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Landslide Hazard Map
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
                    subsidenceMonitorTrackOpen
                      ? 'bg-stone-500 text-white shadow-md shadow-stone-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setSubsidenceMonitorTrack({ open: true })}
                  aria-label="Subsidence Monitor"
                >
                  <ArrowDownIcon8 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Subsidence Monitor
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
                    faultLineActivityOpen
                      ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setFaultLineActivity({ open: true })}
                  aria-label="Fault Line Activity"
                >
                  <SplitIcon4 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Fault Line Activity
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
                    geothermalActivityTrackOpen
                      ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setGeothermalActivityTrack({ open: true })}
                  aria-label="Geothermal Activity Monitor"
                >
                  <DropletIcon16 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Geothermal Activity Monitor
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
                    rockburstRiskMonitorOpen
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setRockburstRiskMonitor({ open: true })}
                  aria-label="Rockburst Risk Monitor"
                >
                  <TriangleAlertIcon6 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Rockburst Risk Monitor
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* Task 119: Atmospheric Chemistry & Air Quality */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-11 w-11 rounded-xl transition-all duration-200',
                    ozoneLayerTrack119Open
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setOzoneLayerTrack119({ open: true })}
                  aria-label="Ozone Layer Monitor"
                >
                  <SunIcon13 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Ozone Layer Monitor
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
                    methaneEmissionSourceTrackOpen
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setMethaneEmissionSourceTrack({ open: true })}
                  aria-label="Methane Emission Source"
                >
                  <FlameIcon21 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Methane Emission Source
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
                    aerosolOpticalDepthOpen
                      ? 'bg-slate-500 text-white shadow-md shadow-slate-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setAerosolOpticalDepth({ open: true })}
                  aria-label="Aerosol Optical Depth"
                >
                  <CloudIcon8 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Aerosol Optical Depth
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
                    nitrogenDioxideColumnOpen
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setNitrogenDioxideColumn({ open: true })}
                  aria-label="Nitrogen Dioxide Column"
                >
                  <CloudFogIcon3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Nitrogen Dioxide Column
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
                    sulfurDioxideFluxOpen
                      ? 'bg-yellow-500 text-white shadow-md shadow-yellow-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setSulfurDioxideFlux({ open: true })}
                  aria-label="Sulfur Dioxide Flux"
                >
                  <CloudCogIcon4 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Sulfur Dioxide Flux
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
                    carbonMonoxideColumnOpen
                      ? 'bg-violet-500 text-white shadow-md shadow-violet-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setCarbonMonoxideColumn({ open: true })}
                  aria-label="Carbon Monoxide Column"
                >
                  <WindIcon19 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Carbon Monoxide Column
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
                    particulateMatterTrack119Open
                      ? 'bg-stone-500 text-white shadow-md shadow-stone-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setParticulateMatterTrack119({ open: true })}
                  aria-label="Particulate Matter Monitor"
                >
                  <CircleDotIcon4 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Particulate Matter Monitor
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
                    vocConcentrationMapOpen
                      ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setVocConcentrationMap({ open: true })}
                  aria-label="VOC Concentration Map"
                >
                  <FlaskConicalIcon7 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                VOC Concentration Map
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* Task 120: Tourism & Travel Infrastructure */}
          <button
            onClick={() => useMapStore.getState().setTouristAttractionMonitor({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${touristAttractionMonitorOpen ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Tourist Attraction Monitor"
          >
            <CameraIcon className="h-4 w-4" />
            {touristAttractionMonitorOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setHotelOccupancyMonitor({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${hotelOccupancyMonitorOpen ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Hotel Occupancy Monitor"
          >
            <Building2Icon3 className="h-4 w-4" />
            {hotelOccupancyMonitorOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setNationalParkVisitorMonitor({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${nationalParkVisitorMonitorOpen ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="National Park Visitor Monitor"
          >
            <TreesIcon className="h-4 w-4" />
            {nationalParkVisitorMonitorOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setMuseumFootfallMonitor({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${museumFootfallMonitorOpen ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Museum Footfall Monitor"
          >
            <LandmarkIcon className="h-4 w-4" />
            {museumFootfallMonitorOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-violet-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBeachSafetyMonitor({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${beachSafetyMonitorOpen ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Beach Safety Monitor"
          >
            <UmbrellaIcon className="h-4 w-4" />
            {beachSafetyMonitorOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSkiResortConditionMonitor({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${skiResortConditionMonitorOpen ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Ski Resort Condition Monitor"
          >
            <SnowflakeIcon18 className="h-4 w-4" />
            {skiResortConditionMonitorOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-sky-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCruisePortActivityMonitor({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${cruisePortActivityMonitorOpen ? 'bg-teal-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Cruise Port Activity Monitor"
          >
            <ShipIcon7 className="h-4 w-4" />
            {cruisePortActivityMonitorOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-teal-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setThemeParkQueueMonitor({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${themeParkQueueMonitorOpen ? 'bg-fuchsia-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Theme Park Queue Monitor"
          >
            <FerrisWheelIcon className="h-4 w-4" />
            {themeParkQueueMonitorOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-fuchsia-400" />}
          </button>
          {/* Task 121: Retail & Commercial Intelligence */}
          <button
            onClick={() => useMapStore.getState().setShoppingMallTraffic({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${shoppingMallTrafficOpen ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Shopping Mall Traffic Monitor"
          >
            <ShoppingBagIcon className="h-4 w-4" />
            {shoppingMallTrafficOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setRetailStorePerformance({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${retailStorePerformanceOpen ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Retail Store Performance Monitor"
          >
            <StoreIcon className="h-4 w-4" />
            {retailStorePerformanceOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setRestaurantOccupancy({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${restaurantOccupancyOpen ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Restaurant Occupancy Monitor"
          >
            <UtensilsIcon className="h-4 w-4" />
            {restaurantOccupancyOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSupermarketQueue({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${supermarketQueueOpen ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Supermarket Queue Monitor"
          >
            <ShoppingCartIcon className="h-4 w-4" />
            {supermarketQueueOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setStreetMarketActivity({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${streetMarketActivityOpen ? 'bg-lime-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Street Market Activity Monitor"
          >
            <StoreIcon2 className="h-4 w-4" />
            {streetMarketActivityOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-lime-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCinemaTheaterAttendance({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${cinemaTheaterAttendanceOpen ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Cinema Theater Attendance Monitor"
          >
            <FilmIcon className="h-4 w-4" />
            {cinemaTheaterAttendanceOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-violet-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setGymFitnessCenter({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${gymFitnessCenterOpen ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Gym Fitness Center Monitor"
          >
            <DumbbellIcon className="h-4 w-4" />
            {gymFitnessCenterOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setNightlifeVenue({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${nightlifeVenueOpen ? 'bg-fuchsia-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Nightlife Venue Monitor"
          >
            <MusicIcon className="h-4 w-4" />
            {nightlifeVenueOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-fuchsia-400" />}
          </button>
          {/* Task 122: Education & Research Institutions */}
          <button
            onClick={() => useMapStore.getState().setUniversityCampusMonitor({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${universityCampusMonitorOpen ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="University Campus Monitor"
          >
            <GraduationCapIcon className="h-4 w-4" />
            {universityCampusMonitorOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-violet-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setLibraryResourceMonitor({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${libraryResourceMonitorOpen ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Library Resource Monitor"
          >
            <LibraryIcon className="h-4 w-4" />
            {libraryResourceMonitorOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setLaboratorySafetyMonitor({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${laboratorySafetyMonitorOpen ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Laboratory Safety Monitor"
          >
            <MicroscopeIcon className="h-4 w-4" />
            {laboratorySafetyMonitorOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setResearchOutputMonitor({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${researchOutputMonitorOpen ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Research Output Monitor"
          >
            <FlaskConicalIcon8 className="h-4 w-4" />
            {researchOutputMonitorOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setStudentEnrollmentMonitor({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${studentEnrollmentMonitorOpen ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Student Enrollment Monitor"
          >
            <AtomIcon className="h-4 w-4" />
            {studentEnrollmentMonitorOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setAcademicCitationMonitor({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${academicCitationMonitorOpen ? 'bg-fuchsia-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Academic Citation Monitor"
          >
            <BrainIcon className="h-4 w-4" />
            {academicCitationMonitorOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-fuchsia-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setInnovationPatentMonitor({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${innovationPatentMonitorOpen ? 'bg-yellow-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Innovation Patent Monitor"
          >
            <LightbulbIcon className="h-4 w-4" />
            {innovationPatentMonitorOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setFieldStationResearch({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${fieldStationResearchOpen ? 'bg-teal-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Field Station Research Monitor"
          >
            <PencilRulerIcon className="h-4 w-4" />
            {fieldStationResearchOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-teal-400" />}
          </button>
          {/* Task 123: Financial & Banking Centers */}
          <button
            onClick={() => useMapStore.getState().setBankBranchTraffic({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${bankBranchTrafficOpen ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Bank Branch Traffic Monitor"
          >
            <LandmarkIcon3 className="h-4 w-4" />
            {bankBranchTrafficOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setStockExchangeMonitor({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${stockExchangeMonitorOpen ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Stock Exchange Monitor"
          >
            <TrendingUpIcon className="h-4 w-4" />
            {stockExchangeMonitorOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setAtmNetworkStatus({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${atmNetworkStatusOpen ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="ATM Network Status Monitor"
          >
            <CreditCardIcon className="h-4 w-4" />
            {atmNetworkStatusOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCryptocurrencyMining({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${cryptocurrencyMiningOpen ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Cryptocurrency Mining Monitor"
          >
            <PickaxeIcon className="h-4 w-4" />
            {cryptocurrencyMiningOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setInsuranceClaimCenter({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${insuranceClaimCenterOpen ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Insurance Claim Center Monitor"
          >
            <ShieldCheckIcon className="h-4 w-4" />
            {insuranceClaimCenterOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-violet-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setPaymentGatewayStatus({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${paymentGatewayStatusOpen ? 'bg-fuchsia-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Payment Gateway Status Monitor"
          >
            <WalletIcon className="h-4 w-4" />
            {paymentGatewayStatusOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-fuchsia-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setFintechHubActivity({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${fintechHubActivityOpen ? 'bg-teal-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Fintech Hub Activity Monitor"
          >
            <RocketIcon className="h-4 w-4" />
            {fintechHubActivityOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-teal-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setGoldReserveVault({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${goldReserveVaultOpen ? 'bg-yellow-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Gold Reserve Vault Monitor"
          >
            <GemIcon6 className="h-4 w-4" />
            {goldReserveVaultOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-400" />}
          </button>
          {/* Task 124: Sports & Entertainment Venues */}
          <button
            onClick={() => useMapStore.getState().setStadiumCrowdMonitor({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${stadiumCrowdMonitorOpen ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Stadium Crowd Monitor"
          >
            <TrophyIcon className="h-4 w-4" />
            {stadiumCrowdMonitorOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setArenaEventMonitor({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${arenaEventMonitorOpen ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Arena Event Monitor"
          >
            <ClapperboardIcon2 className="h-4 w-4" />
            {arenaEventMonitorOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-violet-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setConcertVenueMonitor({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${concertVenueMonitorOpen ? 'bg-fuchsia-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Concert Venue Monitor"
          >
            <MusicIcon2 className="h-4 w-4" />
            {concertVenueMonitorOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-fuchsia-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSportLeagueStanding({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${sportLeagueStandingOpen ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Sport League Standing Monitor"
          >
            <MedalIcon className="h-4 w-4" />
            {sportLeagueStandingOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setOlympicVenueMonitor({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${olympicVenueMonitorOpen ? 'bg-yellow-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Olympic Venue Monitor"
          >
            <AwardIcon3 className="h-4 w-4" />
            {olympicVenueMonitorOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setRacetrackActivity({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${racetrackActivityOpen ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Racetrack Activity Monitor"
          >
            <FlagIcon3 className="h-4 w-4" />
            {racetrackActivityOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setGolfCourseStatus({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${golfCourseStatusOpen ? 'bg-lime-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Golf Course Status Monitor"
          >
            <FlagIcon4 className="h-4 w-4" />
            {golfCourseStatusOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-lime-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setWaterParkCapacity({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${waterParkCapacityOpen ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Water Park Capacity Monitor"
          >
            <WavesIcon4 className="h-4 w-4" />
            {waterParkCapacityOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-400" />}
          </button>
          {/* Task 125: Public Safety & Law Enforcement */}
          <button
            onClick={() => useMapStore.getState().setPoliceStationStatus({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${policeStationStatusOpen ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Police Station Status Monitor"
          >
            <ShieldIcon6 className="h-4 w-4" />
            {policeStationStatusOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setFireDepartmentResponse({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${fireDepartmentResponseOpen ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Fire Department Response Monitor"
          >
            <FlameIcon22 className="h-4 w-4" />
            {fireDepartmentResponseOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setEmergencyDispatch911({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${emergencyDispatch911Open ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Emergency Dispatch 911 Monitor"
          >
            <PhoneCallIcon className="h-4 w-4" />
            {emergencyDispatch911Open && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setPrisonFacilityMonitor({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${prisonFacilityMonitorOpen ? 'bg-slate-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Prison Facility Monitor"
          >
            <LockIcon3 className="h-4 w-4" />
            {prisonFacilityMonitorOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-slate-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCourtHouseSchedule({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${courtHouseScheduleOpen ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Court House Schedule Monitor"
          >
            <ScaleIcon className="h-4 w-4" />
            {courtHouseScheduleOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBorderPatrolActivity({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${borderPatrolActivityOpen ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Border Patrol Activity Monitor"
          >
            <DoorOpenIcon className="h-4 w-4" />
            {borderPatrolActivityOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setTrafficEnforcementUnit({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${trafficEnforcementUnitOpen ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Traffic Enforcement Unit Monitor"
          >
            <CarIcon3 className="h-4 w-4" />
            {trafficEnforcementUnitOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setDisasterResponseCoord({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${disasterResponseCoordOpen ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Disaster Response Coord Monitor"
          >
            <LifeBuoyIcon className="h-4 w-4" />
            {disasterResponseCoordOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-400" />}
          </button>
          {/* Task 126: Telecommunications & Broadcasting */}
          <button
            onClick={() => useMapStore.getState().setCellTowerNetwork({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${cellTowerNetworkOpen ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Cell Tower Network Monitor"
          >
            <RadioTowerIcon className="h-4 w-4" />
            {cellTowerNetworkOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setFiberOpticBackbone({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${fiberOpticBackboneOpen ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Fiber Optic Backbone Monitor"
          >
            <GlobeIcon5 className="h-4 w-4" />
            {fiberOpticBackboneOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-violet-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setDataCenterCloud({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${dataCenterCloudOpen ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Data Center Cloud Monitor"
          >
            <ServerIcon className="h-4 w-4" />
            {dataCenterCloudOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setRadioBroadcastStation({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${radioBroadcastStationOpen ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Radio Broadcast Station Monitor"
          >
            <RadioIcon5 className="h-4 w-4" />
            {radioBroadcastStationOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setTvTransmissionTower({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${tvTransmissionTowerOpen ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="TV Transmission Tower Monitor"
          >
            <TvIcon className="h-4 w-4" />
            {tvTransmissionTowerOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSatelliteGroundStation({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${satelliteGroundStationOpen ? 'bg-slate-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Satellite Ground Station Monitor"
          >
            <SatelliteIcon3 className="h-4 w-4" />
            {satelliteGroundStationOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-slate-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setWifiHotspotNetwork({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${wifiHotspotNetworkOpen ? 'bg-lime-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Wifi Hotspot Network Monitor"
          >
            <WifiIcon className="h-4 w-4" />
            {wifiHotspotNetworkOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-lime-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setInternetExchangePoint({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${internetExchangePointOpen ? 'bg-fuchsia-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Internet Exchange Point Monitor"
          >
            <ShuffleIcon className="h-4 w-4" />
            {internetExchangePointOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-fuchsia-400" />}
          </button>
          {/* Task 127: Healthcare & Medical Facilities */}
          <button
            onClick={() => useMapStore.getState().setHospitalCapacityTrack127({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${hospitalCapacityTrack127Open ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Hospital Capacity Monitor"
          >
            <Building2Icon5 className="h-4 w-4" />
            {hospitalCapacityTrack127Open && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setClinicUrgentCare({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${clinicUrgentCareOpen ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Clinic Urgent Care Monitor"
          >
            <StethoscopeIcon className="h-4 w-4" />
            {clinicUrgentCareOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setPharmacyNetwork({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${pharmacyNetworkOpen ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Pharmacy Network Monitor"
          >
            <PillIcon className="h-4 w-4" />
            {pharmacyNetworkOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBloodBankSupply({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${bloodBankSupplyOpen ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Blood Bank Supply Monitor"
          >
            <DropletIcon17 className="h-4 w-4" />
            {bloodBankSupplyOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setMedicalResearchLab({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${medicalResearchLabOpen ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Medical Research Lab Monitor"
          >
            <MicroscopeIcon2 className="h-4 w-4" />
            {medicalResearchLabOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-violet-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setMentalHealthCenter({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${mentalHealthCenterOpen ? 'bg-teal-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Mental Health Center Monitor"
          >
            <BrainIcon2 className="h-4 w-4" />
            {mentalHealthCenterOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-teal-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setRehabilitationCenter({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${rehabilitationCenterOpen ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Rehabilitation Center Monitor"
          >
            <AccessibilityIcon className="h-4 w-4" />
            {rehabilitationCenterOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setVaccinationDrive({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${vaccinationDriveOpen ? 'bg-yellow-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Vaccination Drive Monitor"
          >
            <SyringeIcon2 className="h-4 w-4" />
            {vaccinationDriveOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-400" />}
          </button>
          {/* Task 128: Agricultural Production & Food Supply */}
          <button
            onClick={() => useMapStore.getState().setCropYieldForecast({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${cropYieldForecastOpen ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Crop Yield Forecast Monitor"
          >
            <WheatIcon2 className="h-4 w-4" />
            {cropYieldForecastOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setLivestockPopulation({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${livestockPopulationOpen ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Livestock Population Monitor"
          >
            <BeefIcon className="h-4 w-4" />
            {livestockPopulationOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setDairyFarmProduction({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${dairyFarmProductionOpen ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Dairy Farm Production Monitor"
          >
            <MilkIcon className="h-4 w-4" />
            {dairyFarmProductionOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setPoultryFarmOutput({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${poultryFarmOutputOpen ? 'bg-yellow-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Poultry Farm Output Monitor"
          >
            <EggIcon className="h-4 w-4" />
            {poultryFarmOutputOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setAquacultureFishery({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${aquacultureFisheryOpen ? 'bg-teal-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Aquaculture Fishery Monitor"
          >
            <FishIcon9 className="h-4 w-4" />
            {aquacultureFisheryOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-teal-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setGrainSiloStorage({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${grainSiloStorageOpen ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Grain Silo Storage Monitor"
          >
            <FactoryIcon4 className="h-4 w-4" />
            {grainSiloStorageOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setFoodProcessingPlant({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${foodProcessingPlantOpen ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Food Processing Plant Monitor"
          >
            <SoupIcon className="h-4 w-4" />
            {foodProcessingPlantOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setColdChainLogistics({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${coldChainLogisticsOpen ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Cold Chain Logistics Monitor"
          >
            <SnowflakeIcon19 className="h-4 w-4" />
            {coldChainLogisticsOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-400" />}
          </button>
          {/* Task 129: Energy Generation & Utilities */}
          <button
            onClick={() => useMapStore.getState().setNuclearPowerPlant({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${nuclearPowerPlantOpen ? 'bg-slate-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Nuclear Power Plant Monitor"
          >
            <AtomIcon2 className="h-4 w-4" />
            {nuclearPowerPlantOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-slate-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setNaturalGasTerminal({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${naturalGasTerminalOpen ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Natural Gas Terminal Monitor"
          >
            <FlameIcon23 className="h-4 w-4" />
            {naturalGasTerminalOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCoalPowerStation({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${coalPowerStationOpen ? 'bg-stone-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Coal Power Station Monitor"
          >
            <FactoryIcon5 className="h-4 w-4" />
            {coalPowerStationOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-stone-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setHydroelectricDam({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${hydroelectricDamOpen ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Hydroelectric Dam Monitor"
          >
            <WavesIcon28 className="h-4 w-4" />
            {hydroelectricDamOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setEvChargingNetwork({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${evChargingNetworkOpen ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="EV Charging Network Monitor"
          >
            <PlugZapIcon className="h-4 w-4" />
            {evChargingNetworkOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBatteryStorageFacility({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${batteryStorageFacilityOpen ? 'bg-lime-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Battery Storage Facility Monitor"
          >
            <BatteryIcon2 className="h-4 w-4" />
            {batteryStorageFacilityOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-lime-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setDistrictHeatingPlant({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${districtHeatingPlantOpen ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="District Heating Plant Monitor"
          >
            <ThermometerIcon25 className="h-4 w-4" />
            {districtHeatingPlantOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setWaterTreatmentUtility({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${waterTreatmentUtilityOpen ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Water Treatment Utility Monitor"
          >
            <DropletIcon18 className="h-4 w-4" />
            {waterTreatmentUtilityOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-400" />}
          </button>
          {/* Task 130: Mining, Minerals & Raw Materials */}
          <button
            onClick={() => useMapStore.getState().setGoldMineOperation({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${goldMineOperationOpen ? 'bg-yellow-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Gold Mine Operation Monitor"
          >
            <MedalIcon2 className="h-4 w-4" />
            {goldMineOperationOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCopperMineOutput({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${copperMineOutputOpen ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Copper Mine Output Monitor"
          >
            <CopperCircleIcon className="h-4 w-4" />
            {copperMineOutputOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setIronOreExtraction({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${ironOreExtractionOpen ? 'bg-stone-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Iron Ore Extraction Monitor"
          >
            <PickaxeIcon3 className="h-4 w-4" />
            {ironOreExtractionOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-stone-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCoalMineProduction({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${coalMineProductionOpen ? 'bg-gray-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Coal Mine Production Monitor"
          >
            <MountainIcon3 className="h-4 w-4" />
            {coalMineProductionOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-gray-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setDiamondMineOutput({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${diamondMineOutputOpen ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Diamond Mine Output Monitor"
          >
            <DiamondIcon2 className="h-4 w-4" />
            {diamondMineOutputOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setRareEarthMineral({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${rareEarthMineralOpen ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Rare Earth Mineral Monitor"
          >
            <GemIcon8 className="h-4 w-4" />
            {rareEarthMineralOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-violet-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setLithiumExtraction({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${lithiumExtractionOpen ? 'bg-lime-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Lithium Extraction Monitor"
          >
            <BatteryIcon3 className="h-4 w-4" />
            {lithiumExtractionOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-lime-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setUraniumMiningSite({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${uraniumMiningSiteOpen ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Uranium Mining Site Monitor"
          >
            <AtomIcon3 className="h-4 w-4" />
            {uraniumMiningSiteOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400" />}
          </button>
          {/* Task 131: Transportation & Logistics Hubs */}
          <button
            onClick={() => useMapStore.getState().setAirportTerminalStatus({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${airportTerminalStatusOpen ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Airport Terminal Status Monitor"
          >
            <PlaneLandingIcon className="h-4 w-4" />
            {airportTerminalStatusOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-sky-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSeaportContainerTerminal({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${seaportContainerTerminalOpen ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Seaport Container Terminal Monitor"
          >
            <ShipWheelIcon className="h-4 w-4" />
            {seaportContainerTerminalOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setRailwayStationTraffic({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${railwayStationTrafficOpen ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Railway Station Traffic Monitor"
          >
            <TrainTrackIcon className="h-4 w-4" />
            {railwayStationTrafficOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCargoWarehouseStatus({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${cargoWarehouseStatusOpen ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Cargo Warehouse Status Monitor"
          >
            <WarehouseIcon2 className="h-4 w-4" />
            {cargoWarehouseStatusOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBorderCrossingQueue({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${borderCrossingQueueOpen ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Border Crossing Queue Monitor"
          >
            <FlagTriangleRightIcon className="h-4 w-4" />
            {borderCrossingQueueOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-purple-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setHighwayTollPlaza({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${highwayTollPlazaOpen ? 'bg-teal-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Highway Toll Plaza Monitor"
          >
            <CoinsIcon2 className="h-4 w-4" />
            {highwayTollPlazaOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-teal-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setInlandContainerDepot({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${inlandContainerDepotOpen ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Inland Container Depot Monitor"
          >
            <ContainerIcon3 className="h-4 w-4" />
            {inlandContainerDepotOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-violet-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setLastMileDeliveryHub({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${lastMileDeliveryHubOpen ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Last Mile Delivery Hub Monitor"
          >
            <PackageCheckIcon className="h-4 w-4" />
            {lastMileDeliveryHubOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-400" />}
          </button>
          {/* Task 132: Maritime & Shipping */}
          <button
            onClick={() => useMapStore.getState().setVesselTrafficManagement({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${vesselTrafficManagementOpen ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Vessel Traffic Management Monitor"
          >
            <RadarIcon className="h-4 w-4" />
            {vesselTrafficManagementOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setMaritimePiracyAlert({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${maritimePiracyAlertOpen ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Maritime Piracy Alert Monitor"
          >
            <SkullIcon className="h-4 w-4" />
            {maritimePiracyAlertOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setLighthouseNavigation({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${lighthouseNavigationOpen ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Lighthouse Navigation Monitor"
          >
            <SailboatIcon className="h-4 w-4" />
            {lighthouseNavigationOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSearchAndRescueOperation({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${searchAndRescueOperationOpen ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Search And Rescue Operation Monitor"
          >
            <LifeBuoyIcon2 className="h-4 w-4" />
            {searchAndRescueOperationOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setMarinePollutionResponse({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${marinePollutionResponseOpen ? 'bg-stone-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Marine Pollution Response Monitor"
          >
            <BiohazardIcon3 className="h-4 w-4" />
            {marinePollutionResponseOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-stone-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCoastalPilotService({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${coastalPilotServiceOpen ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Coastal Pilot Service Monitor"
          >
            <CompassIcon6 className="h-4 w-4" />
            {coastalPilotServiceOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setShipbreakingYard({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${shipbreakingYardOpen ? 'bg-zinc-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Shipbreaking Yard Monitor"
          >
            <RecycleIcon className="h-4 w-4" />
            {shipbreakingYardOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-zinc-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setMaritimeFuelBunker({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${maritimeFuelBunkerOpen ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Maritime Fuel Bunker Monitor"
          >
            <FuelIcon2 className="h-4 w-4" />
            {maritimeFuelBunkerOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-400" />}
          </button>
          {/* Task 133: Aviation & Aerospace */}
          <button
            onClick={() => useMapStore.getState().setAirTrafficControl({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${airTrafficControlOpen ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Air Traffic Control Monitor"
          >
            <PlaneTakeoffIcon className="h-4 w-4" />
            {airTrafficControlOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-sky-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSpaceportLaunchSite({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${spaceportLaunchSiteOpen ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Spaceport Launch Site Monitor"
          >
            <RocketIcon2 className="h-4 w-4" />
            {spaceportLaunchSiteOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-violet-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setWeatherRadarStation({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${weatherRadarStationOpen ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Weather Radar Station Monitor"
          >
            <CloudRainIcon2 className="h-4 w-4" />
            {weatherRadarStationOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setFlightRouteCongestion({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${flightRouteCongestionOpen ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Flight Route Congestion Monitor"
          >
            <PlaneIcon2 className="h-4 w-4" />
            {flightRouteCongestionOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setAircraftHangarFacility({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${aircraftHangarFacilityOpen ? 'bg-slate-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Aircraft Hangar Facility Monitor"
          >
            <BuildingIcon4 className="h-4 w-4" />
            {aircraftHangarFacilityOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-slate-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setRunwayOccupancy({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${runwayOccupancyOpen ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Runway Occupancy Monitor"
          >
            <PlaneLandingIcon2 className="h-4 w-4" />
            {runwayOccupancyOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSatelliteLaunchSchedule({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${satelliteLaunchScheduleOpen ? 'bg-fuchsia-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Satellite Launch Schedule Monitor"
          >
            <SatelliteDishIcon className="h-4 w-4" />
            {satelliteLaunchScheduleOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-fuchsia-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setAviationFuelDepot({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${aviationFuelDepotOpen ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Aviation Fuel Depot Monitor"
          >
            <FuelIcon3 className="h-4 w-4" />
            {aviationFuelDepotOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-400" />}
          </button>
          {/* Task 134: Construction & Infrastructure */}
          <button
            onClick={() => useMapStore.getState().setMegaProjectConstruction({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${megaProjectConstructionOpen ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Mega Project Construction Monitor"
          >
            <HardHatIcon className="h-4 w-4" />
            {megaProjectConstructionOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBridgeStructuralIntegrity({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${bridgeStructuralIntegrityOpen ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Bridge Structural Integrity Monitor"
          >
            <LandmarkIcon4 className="h-4 w-4" />
            {bridgeStructuralIntegrityOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setTunnelVentilationSystem({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${tunnelVentilationSystemOpen ? 'bg-stone-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Tunnel Ventilation System Monitor"
          >
            <WindIcon20 className="h-4 w-4" />
            {tunnelVentilationSystemOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-stone-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSkyscraperElevator({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${skyscraperElevatorOpen ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Skyscraper Elevator Monitor"
          >
            <ArrowUpDownIcon className="h-4 w-4" />
            {skyscraperElevatorOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-indigo-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setDamConstructionProgress({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${damConstructionProgressOpen ? 'bg-teal-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Dam Construction Progress Monitor"
          >
            <DropletIcon19 className="h-4 w-4" />
            {damConstructionProgressOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-teal-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setHighwayExpansionProject({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${highwayExpansionProjectOpen ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Highway Expansion Project Monitor"
          >
            <TrafficConeIcon className="h-4 w-4" />
            {highwayExpansionProjectOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCementPlantOutput({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${cementPlantOutputOpen ? 'bg-zinc-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Cement Plant Output Monitor"
          >
            <FactoryIcon6 className="h-4 w-4" />
            {cementPlantOutputOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-zinc-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCraneFleetOperation({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${craneFleetOperationOpen ? 'bg-yellow-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Crane Fleet Operation Monitor"
          >
            <ConstructionIcon3 className="h-4 w-4" />
            {craneFleetOperationOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSteelMillOperation({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${steelMillOperationOpen ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Steel Mill Operation Monitor"
          >
            <FlameIcon24 className="h-4 w-4" />
            {steelMillOperationOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setAluminumSmelter({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${aluminumSmelterOpen ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Aluminum Smelter Monitor"
          >
            <ZapIcon6 className="h-4 w-4" />
            {aluminumSmelterOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSemiconductorFab({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${semiconductorFabOpen ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Semiconductor Fab Monitor"
          >
            <CpuIcon className="h-4 w-4" />
            {semiconductorFabOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-purple-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setAutomobileAssemblyPlant({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${automobileAssemblyPlantOpen ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Auto Assembly Plant Monitor"
          >
            <CarIcon4 className="h-4 w-4" />
            {automobileAssemblyPlantOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setPaperPulpMill({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${paperPulpMillOpen ? 'bg-stone-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Paper & Pulp Mill Monitor"
          >
            <FileTextIcon className="h-4 w-4" />
            {paperPulpMillOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-stone-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setGlassManufacturing({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${glassManufacturingOpen ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Glass Manufacturing Monitor"
          >
            <SparklesIcon10 className="h-4 w-4" />
            {glassManufacturingOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-sky-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setChemicalProcessingPlant({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${chemicalProcessingPlantOpen ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Chemical Processing Plant Monitor"
          >
            <FlaskConicalIcon9 className="h-4 w-4" />
            {chemicalProcessingPlantOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setTextileMillOperation({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${textileMillOperationOpen ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Textile Mill Operation Monitor"
          >
            <ShirtIcon className="h-4 w-4" />
            {textileMillOperationOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setNavalBaseOperation({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${navalBaseOperationOpen ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Naval Base Operation Monitor"
          >
            <AnchorIcon5 className="h-4 w-4" />
            {navalBaseOperationOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setAirForceBase({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${airForceBaseOpen ? 'bg-sky-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Air Force Base Monitor"
          >
            <PlaneIcon3 className="h-4 w-4" />
            {airForceBaseOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-sky-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setArmyBaseReadiness({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${armyBaseReadinessOpen ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Army Base Readiness Monitor"
          >
            <ShieldIcon7 className="h-4 w-4" />
            {armyBaseReadinessOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setMissileDefenseBattery({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${missileDefenseBatteryOpen ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Missile Defense Battery Monitor"
          >
            <TargetIcon className="h-4 w-4" />
            {missileDefenseBatteryOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setEarlyWarningRadar({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${earlyWarningRadarOpen ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Early Warning Radar Monitor"
          >
            <RadarIcon2 className="h-4 w-4" />
            {earlyWarningRadarOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setMilitaryTrainingRange({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${militaryTrainingRangeOpen ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Military Training Range Monitor"
          >
            <CrosshairIcon className="h-4 w-4" />
            {militaryTrainingRangeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCommandBunkerFacility({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${commandBunkerFacilityOpen ? 'bg-zinc-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Command Bunker Facility Monitor"
          >
            <ShieldIcon8 className="h-4 w-4" />
            {commandBunkerFacilityOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-zinc-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setDefenseLogisticsDepot({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${defenseLogisticsDepotOpen ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Defense Logistics Depot Monitor"
          >
            <PackageIcon2 className="h-4 w-4" />
            {defenseLogisticsDepotOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-slate-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setParliamentChamber({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${parliamentChamberOpen ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Parliament Chamber Monitor"
          >
            <LandmarkIcon5 className="h-4 w-4" />
            {parliamentChamberOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setPresidentialPalace({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${presidentialPalaceOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Presidential Palace Monitor"
          >
            <CrownIcon className="h-4 w-4" />
            {presidentialPalaceOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSupremeCourt({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${supremeCourtOpen ? 'bg-red-800 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Supreme Court Monitor"
          >
            <ScaleIcon2 className="h-4 w-4" />
            {supremeCourtOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setEmbassyCompound({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${embassyCompoundOpen ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Embassy Compound Monitor"
          >
            <FlagIcon5 className="h-4 w-4" />
            {embassyCompoundOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setMinistryHeadquarters({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${ministryHeadquartersOpen ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Ministry Headquarters Monitor"
          >
            <Building2Icon6 className="h-4 w-4" />
            {ministryHeadquartersOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-slate-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCityHallCivic({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${cityHallCivicOpen ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="City Hall Civic Monitor"
          >
            <BuildingIcon5 className="h-4 w-4" />
            {cityHallCivicOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setStateLegislature({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${stateLegislatureOpen ? 'bg-violet-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="State Legislature Monitor"
          >
            <VoteIcon className="h-4 w-4" />
            {stateLegislatureOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-violet-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setGovernorMansion({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${governorMansionOpen ? 'bg-green-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Governor Mansion Monitor"
          >
            <HomeIcon className="h-4 w-4" />
            {governorMansionOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCathedralBasilica({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${cathedralBasilicaOpen ? 'bg-yellow-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Cathedral & Basilica Monitor"
          >
            <LandmarkIcon6 className="h-4 w-4" />
            {cathedralBasilicaOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBuddhistTemple({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${buddhistTempleOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Buddhist Temple Monitor"
          >
            <SunriseIcon className="h-4 w-4" />
            {buddhistTempleOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setMosqueCompound({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${mosqueCompoundOpen ? 'bg-teal-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Mosque Compound Monitor"
          >
            <MoonIcon4 className="h-4 w-4" />
            {mosqueCompoundOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-teal-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSynagogueHeritage({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${synagogueHeritageOpen ? 'bg-indigo-800 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Synagogue Heritage Monitor"
          >
            <StarIcon className="h-4 w-4" />
            {synagogueHeritageOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-indigo-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setHinduTemple({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${hinduTempleOpen ? 'bg-red-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Hindu Temple Monitor"
          >
            <FlameIcon25 className="h-4 w-4" />
            {hinduTempleOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setShintoShrine({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${shintoShrineOpen ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Shinto Shrine Monitor"
          >
            <TreePineIcon11 className="h-4 w-4" />
            {shintoShrineOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setMonasteryAbbey({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${monasteryAbbeyOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Monastery & Abbey Monitor"
          >
            <MountainIcon20 className="h-4 w-4" />
            {monasteryAbbeyOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setPilgrimageSite({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${pilgrimageSiteOpen ? 'bg-violet-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Pilgrimage Site Monitor"
          >
            <FootprintsIcon4 className="h-4 w-4" />
            {pilgrimageSiteOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-violet-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBreweryFermentation({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${breweryFermentationOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Brewery Fermentation Monitor"
          >
            <BeerIcon className="h-4 w-4" />
            {breweryFermentationOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setWineryVineyardCellar({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${wineryVineyardCellarOpen ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Winery & Vineyard Cellar Monitor"
          >
            <GrapeIcon className="h-4 w-4" />
            {wineryVineyardCellarOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setDistilleryOperation({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${distilleryOperationOpen ? 'bg-yellow-800 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Distillery Operation Monitor"
          >
            <FlaskConicalIcon10 className="h-4 w-4" />
            {distilleryOperationOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-500" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBottlingPlantLine({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${bottlingPlantLineOpen ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Bottling Plant Line Monitor"
          >
            <FactoryIcon7 className="h-4 w-4" />
            {bottlingPlantLineOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCoffeeRoasteryBatch({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${coffeeRoasteryBatchOpen ? 'bg-stone-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Coffee Roastery Batch Monitor"
          >
            <CoffeeIcon className="h-4 w-4" />
            {coffeeRoasteryBatchOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-stone-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setTeaProcessingFacility({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${teaProcessingFacilityOpen ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Tea Processing Facility Monitor"
          >
            <LeafIcon10 className="h-4 w-4" />
            {teaProcessingFacilityOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setJuiceProcessingLine({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${juiceProcessingLineOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Juice Processing Line Monitor"
          >
            <CitrusIcon className="h-4 w-4" />
            {juiceProcessingLineOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSoftDrinkBottling({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${softDrinkBottlingOpen ? 'bg-red-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Soft Drink Bottling Monitor"
          >
            <CupSodaIcon className="h-4 w-4" />
            {softDrinkBottlingOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCasinoGamingFloor({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${casinoGamingFloorOpen ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Casino Gaming Floor Monitor"
          >
            <DicesIcon className="h-4 w-4" />
            {casinoGamingFloorOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setZooWildlifePark({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${zooWildlifeParkOpen ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Zoo Wildlife Park Monitor"
          >
            <PawPrintIcon2 className="h-4 w-4" />
            {zooWildlifeParkOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setAquariumMarineExhibit({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${aquariumMarineExhibitOpen ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Aquarium Marine Exhibit Monitor"
          >
            <FishIcon10 className="h-4 w-4" />
            {aquariumMarineExhibitOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setPlanetariumShow({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${planetariumShowOpen ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Planetarium Show Monitor"
          >
            <OrbitIcon2 className="h-4 w-4" />
            {planetariumShowOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-indigo-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setOperaHouseSchedule({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${operaHouseScheduleOpen ? 'bg-purple-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Opera House Schedule Monitor"
          >
            <MusicIcon3 className="h-4 w-4" />
            {operaHouseScheduleOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-purple-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setArtGalleryExhibit({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${artGalleryExhibitOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Art Gallery Exhibit Monitor"
          >
            <PaletteIcon className="h-4 w-4" />
            {artGalleryExhibitOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBotanicalGarden({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${botanicalGardenOpen ? 'bg-teal-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Botanical Garden Monitor"
          >
            <FlowerIcon2 className="h-4 w-4" />
            {botanicalGardenOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-teal-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBowlingAlleyLane({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${bowlingAlleyLaneOpen ? 'bg-fuchsia-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Bowling Alley Lane Monitor"
          >
            <CircleDotIcon5 className="h-4 w-4" />
            {bowlingAlleyLaneOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-fuchsia-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setHotelChainOperation({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${hotelChainOperationOpen ? 'bg-violet-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Hotel Chain Operation Monitor"
          >
            <Building2Icon7 className="h-4 w-4" />
            {hotelChainOperationOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-violet-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setResortSpaWellness({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${resortSpaWellnessOpen ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Resort Spa Wellness Monitor"
          >
            <BathIcon className="h-4 w-4" />
            {resortSpaWellnessOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-teal-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setHostelBackpacker({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${hostelBackpackerOpen ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Hostel Backpacker Monitor"
          >
            <BedIcon className="h-4 w-4" />
            {hostelBackpackerOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBedBreakfastInn({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${bedBreakfastInnOpen ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Bed Breakfast Inn Monitor"
          >
            <HomeIcon2 className="h-4 w-4" />
            {bedBreakfastInnOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setVacationRentalProperty({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${vacationRentalPropertyOpen ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Vacation Rental Property Monitor"
          >
            <KeyIcon className="h-4 w-4" />
            {vacationRentalPropertyOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-pink-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setConventionCenterBooking({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${conventionCenterBookingOpen ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Convention Center Booking Monitor"
          >
            <CalendarIcon className="h-4 w-4" />
            {conventionCenterBookingOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setServicedApartment({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${servicedApartmentOpen ? 'bg-stone-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Serviced Apartment Monitor"
          >
            <BuildingIcon7 className="h-4 w-4" />
            {servicedApartmentOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-stone-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCampgroundRvPark({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${campgroundRvParkOpen ? 'bg-green-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Campground RV Park Monitor"
          >
            <TentIcon className="h-4 w-4" />
            {campgroundRvParkOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setFastFoodChain({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${fastFoodChainOpen ? 'bg-red-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Fast Food Chain Monitor"
          >
            <DrumstickIcon className="h-4 w-4" />
            {fastFoodChainOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCoffeeShopCafe({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${coffeeShopCafeOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Coffee Shop Cafe Monitor"
          >
            <CoffeeIcon2 className="h-4 w-4" />
            {coffeeShopCafeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBakeryPastryShop({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${bakeryPastryShopOpen ? 'bg-yellow-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Bakery Pastry Shop Monitor"
          >
            <CroissantIcon className="h-4 w-4" />
            {bakeryPastryShopOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setFineDiningRestaurant({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${fineDiningRestaurantOpen ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Fine Dining Restaurant Monitor"
          >
            <UtensilsIcon2 className="h-4 w-4" />
            {fineDiningRestaurantOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-zinc-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBarPubTavern({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${barPubTavernOpen ? 'bg-purple-800 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Bar Pub Tavern Monitor"
          >
            <WineIcon className="h-4 w-4" />
            {barPubTavernOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-purple-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setFoodTruckFleet({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${foodTruckFleetOpen ? 'bg-lime-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Food Truck Fleet Monitor"
          >
            <TruckIcon className="h-4 w-4" />
            {foodTruckFleetOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-lime-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setIceCreamParlor({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${iceCreamParlorOpen ? 'bg-pink-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Ice Cream Parlor Monitor"
          >
            <IceCreamIcon className="h-4 w-4" />
            {iceCreamParlorOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-pink-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setPizzeriaChain({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${pizzeriaChainOpen ? 'bg-red-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Pizzeria Chain Monitor"
          >
            <PizzaIcon className="h-4 w-4" />
            {pizzeriaChainOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setHairSalonChain({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${hairSalonChainOpen ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Hair Salon Chain Monitor"
          >
            <ScissorsIcon className="h-4 w-4" />
            {hairSalonChainOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBarberShopClassic({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${barberShopClassicOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Barber Shop Classic Monitor"
          >
            <BrushIcon className="h-4 w-4" />
            {barberShopClassicOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setNailSpaManicure({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${nailSpaManicureOpen ? 'bg-pink-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Nail Spa Manicure Monitor"
          >
            <FlowerIcon3 className="h-4 w-4" />
            {nailSpaManicureOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-pink-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setTattooParlorStudio({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${tattooParlorStudioOpen ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Tattoo Parlor Studio Monitor"
          >
            <HeartIcon className="h-4 w-4" />
            {tattooParlorStudioOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-zinc-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCosmeticsBeautyStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${cosmeticsBeautyStoreOpen ? 'bg-fuchsia-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Cosmetics Beauty Store Monitor"
          >
            <SprayCanIcon className="h-4 w-4" />
            {cosmeticsBeautyStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-fuchsia-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setMassageTherapySpa({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${massageTherapySpaOpen ? 'bg-teal-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Massage Therapy Spa Monitor"
          >
            <HandIcon className="h-4 w-4" />
            {massageTherapySpaOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-teal-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setEstheticianMedSpa({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${estheticianMedSpaOpen ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Esthetician Med Spa Monitor"
          >
            <SmileIcon className="h-4 w-4" />
            {estheticianMedSpaOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-pink-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setTanningSalonStudio({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${tanningSalonStudioOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Tanning Salon Studio Monitor"
          >
            <SunIcon14 className="h-4 w-4" />
            {tanningSalonStudioOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCarWashTunnel({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${carWashTunnelOpen ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Car Wash Tunnel Monitor"
          >
            <CarIcon5 className="h-4 w-4" />
            {carWashTunnelOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setAutoRepairGarage({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${autoRepairGarageOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Auto Repair Garage Monitor"
          >
            <WrenchIcon className="h-4 w-4" />
            {autoRepairGarageOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCarDealershipShowroom({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${carDealershipShowroomOpen ? 'bg-red-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Car Dealership Showroom Monitor"
          >
            <CarFrontIcon className="h-4 w-4" />
            {carDealershipShowroomOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setTireAutoCare({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${tireAutoCareOpen ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Tire Auto Care Monitor"
          >
            <CircleDotIcon6 className="h-4 w-4" />
            {tireAutoCareOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-zinc-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setOilChangeQuick({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${oilChangeQuickOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Oil Change Quick Monitor"
          >
            <DropletIcon20 className="h-4 w-4" />
            {oilChangeQuickOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setEmissionsInspection({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${emissionsInspectionOpen ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Emissions Inspection Monitor"
          >
            <GaugeIcon4 className="h-4 w-4" />
            {emissionsInspectionOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setAutoPartsStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${autoPartsStoreOpen ? 'bg-stone-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Auto Parts Store Monitor"
          >
            <CogIcon className="h-4 w-4" />
            {autoPartsStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-stone-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCarRentalAgency({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${carRentalAgencyOpen ? 'bg-purple-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Car Rental Agency Monitor"
          >
            <KeyRoundIcon className="h-4 w-4" />
            {carRentalAgencyOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-purple-400" />}
          </button>
          {/* Task 145: Pet & Veterinary Services */}
          <button
            onClick={() => useMapStore.getState().setVeterinaryClinic({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${veterinaryClinicOpen ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Veterinary Clinic Monitor"
          >
            <StethoscopeIcon2 className="h-4 w-4" />
            {veterinaryClinicOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setPetGroomingSalon({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${petGroomingSalonOpen ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Pet Grooming Salon Monitor"
          >
            <ScissorsIcon2 className="h-4 w-4" />
            {petGroomingSalonOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setPetBoardingKennel({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${petBoardingKennelOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Pet Boarding Kennel Monitor"
          >
            <HomeIcon3 className="h-4 w-4" />
            {petBoardingKennelOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setAnimalShelterRescue({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${animalShelterRescueOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Animal Shelter & Rescue Monitor"
          >
            <HeartIcon2 className="h-4 w-4" />
            {animalShelterRescueOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setPetStoreRetail({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${petStoreRetailOpen ? 'bg-fuchsia-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Pet Store Retail Monitor"
          >
            <ShoppingBagIcon3 className="h-4 w-4" />
            {petStoreRetailOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-fuchsia-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setDogParkActivity({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${dogParkActivityOpen ? 'bg-lime-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Dog Park Activity Monitor"
          >
            <TreePineIcon12 className="h-4 w-4" />
            {dogParkActivityOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-lime-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setVeterinaryHospitalEmergency({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${veterinaryHospitalEmergencyOpen ? 'bg-red-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Vet Hospital ER Monitor"
          >
            <SirenIcon4 className="h-4 w-4" />
            {veterinaryHospitalEmergencyOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setPetDaycareCenter({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${petDaycareCenterOpen ? 'bg-teal-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Pet Daycare Center Monitor"
          >
            <BabyIcon2 className="h-4 w-4" />
            {petDaycareCenterOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-teal-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setPetTrainingObedienceSchool({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${petTrainingObedienceSchoolOpen ? 'bg-violet-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Pet Training School Monitor"
          >
            <GraduationCapIcon2 className="h-4 w-4" />
            {petTrainingObedienceSchoolOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-violet-400" />}
          </button>
          {/* Task 146: Childcare & Daycare Services */}
          <button
            onClick={() => useMapStore.getState().setPreschoolKindergarten({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${preschoolKindergartenOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Preschool & Kindergarten Monitor"
          >
            <BookOpenIcon className="h-4 w-4" />
            {preschoolKindergartenOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setMontessoriEarlyLearning({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${montessoriEarlyLearningOpen ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Montessori Early Learning Monitor"
          >
            <PuzzleIcon className="h-4 w-4" />
            {montessoriEarlyLearningOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setDaycareInfantCenter({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${daycareInfantCenterOpen ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Daycare Infant Center Monitor"
          >
            <BabyIcon3 className="h-4 w-4" />
            {daycareInfantCenterOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setAfterSchoolProgram({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${afterSchoolProgramOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="After-School Program Monitor"
          >
            <BackpackIcon className="h-4 w-4" />
            {afterSchoolProgramOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setNurserySchool({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${nurserySchoolOpen ? 'bg-green-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Nursery School Monitor"
          >
            <AppleIcon2 className="h-4 w-4" />
            {nurserySchoolOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setEarlyLearningCenter({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${earlyLearningCenterOpen ? 'bg-purple-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Early Learning Center Monitor"
          >
            <BlocksIcon className="h-4 w-4" />
            {earlyLearningCenterOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-purple-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setNannyAgencyService({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${nannyAgencyServiceOpen ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Nanny Agency Service Monitor"
          >
            <SmileIcon2 className="h-4 w-4" />
            {nannyAgencyServiceOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBabysittingService({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${babysittingServiceOpen ? 'bg-pink-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Babysitting Service Monitor"
          >
            <HeartIcon3 className="h-4 w-4" />
            {babysittingServiceOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-pink-400" />}
          </button>
          {/* Task 147: Hardware & Tools Retail */}
          <button
            onClick={() => useMapStore.getState().setHardwareStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${hardwareStoreOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Hardware Store Monitor"
          >
            <WrenchIcon className="h-4 w-4" />
            {hardwareStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setPowerToolsRetail({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${powerToolsRetailOpen ? 'bg-red-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Power Tools Retail Monitor"
          >
            <DrillIcon3 className="h-4 w-4" />
            {powerToolsRetailOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setPlumbingSupply({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${plumbingSupplyOpen ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Plumbing Supply Monitor"
          >
            <CogIcon5 className="h-4 w-4" />
            {plumbingSupplyOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setElectricalSupply({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${electricalSupplyOpen ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Electrical Supply Monitor"
          >
            <PlugIcon className="h-4 w-4" />
            {electricalSupplyOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBuildingMaterials({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${buildingMaterialsOpen ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Building Materials Monitor"
          >
            <HardHatIcon2 className="h-4 w-4" />
            {buildingMaterialsOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-stone-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setFastenersIndustrial({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${fastenersIndustrialOpen ? 'bg-zinc-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Fasteners Industrial Monitor"
          >
            <BoltIcon className="h-4 w-4" />
            {fastenersIndustrialOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-zinc-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setPaintDecorating({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${paintDecoratingOpen ? 'bg-fuchsia-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Paint & Decorating Monitor"
          >
            <PaintBucketIcon className="h-4 w-4" />
            {paintDecoratingOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-fuchsia-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setLawnGardenEquipment({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${lawnGardenEquipmentOpen ? 'bg-green-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Lawn & Garden Equipment Monitor"
          >
            <SproutIcon4 className="h-4 w-4" />
            {lawnGardenEquipmentOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-400" />}
          </button>
          {/* Task 148: Jewelry & Watches */}
          <button
            onClick={() => useMapStore.getState().setLuxuryJewelryBoutique({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${luxuryJewelryBoutiqueOpen ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Luxury Jewelry Boutique Monitor"
          >
            <GemIcon7 className="h-4 w-4" />
            {luxuryJewelryBoutiqueOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setWatchBoutiqueRetail({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${watchBoutiqueRetailOpen ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Watch Boutique Retail Monitor"
          >
            <WatchIcon2 className="h-4 w-4" />
            {watchBoutiqueRetailOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-slate-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setEngagementRingStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${engagementRingStoreOpen ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Engagement Ring Store Monitor"
          >
            <DiamondIcon3 className="h-4 w-4" />
            {engagementRingStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setDiamondWholesaleDealer({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${diamondWholesaleDealerOpen ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Diamond Wholesale Dealer Monitor"
          >
            <DiamondIcon4 className="h-4 w-4" />
            {diamondWholesaleDealerOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setGemstoneJewelryDealer({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${gemstoneJewelryDealerOpen ? 'bg-purple-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Gemstone Jewelry Dealer Monitor"
          >
            <SparklesIcon11 className="h-4 w-4" />
            {gemstoneJewelryDealerOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-purple-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setEstateJewelryAuction({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${estateJewelryAuctionOpen ? 'bg-yellow-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Estate Jewelry Auction Monitor"
          >
            <CrownIcon2 className="h-4 w-4" />
            {estateJewelryAuctionOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCustomJewelryDesign({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${customJewelryDesignOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Custom Jewelry Design Monitor"
          >
            <AwardIcon4 className="h-4 w-4" />
            {customJewelryDesignOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setJewelryRepairAppraisal({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${jewelryRepairAppraisalOpen ? 'bg-teal-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Jewelry Repair & Appraisal Monitor"
          >
            <HourglassIcon className="h-4 w-4" />
            {jewelryRepairAppraisalOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-teal-400" />}
          </button>
          {/* Task 149: Florist & Garden Center */}
          <button
            onClick={() => useMapStore.getState().setFloristBoutiqueShop({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${floristBoutiqueShopOpen ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Florist Boutique Shop Monitor"
          >
            <FlowerIcon4 className="h-4 w-4" />
            {floristBoutiqueShopOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setGardenCenterNursery({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${gardenCenterNurseryOpen ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Garden Center Nursery Monitor"
          >
            <SproutIcon5 className="h-4 w-4" />
            {gardenCenterNurseryOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setGreenhouseGrower({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${greenhouseGrowerOpen ? 'bg-lime-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Greenhouse Grower Monitor"
          >
            <TreesIcon2 className="h-4 w-4" />
            {greenhouseGrowerOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-lime-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setLandscapeSupplyYard({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${landscapeSupplyYardOpen ? 'bg-stone-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Landscape Supply Yard Monitor"
          >
            <ShovelIcon className="h-4 w-4" />
            {landscapeSupplyYardOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-stone-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setFlowerMarketWholesale({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${flowerMarketWholesaleOpen ? 'bg-purple-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Flower Market Wholesale Monitor"
          >
            <Flower2Icon className="h-4 w-4" />
            {flowerMarketWholesaleOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-purple-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setFloralDesignStudio({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${floralDesignStudioOpen ? 'bg-fuchsia-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Floral Design Studio Monitor"
          >
            <ScissorsIcon3 className="h-4 w-4" />
            {floralDesignStudioOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-fuchsia-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setPlantNurseryRetail({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${plantNurseryRetailOpen ? 'bg-teal-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Plant Nursery Retail Monitor"
          >
            <LeafIcon11 className="h-4 w-4" />
            {plantNurseryRetailOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-teal-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setGardenToolEquipment({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${gardenToolEquipmentOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Garden Tool Equipment Monitor"
          >
            <TractorIcon className="h-4 w-4" />
            {gardenToolEquipmentOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />}
          </button>
          {/* Task 150: Home Improvement & Furniture */}
          <button
            onClick={() => useMapStore.getState().setFurnitureRetailChain({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${furnitureRetailChainOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Furniture Retail Chain Monitor"
          >
            <SofaIcon className="h-4 w-4" />
            {furnitureRetailChainOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setMattressBeddingStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${mattressBeddingStoreOpen ? 'bg-violet-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Mattress & Bedding Store Monitor"
          >
            <BedIcon2 className="h-4 w-4" />
            {mattressBeddingStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-violet-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setHomeDecorBoutique({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${homeDecorBoutiqueOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Home Decor Boutique Monitor"
          >
            <LampIcon className="h-4 w-4" />
            {homeDecorBoutiqueOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setLightingShowroom({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${lightingShowroomOpen ? 'bg-yellow-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Lighting Showroom Monitor"
          >
            <LampCeilingIcon className="h-4 w-4" />
            {lightingShowroomOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setFlooringStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${flooringStoreOpen ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Flooring Store Monitor"
          >
            <Grid3x3Icon className="h-4 w-4" />
            {flooringStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-slate-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setKitchenBathShowroom({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${kitchenBathShowroomOpen ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Kitchen & Bath Showroom Monitor"
          >
            <RulerIcon2 className="h-4 w-4" />
            {kitchenBathShowroomOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setApplianceRetailStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${applianceRetailStoreOpen ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Appliance Retail Store Monitor"
          >
            <LightbulbIcon2 className="h-4 w-4" />
            {applianceRetailStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-slate-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setWindowTreatmentStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${windowTreatmentStoreOpen ? 'bg-teal-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Window Treatment Store Monitor"
          >
            <BrickWallIcon className="h-4 w-4" />
            {windowTreatmentStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-teal-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setMunicipalWasteCollection({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${municipalWasteCollectionOpen ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Municipal Waste Collection Monitor"
          >
            <Trash2Icon className="h-4 w-4" />
            {municipalWasteCollectionOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setRecyclingCenter({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${recyclingCenterOpen ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Recycling Center Monitor"
          >
            <RecycleIcon2 className="h-4 w-4" />
            {recyclingCenterOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-teal-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setLandfillOperation({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${landfillOperationOpen ? 'bg-stone-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Landfill Operation Monitor"
          >
            <TrashIcon className="h-4 w-4" />
            {landfillOperationOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-stone-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCompostingFacility({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${compostingFacilityOpen ? 'bg-lime-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Composting Facility Monitor"
          >
            <LeafIcon12 className="h-4 w-4" />
            {compostingFacilityOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-lime-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setHazardousWasteDisposal({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${hazardousWasteDisposalOpen ? 'bg-red-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Hazardous Waste Disposal Monitor"
          >
            <BiohazardIcon className="h-4 w-4" />
            {hazardousWasteDisposalOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setScrapMetalYard({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${scrapMetalYardOpen ? 'bg-zinc-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Scrap Metal Yard Monitor"
          >
            <AnvilIcon className="h-4 w-4" />
            {scrapMetalYardOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-zinc-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setElectronicWasteFacility({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${electronicWasteFacilityOpen ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Electronic Waste Facility Monitor"
          >
            <CpuIcon2 className="h-4 w-4" />
            {electronicWasteFacilityOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-indigo-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setTransferStation({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${transferStationOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Transfer Station Monitor"
          >
            <PackagePlusIcon className="h-4 w-4" />
            {transferStationOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setToyRetailChain({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${toyRetailChainOpen ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Toy Retail Chain Monitor"
          >
            <GamepadIcon3 className="h-4 w-4" />
            {toyRetailChainOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setLegoBrandStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${legoBrandStoreOpen ? 'bg-yellow-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="LEGO Brand Store Monitor"
          >
            <BlocksIcon2 className="h-4 w-4" />
            {legoBrandStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBoardGameCafe({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${boardGameCafeOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Board Game Cafe Monitor"
          >
            <DicesIcon2 className="h-4 w-4" />
            {boardGameCafeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setComicBookShop({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${comicBookShopOpen ? 'bg-fuchsia-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Comic Book Shop Monitor"
          >
            <BookIcon3 className="h-4 w-4" />
            {comicBookShopOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-fuchsia-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setHobbyCraftStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${hobbyCraftStoreOpen ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Hobby Craft Store Monitor"
          >
            <PaletteIcon4 className="h-4 w-4" />
            {hobbyCraftStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setModelHobbyShop({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${modelHobbyShopOpen ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Model Hobby Shop Monitor"
          >
            <PlaneIcon4 className="h-4 w-4" />
            {modelHobbyShopOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-indigo-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setVideoGameRetailer({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${videoGameRetailerOpen ? 'bg-purple-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Video Game Retailer Monitor"
          >
            <GamepadIcon3 className="h-4 w-4" />
            {videoGameRetailerOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-purple-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBicycleRetailer({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${bicycleRetailerOpen ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Bicycle Retailer Monitor"
          >
            <BikeIcon3 className="h-4 w-4" />
            {bicycleRetailerOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setMusicInstrumentStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${musicInstrumentStoreOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Music Instrument Store Monitor"
          >
            <MusicIcon4 className="h-4 w-4" />
            {musicInstrumentStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setGuitarShop({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${guitarShopOpen ? 'bg-red-800 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Guitar Shop Monitor"
          >
            <GuitarIcon2 className="h-4 w-4" />
            {guitarShopOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setPianoShowroom({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${pianoShowroomOpen ? 'bg-zinc-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Piano Showroom Monitor"
          >
            <PianoIcon2 className="h-4 w-4" />
            {pianoShowroomOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-zinc-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setDrumShop({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${drumShopOpen ? 'bg-rose-800 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Drum Shop Monitor"
          >
            <DrumIcon2 className="h-4 w-4" />
            {drumShopOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setRecordingStudio({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${recordingStudioOpen ? 'bg-purple-800 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Recording Studio Monitor"
          >
            <MicIcon2 className="h-4 w-4" />
            {recordingStudioOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-purple-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setAudioEquipmentStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${audioEquipmentStoreOpen ? 'bg-blue-800 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Audio Equipment Store Monitor"
          >
            <HeadphonesIcon2 className="h-4 w-4" />
            {audioEquipmentStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSheetMusicShop({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${sheetMusicShopOpen ? 'bg-teal-800 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Sheet Music Shop Monitor"
          >
            <MusicIcon4 className="h-4 w-4" />
            {sheetMusicShopOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-teal-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setVinylRecordStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${vinylRecordStoreOpen ? 'bg-pink-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Vinyl Record Store Monitor"
          >
            <Disc3Icon className="h-4 w-4" />
            {vinylRecordStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-pink-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSportingGoodsChain({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${sportingGoodsChainOpen ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Sporting Goods Chain Monitor"
          >
            <DumbbellIcon2 className="h-4 w-4" />
            {sportingGoodsChainOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setAthleticFootwearStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${athleticFootwearStoreOpen ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Athletic Footwear Store Monitor"
          >
            <FootprintsIcon5 className="h-4 w-4" />
            {athleticFootwearStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setOutdoorAdventureGear({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${outdoorAdventureGearOpen ? 'bg-green-800 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Outdoor Adventure Gear Monitor"
          >
            <TentIcon2 className="h-4 w-4" />
            {outdoorAdventureGearOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setFitnessEquipmentStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${fitnessEquipmentStoreOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Fitness Equipment Store Monitor"
          >
            <ActivityIcon12 className="h-4 w-4" />
            {fitnessEquipmentStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setTeamSportApparel({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${teamSportApparelOpen ? 'bg-red-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Team Sport Apparel Monitor"
          >
            <TrophyIcon2 className="h-4 w-4" />
            {teamSportApparelOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSkiSnowboardShop({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${skiSnowboardShopOpen ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Ski & Snowboard Shop Monitor"
          >
            <SnowflakeIcon20 className="h-4 w-4" />
            {skiSnowboardShopOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-sky-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSurfWatersportShop({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${surfWatersportShopOpen ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Surf & Watersport Shop Monitor"
          >
            <WavesIcon29 className="h-4 w-4" />
            {surfWatersportShopOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSoccerSpecialtyStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${soccerSpecialtyStoreOpen ? 'bg-green-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Soccer Specialty Store Monitor"
          >
            <GoalIcon className="h-4 w-4" />
            {soccerSpecialtyStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setApparelRetailChain({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${apparelRetailChainOpen ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Apparel Retail Chain Monitor"
          >
            <ShoppingBagIcon4 className="h-4 w-4" />
            {apparelRetailChainOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setFootwearBoutique({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${footwearBoutiqueOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Footwear Boutique Monitor"
          >
            <FootprintsIcon6 className="h-4 w-4" />
            {footwearBoutiqueOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setFashionDepartmentStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${fashionDepartmentStoreOpen ? 'bg-purple-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Fashion Department Store Monitor"
          >
            <StoreIcon3 className="h-4 w-4" />
            {fashionDepartmentStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-purple-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setDenimJeansStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${denimJeansStoreOpen ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Denim & Jeans Store Monitor"
          >
            <ShirtIcon2 className="h-4 w-4" />
            {denimJeansStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setStreetwearBoutique({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${streetwearBoutiqueOpen ? 'bg-fuchsia-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Streetwear Boutique Monitor"
          >
            <SparklesIcon12 className="h-4 w-4" />
            {streetwearBoutiqueOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-fuchsia-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setWomensClothingStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${womensClothingStoreOpen ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Women's Clothing Store Monitor"
          >
            <CrownIcon3 className="h-4 w-4" />
            {womensClothingStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setMensClothingStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${mensClothingStoreOpen ? 'bg-zinc-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Men's Clothing Store Monitor"
          >
            <ScissorsIcon4 className="h-4 w-4" />
            {mensClothingStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-zinc-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setChildrensClothingStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${childrensClothingStoreOpen ? 'bg-yellow-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Children's Clothing Store Monitor"
          >
            <TagIcon className="h-4 w-4" />
            {childrensClothingStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setElectronicsRetailChain({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${electronicsRetailChainOpen ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Electronics Retail Chain Monitor"
          >
            <LaptopIcon className="h-4 w-4" />
            {electronicsRetailChainOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setComputerSpecialtyStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${computerSpecialtyStoreOpen ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Computer Specialty Store Monitor"
          >
            <MonitorIcon2 className="h-4 w-4" />
            {computerSpecialtyStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-slate-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSmartphoneStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${smartphoneStoreOpen ? 'bg-zinc-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Smartphone Store Monitor"
          >
            <SmartphoneIcon className="h-4 w-4" />
            {smartphoneStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-zinc-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setAudioVideoStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${audioVideoStoreOpen ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Audio Video Store Monitor"
          >
            <TvIcon2 className="h-4 w-4" />
            {audioVideoStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setGamingElectronicsStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${gamingElectronicsStoreOpen ? 'bg-fuchsia-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Gaming Electronics Store Monitor"
          >
            <Gamepad2Icon className="h-4 w-4" />
            {gamingElectronicsStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-fuchsia-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCameraPhotoStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${cameraPhotoStoreOpen ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Camera & Photo Store Monitor"
          >
            <CameraIcon2 className="h-4 w-4" />
            {cameraPhotoStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSmartHomeTechStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${smartHomeTechStoreOpen ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Smart Home Tech Store Monitor"
          >
            <CctvIcon className="h-4 w-4" />
            {smartHomeTechStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setRefurbishedElectronicsStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${refurbishedElectronicsStoreOpen ? 'bg-lime-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Refurbished Electronics Store Monitor"
          >
            <RecycleIcon3 className="h-4 w-4" />
            {refurbishedElectronicsStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-lime-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setOfficeSupplyChain({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${officeSupplyChainOpen ? 'bg-red-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Office Supply Chain Monitor"
          >
            <BriefcaseIcon className="h-4 w-4" />
            {officeSupplyChainOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setStationeryStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${stationeryStoreOpen ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Stationery Store Monitor"
          >
            <FeatherIcon className="h-4 w-4" />
            {stationeryStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setPrintCopyCenter({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${printCopyCenterOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Print & Copy Center Monitor"
          >
            <PrinterIcon className="h-4 w-4" />
            {printCopyCenterOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBusinessFurnitureStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${businessFurnitureStoreOpen ? 'bg-yellow-800 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Business Furniture Store Monitor"
          >
            <ClipboardIcon className="h-4 w-4" />
            {businessFurnitureStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setFilingStorageStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${filingStorageStoreOpen ? 'bg-cyan-800 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Filing & Storage Store Monitor"
          >
            <FolderIcon className="h-4 w-4" />
            {filingStorageStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setPenWritingStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${penWritingStoreOpen ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Pen & Writing Store Monitor"
          >
            <PenIcon className="h-4 w-4" />
            {penWritingStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-slate-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCorporateGiftingStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${corporateGiftingStoreOpen ? 'bg-violet-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Corporate Gifting Store Monitor"
          >
            <HighlighterIcon className="h-4 w-4" />
            {corporateGiftingStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-violet-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setShippingPackagingStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${shippingPackagingStoreOpen ? 'bg-yellow-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Shipping & Packaging Store Monitor"
          >
            <BoxIcon className="h-4 w-4" />
            {shippingPackagingStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBookstoreRetailChain({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${bookstoreRetailChainOpen ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Bookstore Retail Chain Monitor"
          >
            <BookOpenIcon2 className="h-4 w-4" />
            {bookstoreRetailChainOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setGiftSpecialtyShop({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${giftSpecialtyShopOpen ? 'bg-pink-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Gift Specialty Shop Monitor"
          >
            <GiftIcon2 className="h-4 w-4" />
            {giftSpecialtyShopOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-pink-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setWholesaleClubWarehouse({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${wholesaleClubWarehouseOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Wholesale Club Warehouse Monitor"
          >
            <WarehouseIcon3 className="h-4 w-4" />
            {wholesaleClubWarehouseOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setPartySupplyStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${partySupplyStoreOpen ? 'bg-fuchsia-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Party Supply Store Monitor"
          >
            <PartyPopperIcon2 className="h-4 w-4" />
            {partySupplyStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-fuchsia-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setPharmacyDrugStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${pharmacyDrugStoreOpen ? 'bg-teal-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Pharmacy & Drug Store Monitor"
          >
            <PillIcon2 className="h-4 w-4" />
            {pharmacyDrugStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-teal-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBuildingSupplyCenter({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${buildingSupplyCenterOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Building Supply Center Monitor"
          >
            <HammerIcon2 className="h-4 w-4" />
            {buildingSupplyCenterOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setGardenCenterFlorist({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${gardenCenterFloristOpen ? 'bg-green-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Garden Center & Florist Monitor"
          >
            <Flower2Icon2 className="h-4 w-4" />
            {gardenCenterFloristOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setAquariumPetSupply({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${aquariumPetSupplyOpen ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Aquarium & Pet Supply Monitor"
          >
            <FishIcon2 className="h-4 w-4" />
            {aquariumPetSupplyOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setToyHobbyStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${toyHobbyStoreOpen ? 'bg-red-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Toy & Hobby Store Monitor"
          >
            <ToyBrickIcon2 className="h-4 w-4" />
            {toyHobbyStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setJewelryWatchStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${jewelryWatchStoreOpen ? 'bg-yellow-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Jewelry & Watch Store Monitor"
          >
            <WatchIcon3 className="h-4 w-4" />
            {jewelryWatchStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setFurnitureHomeDecorStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${furnitureHomeDecorStoreOpen ? 'bg-stone-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Furniture & Home Decor Store Monitor"
          >
            <SofaIcon2 className="h-4 w-4" />
            {furnitureHomeDecorStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-stone-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setFlooringCarpetStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${flooringCarpetStoreOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Flooring & Carpet Store Monitor"
          >
            <SquareStackIcon className="h-4 w-4" />
            {flooringCarpetStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setKitchenBathFixtureStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${kitchenBathFixtureStoreOpen ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Kitchen & Bath Fixture Store Monitor"
          >
            <BathIcon2 className="h-4 w-4" />
            {kitchenBathFixtureStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setLightingCeilingFanStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${lightingCeilingFanStoreOpen ? 'bg-yellow-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Lighting & Ceiling Fan Store Monitor"
          >
            <LightbulbIcon4 className="h-4 w-4" />
            {lightingCeilingFanStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setArtFramingGalleryStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${artFramingGalleryStoreOpen ? 'bg-violet-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Art & Framing Gallery Store Monitor"
          >
            <PaletteIcon2 className="h-4 w-4" />
            {artFramingGalleryStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-violet-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setAntiquesCollectiblesStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${antiquesCollectiblesStoreOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Antiques & Collectibles Store Monitor"
          >
            <CrownIcon4 className="h-4 w-4" />
            {antiquesCollectiblesStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setVapeTobaccoShop({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${vapeTobaccoShopOpen ? 'bg-violet-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Vape & Tobacco Shop Monitor"
          >
            <CigaretteIcon className="h-4 w-4" />
            {vapeTobaccoShopOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-violet-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setLotteryNewsStand({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${lotteryNewsStandOpen ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Lottery & News Stand Monitor"
          >
            <NewspaperIcon className="h-4 w-4" />
            {lotteryNewsStandOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSportingGoodsOutdoor({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${sportingGoodsOutdoorOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Sporting Goods & Outdoor Monitor"
          >
            <DumbbellIcon3 className="h-4 w-4" />
            {sportingGoodsOutdoorOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBicycleShop({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${bicycleShopOpen ? 'bg-red-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Bicycle Shop Monitor"
          >
            <BikeIcon4 className="h-4 w-4" />
            {bicycleShopOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSkateSurfShop({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${skateSurfShopOpen ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Skate & Surf Shop Monitor"
          >
            <WavesIcon6 className="h-4 w-4" />
            {skateSurfShopOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setGunArcheryShop({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${gunArcheryShopOpen ? 'bg-stone-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Gun & Archery Shop Monitor"
          >
            <CrosshairIcon3 className="h-4 w-4" />
            {gunArcheryShopOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-stone-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setFishingTackleShop({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${fishingTackleShopOpen ? 'bg-teal-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Fishing & Tackle Shop Monitor"
          >
            <FishIcon11 className="h-4 w-4" />
            {fishingTackleShopOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-teal-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCraftBeerHomebrewShop({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${craftBeerHomebrewShopOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Craft Beer & Homebrew Shop Monitor"
          >
            <BeerIcon3 className="h-4 w-4" />
            {craftBeerHomebrewShopOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setWineSpiritsShop({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${wineSpiritsShopOpen ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Wine & Spirits Shop Monitor"
          >
            <WineIcon2 className="h-4 w-4" />
            {wineSpiritsShopOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCoffeeRoasterCafe({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${coffeeRoasterCafeOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Coffee Roaster & Cafe Monitor"
          >
            <CoffeeIcon3 className="h-4 w-4" />
            {coffeeRoasterCafeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setTeaSpiceMerchant({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${teaSpiceMerchantOpen ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Tea & Spice Merchant Monitor"
          >
            <LeafIcon2 className="h-4 w-4" />
            {teaSpiceMerchantOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setChocolateConfectionery({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${chocolateConfectioneryOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Chocolate & Confectionery Monitor"
          >
            <CookieIcon className="h-4 w-4" />
            {chocolateConfectioneryOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setDonutBakeryShop({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${donutBakeryShopOpen ? 'bg-pink-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Donut & Bakery Shop Monitor"
          >
            <DonutIcon className="h-4 w-4" />
            {donutBakeryShopOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-pink-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setIceCreamDessertShop({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${iceCreamDessertShopOpen ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Ice Cream & Dessert Shop Monitor"
          >
            <IceCreamConeIcon className="h-4 w-4" />
            {iceCreamDessertShopOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBagelDeliShop({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${bagelDeliShopOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Bagel & Deli Shop Monitor"
          >
            <SandwichIcon className="h-4 w-4" />
            {bagelDeliShopOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setPizzaItalianRestaurant({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${pizzaItalianRestaurantOpen ? 'bg-red-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Pizza & Italian Restaurant Monitor"
          >
            <PizzaIcon2 className="h-4 w-4" />
            {pizzaItalianRestaurantOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBurgerFryJoint({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${burgerFryJointOpen ? 'bg-red-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Burger & Fry Joint Monitor"
          >
            <BeefIcon2 className="h-4 w-4" />
            {burgerFryJointOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setTacoBurritoCantina({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${tacoBurritoCantinaOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Taco & Burrito Cantina Monitor"
          >
            <SoupIcon2 className="h-4 w-4" />
            {tacoBurritoCantinaOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSushiJapaneseRestaurant({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${sushiJapaneseRestaurantOpen ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Sushi & Japanese Restaurant Monitor"
          >
            <FishIcon12 className="h-4 w-4" />
            {sushiJapaneseRestaurantOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSteakhouseGrill({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${steakhouseGrillOpen ? 'bg-stone-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Steakhouse & Grill Monitor"
          >
            <DrumstickIcon2 className="h-4 w-4" />
            {steakhouseGrillOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-stone-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setButcherCharcuterieShop({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${butcherCharcuterieShopOpen ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Butcher & Charcuterie Shop Monitor"
          >
            <CroissantIcon2 className="h-4 w-4" />
            {butcherCharcuterieShopOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSeafoodFishMarket({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${seafoodFishMarketOpen ? 'bg-teal-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Seafood & Fish Market Monitor"
          >
            <ShrimpIcon className="h-4 w-4" />
            {seafoodFishMarketOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-teal-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setDinerBreakfastSpot({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${dinerBreakfastSpotOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Diner & Breakfast Spot Monitor"
          >
            <EggIcon2 className="h-4 w-4" />
            {dinerBreakfastSpotOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setJuiceBarSmoothieShop({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${juiceBarSmoothieShopOpen ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Juice Bar & Smoothie Shop Monitor"
          >
            <CitrusIcon2 className="h-4 w-4" />
            {juiceBarSmoothieShopOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setFrozenYogurtShop({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${frozenYogurtShopOpen ? 'bg-pink-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Frozen Yogurt Shop Monitor"
          >
            <IceCreamConeIcon2 className="h-4 w-4" />
            {frozenYogurtShopOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-pink-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCandySweetShop({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${candySweetShopOpen ? 'bg-fuchsia-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Candy & Sweet Shop Monitor"
          >
            <CandyIcon className="h-4 w-4" />
            {candySweetShopOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-fuchsia-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setHealthFoodStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${healthFoodStoreOpen ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Health Food Store Monitor"
          >
            <HeartPulseIcon className="h-4 w-4" />
            {healthFoodStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setVitaminSupplementShop({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${vitaminSupplementShopOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Vitamin & Supplement Shop Monitor"
          >
            <PillIcon3 className="h-4 w-4" />
            {vitaminSupplementShopOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setOrganicGroceryStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${organicGroceryStoreOpen ? 'bg-green-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Organic Grocery Store Monitor"
          >
            <SproutIcon6 className="h-4 w-4" />
            {organicGroceryStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setFarmersMarketStand({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${farmersMarketStandOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Farmers Market Stand Monitor"
          >
            <WheatIcon3 className="h-4 w-4" />
            {farmersMarketStandOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setEthnicGroceryStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${ethnicGroceryStoreOpen ? 'bg-violet-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Ethnic Grocery Store Monitor"
          >
            <Globe2Icon3 className="h-4 w-4" />
            {ethnicGroceryStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-violet-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setHalalKosherMarket({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${halalKosherMarketOpen ? 'bg-stone-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Halal & Kosher Market Monitor"
          >
            <ScaleIcon3 className="h-4 w-4" />
            {halalKosherMarketOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-stone-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBeverageDistributionCenter({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${beverageDistributionCenterOpen ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Beverage Distribution Center Monitor"
          >
            <TruckIcon2 className="h-4 w-4" />
            {beverageDistributionCenterOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setVendingMachineOperator({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${vendingMachineOperatorOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Vending Machine Operator Monitor"
          >
            <CircleDollarSignIcon className="h-4 w-4" />
            {vendingMachineOperatorOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setFoodTruckCommissary({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${foodTruckCommissaryOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Food Truck Commissary Monitor"
          >
            <UtensilsCrossedIcon className="h-4 w-4" />
            {foodTruckCommissaryOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCateringEventHall({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${cateringEventHallOpen ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Catering & Event Hall Monitor"
          >
            <PartyPopperIcon className="h-4 w-4" />
            {cateringEventHallOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCookingSchoolCulinaryInstitute({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${cookingSchoolCulinaryInstituteOpen ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Cooking School & Culinary Institute Monitor"
          >
            <ChefHatIcon className="h-4 w-4" />
            {cookingSchoolCulinaryInstituteOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setFoodBankPantry({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${foodBankPantryOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Food Bank & Pantry Monitor"
          >
            <HandHeartIcon className="h-4 w-4" />
            {foodBankPantryOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSoupKitchenShelter({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${soupKitchenShelterOpen ? 'bg-stone-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Soup Kitchen & Shelter Monitor"
          >
            <SoupIcon3 className="h-4 w-4" />
            {soupKitchenShelterOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-stone-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSchoolCafeteriaOperator({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${schoolCafeteriaOperatorOpen ? 'bg-teal-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="School Cafeteria Operator Monitor"
          >
            <AppleIcon3 className="h-4 w-4" />
            {schoolCafeteriaOperatorOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-teal-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setHospitalFoodService({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${hospitalFoodServiceOpen ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Hospital Food Service Monitor"
          >
            <HeartPulseIcon2 className="h-4 w-4" />
            {hospitalFoodServiceOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCorporateDiningService({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${corporateDiningServiceOpen ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Corporate Dining Service Monitor"
          >
            <BuildingIcon className="h-4 w-4" />
            {corporateDiningServiceOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setHotelRestaurantSupply({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${hotelRestaurantSupplyOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Hotel & Restaurant Supply Monitor"
          >
            <HotelIcon className="h-4 w-4" />
            {hotelRestaurantSupplyOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBarNightclubSupply({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${barNightclubSupplyOpen ? 'bg-fuchsia-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Bar & Nightclub Supply Monitor"
          >
            <WineIcon3 className="h-4 w-4" />
            {barNightclubSupplyOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-fuchsia-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBreweryTaproom({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${breweryTaproomOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Brewery & Taproom Monitor"
          >
            <BeerIcon2 className="h-4 w-4" />
            {breweryTaproomOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setDistilleryTastingRoom({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${distilleryTastingRoomOpen ? 'bg-yellow-800 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Distillery & Tasting Room Monitor"
          >
            <BeakerIcon className="h-4 w-4" />
            {distilleryTastingRoomOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-400" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setWineryVineyard({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${wineryVineyardOpen ? 'bg-purple-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Winery & Vineyard Monitor"
          >
            <GrapeIcon2 className="h-4 w-4" />
            {wineryVineyardOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-purple-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setWeddingEventVenue({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${weddingEventVenueOpen ? 'bg-pink-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Wedding & Event Venue Monitor"
          >
            <CakeIcon className="h-4 w-4" />
            {weddingEventVenueOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-pink-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setConferenceConventionCenter({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${conferenceConventionCenterOpen ? 'bg-stone-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Conference & Convention Center Monitor"
          >
            <BuildingIcon3 className="h-4 w-4" />
            {conferenceConventionCenterOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-stone-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setConcertMusicHall({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${concertMusicHallOpen ? 'bg-purple-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Concert & Music Hall Monitor"
          >
            <MusicIcon5 className="h-4 w-4" />
            {concertMusicHallOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-purple-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setStadiumArenaConcession({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${stadiumArenaConcessionOpen ? 'bg-green-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Stadium & Arena Concession Monitor"
          >
            <TrophyIcon3 className="h-4 w-4" />
            {stadiumArenaConcessionOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setMovieTheaterConcession({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${movieTheaterConcessionOpen ? 'bg-red-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Movie Theater Concession Monitor"
          >
            <FilmIcon2 className="h-4 w-4" />
            {movieTheaterConcessionOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setMuseumCafeGift({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${museumCafeGiftOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Museum Cafe & Gift Monitor"
          >
            <LandmarkIcon2 className="h-4 w-4" />
            {museumCafeGiftOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setThemeParkRestaurant({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${themeParkRestaurantOpen ? 'bg-fuchsia-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Theme Park Restaurant Monitor"
          >
            <PaletteIcon3 className="h-4 w-4" />
            {themeParkRestaurantOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-fuchsia-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCruiseShipGalley({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${cruiseShipGalleyOpen ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Cruise Ship Galley Monitor"
          >
            <ShipIcon2 className="h-4 w-4" />
            {cruiseShipGalleyOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setAirportFoodCourt({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${airportFoodCourtOpen ? 'bg-teal-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Airport Food Court Monitor"
          >
            <PlaneIcon5 className="h-4 w-4" />
            {airportFoodCourtOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-teal-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setHospitalCafeGiftShop({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${hospitalCafeGiftShopOpen ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Hospital Cafe & Gift Shop Monitor"
          >
            <CoffeeIcon4 className="h-4 w-4" />
            {hospitalCafeGiftShopOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setHotelRoomService({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${hotelRoomServiceOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Hotel Room Service Monitor"
          >
            <BellRingIcon className="h-4 w-4" />
            {hotelRoomServiceOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCasinoRestaurant({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${casinoRestaurantOpen ? 'bg-red-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Casino Restaurant Monitor"
          >
            <SpadeIcon className="h-4 w-4" />
            {casinoRestaurantOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setStadiumPremiumSuite({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${stadiumPremiumSuiteOpen ? 'bg-yellow-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Stadium Premium Suite Monitor"
          >
            <CrownIcon5 className="h-4 w-4" />
            {stadiumPremiumSuiteOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setAquariumCafe({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${aquariumCafeOpen ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Aquarium Cafe Monitor"
          >
            <FishIcon13 className="h-4 w-4" />
            {aquariumCafeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setZooConcession({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${zooConcessionOpen ? 'bg-green-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Zoo Concession Monitor"
          >
            <PawPrintIcon3 className="h-4 w-4" />
            {zooConcessionOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBotanicalGardenCafe({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${botanicalGardenCafeOpen ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Botanical Garden Cafe Monitor"
          >
            <LeafIcon3 className="h-4 w-4" />
            {botanicalGardenCafeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setNationalParkLodge({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${nationalParkLodgeOpen ? 'bg-stone-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="National Park Lodge Monitor"
          >
            <MountainIcon5 className="h-4 w-4" />
            {nationalParkLodgeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-stone-300" />}
          </button>
          {/* Task 168: Travel & Recreation Venue monitors */}
          <button
            onClick={() => useMapStore.getState().setBeachResortRestaurant({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${beachResortRestaurantOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Beach Resort Restaurant Monitor"
          >
            <PalmtreeIcon className="h-4 w-4" />
            {beachResortRestaurantOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setMountainSkiLodgeRestaurant({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${mountainSkiLodgeRestaurantOpen ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Mountain Ski Lodge Restaurant Monitor"
          >
            <SnowflakeIcon6 className="h-4 w-4" />
            {mountainSkiLodgeRestaurantOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setGolfCountryClubRestaurant({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${golfCountryClubRestaurantOpen ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Golf & Country Club Restaurant Monitor"
          >
            <FlagIcon6 className="h-4 w-4" />
            {golfCountryClubRestaurantOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setMarinaYachtClub({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${marinaYachtClubOpen ? 'bg-teal-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Marina & Yacht Club Monitor"
          >
            <SailboatIcon2 className="h-4 w-4" />
            {marinaYachtClubOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-teal-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCasinoHotelBuffet({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${casinoHotelBuffetOpen ? 'bg-red-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Casino Hotel Buffet Monitor"
          >
            <DicesIcon3 className="h-4 w-4" />
            {casinoHotelBuffetOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setHighwayRestArea({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${highwayRestAreaOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Highway Rest Area Monitor"
          >
            <MilestoneIcon className="h-4 w-4" />
            {highwayRestAreaOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setTrainStationDining({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${trainStationDiningOpen ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Train Station Dining Monitor"
          >
            <TrainIcon2 className="h-4 w-4" />
            {trainStationDiningOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setFerryTerminalCafe({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${ferryTerminalCafeOpen ? 'bg-teal-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Ferry Terminal Cafe Monitor"
          >
            <ShipIcon8 className="h-4 w-4" />
            {ferryTerminalCafeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-teal-300" />}
          </button>
          {/* Task 169: Sports & Event Venue monitors */}
          <button
            onClick={() => useMapStore.getState().setAirportLoungeDining({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${airportLoungeDiningOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Airport Lounge Dining Monitor"
          >
            <PlaneIcon6 className="h-4 w-4" />
            {airportLoungeDiningOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBaseballSpringTraining({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${baseballSpringTrainingOpen ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Baseball Spring Training Monitor"
          >
            <TrophyIcon4 className="h-4 w-4" />
            {baseballSpringTrainingOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setAutoRaceTrackConcession({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${autoRaceTrackConcessionOpen ? 'bg-red-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Auto Race Track Concession Monitor"
          >
            <CarIcon6 className="h-4 w-4" />
            {autoRaceTrackConcessionOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setRodeoArenaConcession({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${rodeoArenaConcessionOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Rodeo Arena Concession Monitor"
          >
            <PersonStandingIcon className="h-4 w-4" />
            {rodeoArenaConcessionOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setPoloEquestrianClub({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${poloEquestrianClubOpen ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Polo & Equestrian Club Monitor"
          >
            <GoalIcon2 className="h-4 w-4" />
            {poloEquestrianClubOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setTennisTournamentDining({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${tennisTournamentDiningOpen ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Tennis Tournament Dining Monitor"
          >
            <VolleyballIcon className="h-4 w-4" />
            {tennisTournamentDiningOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setGolfTournamentHospitality({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${golfTournamentHospitalityOpen ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Golf Tournament Hospitality Monitor"
          >
            <FlagIcon7 className="h-4 w-4" />
            {golfTournamentHospitalityOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setMarathonExpoSports({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${marathonExpoSportsOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Marathon Expo Sports Monitor"
          >
            <DumbbellIcon4 className="h-4 w-4" />
            {marathonExpoSportsOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-300" />}
          </button>
          {/* Task 170: Outdoor Recreation & Amusement Venue monitors */}
          <button
            onClick={() => useMapStore.getState().setStadiumBeerGarden({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${stadiumBeerGardenOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Stadium Beer Garden Monitor"
          >
            <BeerIcon4 className="h-4 w-4" />
            {stadiumBeerGardenOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSkiResortApresSkiBar({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${skiResortApresSkiBarOpen ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Ski Resort Apres-Ski Bar Monitor"
          >
            <SnowflakeIcon10 className="h-4 w-4" />
            {skiResortApresSkiBarOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBeachBoardwalkFood({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${beachBoardwalkFoodOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Beach Boardwalk Food Monitor"
          >
            <UmbrellaIcon2 className="h-4 w-4" />
            {beachBoardwalkFoodOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setLakeHouseRestaurant({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${lakeHouseRestaurantOpen ? 'bg-teal-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Lake House Restaurant Monitor"
          >
            <TreePalmIcon className="h-4 w-4" />
            {lakeHouseRestaurantOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-teal-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setRiverboatCruiseDining({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${riverboatCruiseDiningOpen ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Riverboat Cruise Dining Monitor"
          >
            <SailboatIcon3 className="h-4 w-4" />
            {riverboatCruiseDiningOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setDinnerCruise({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${dinnerCruiseOpen ? 'bg-purple-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Dinner Cruise Monitor"
          >
            <WineIcon4 className="h-4 w-4" />
            {dinnerCruiseOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-purple-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setThemeParkFoodCourt({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${themeParkFoodCourtOpen ? 'bg-fuchsia-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Theme Park Food Court Monitor"
          >
            <FerrisWheelIcon2 className="h-4 w-4" />
            {themeParkFoodCourtOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-fuchsia-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setWaterParkSnackBar({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${waterParkSnackBarOpen ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Water Park Snack Bar Monitor"
          >
            <WavesIcon10 className="h-4 w-4" />
            {waterParkSnackBarOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setDriveInTheaterConcession({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${driveInTheaterConcessionOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Drive-In Theater Concession Monitor"
          >
            <FilmIcon4 className="h-4 w-4" />
            {driveInTheaterConcessionOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setMiniGolfSnackBar({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${miniGolfSnackBarOpen ? 'bg-green-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Mini Golf Course Snack Bar Monitor"
          >
            <FlagIcon className="h-4 w-4" />
            {miniGolfSnackBarOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setGoKartTrackConcession({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${goKartTrackConcessionOpen ? 'bg-red-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Go-Kart Track Concession Monitor"
          >
            <CarIcon className="h-4 w-4" />
            {goKartTrackConcessionOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setRollerRinkSnackBar({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${rollerRinkSnackBarOpen ? 'bg-fuchsia-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Roller Rink Snack Bar Monitor"
          >
            <Disc3Icon2 className="h-4 w-4" />
            {rollerRinkSnackBarOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-fuchsia-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setIceRinkCafe({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${iceRinkCafeOpen ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Ice Rink Cafe Monitor"
          >
            <CloudSnowIcon className="h-4 w-4" />
            {iceRinkCafeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setPaintballParkCafe({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${paintballParkCafeOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Paintball Park Cafe Monitor"
          >
            <SprayCanIcon2 className="h-4 w-4" />
            {paintballParkCafeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setZipLineTourCafe({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${zipLineTourCafeOpen ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Zip Line Tour Cafe Monitor"
          >
            <CableIcon className="h-4 w-4" />
            {zipLineTourCafeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBungeeJumpSiteCafe({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${bungeeJumpSiteCafeOpen ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Bungee Jump Site Cafe Monitor"
          >
            <MoveVerticalIcon className="h-4 w-4" />
            {bungeeJumpSiteCafeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setTrampolineParkCafe({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${trampolineParkCafeOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Trampoline Park Cafe Monitor"
          >
            <ZapIcon className="h-4 w-4" />
            {trampolineParkCafeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setLaserTagArenaSnackBar({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${laserTagArenaSnackBarOpen ? 'bg-fuchsia-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Laser Tag Arena Snack Bar Monitor"
          >
            <CrosshairIcon2 className="h-4 w-4" />
            {laserTagArenaSnackBarOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-fuchsia-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setEscapeRoomLounge({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${escapeRoomLoungeOpen ? 'bg-stone-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Escape Room Lounge Monitor"
          >
            <LockIcon className="h-4 w-4" />
            {escapeRoomLoungeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-stone-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setAxeThrowingVenueBar({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${axeThrowingVenueBarOpen ? 'bg-red-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Axe Throwing Venue Bar Monitor"
          >
            <AxeIcon className="h-4 w-4" />
            {axeThrowingVenueBarOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setClimbingGymCafe({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${climbingGymCafeOpen ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Climbing Gym Cafe Monitor"
          >
            <MountainIcon21 className="h-4 w-4" />
            {climbingGymCafeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSkateParkSnackBar({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${skateParkSnackBarOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Skate Park Snack Bar Monitor"
          >
            <RadicalIcon className="h-4 w-4" />
            {skateParkSnackBarOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setDiscGolfCourseConcession({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${discGolfCourseConcessionOpen ? 'bg-green-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Disc Golf Course Concession Monitor"
          >
            <DiscIcon className="h-4 w-4" />
            {discGolfCourseConcessionOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBMXTrackConcession({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${bmxTrackConcessionOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="BMX Track Concession Monitor"
          >
            <BikeIcon className="h-4 w-4" />
            {bmxTrackConcessionOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setRollerDerbyVenueBar({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${rollerDerbyVenueBarOpen ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Roller Derby Venue Bar Monitor"
          >
            <CircleDotIcon1 className="h-4 w-4" />
            {rollerDerbyVenueBarOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setIndoorSkydivingLounge({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${indoorSkydivingLoungeOpen ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Indoor Skydiving Lounge Monitor"
          >
            <WindIcon1 className="h-4 w-4" />
            {indoorSkydivingLoungeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSurfSchoolCafe({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${surfSchoolCafeOpen ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Surf School Cafe Monitor"
          >
            <WavesIcon1 className="h-4 w-4" />
            {surfSchoolCafeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setKiteboardingBeachBar({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${kiteboardingBeachBarOpen ? 'bg-teal-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Kiteboarding Beach Bar Monitor"
          >
            <BirdIcon1 className="h-4 w-4" />
            {kiteboardingBeachBarOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-teal-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setWindsurfingShoreCafe({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${windsurfingShoreCafeOpen ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Windsurfing Shore Cafe Monitor"
          >
            <SailboatIcon1 className="h-4 w-4" />
            {windsurfingShoreCafeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setKayakTourSnackBar({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${kayakTourSnackBarOpen ? 'bg-teal-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Kayak Tour Snack Bar Monitor"
          >
            <DropletsIcon1 className="h-4 w-4" />
            {kayakTourSnackBarOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-teal-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCanoeRentalCafe({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${canoeRentalCafeOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Canoe Rental Cafe Monitor"
          >
            <AnchorIcon className="h-4 w-4" />
            {canoeRentalCafeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setPaddleboardRentalCafe({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${paddleboardRentalCafeOpen ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Paddleboard Rental Cafe Monitor"
          >
            <ShellIcon className="h-4 w-4" />
            {paddleboardRentalCafeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setWhitewaterRaftingConcession({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${whitewaterRaftingConcessionOpen ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Whitewater Rafting Concession Monitor"
          >
            <WavesIcon30 className="h-4 w-4" />
            {whitewaterRaftingConcessionOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setJetSkiRentalSnackBar({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${jetSkiRentalSnackBarOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Jet Ski Rental Snack Bar Monitor"
          >
            <WindIcon5 className="h-4 w-4" />
            {jetSkiRentalSnackBarOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSailingClubBar({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${sailingClubBarOpen ? 'bg-teal-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Sailing Club Bar Monitor"
          >
            <ShipIcon1 className="h-4 w-4" />
            {sailingClubBarOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-teal-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setMarinaRestaurant({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${marinaRestaurantOpen ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Marina Restaurant Monitor"
          >
            <AnchorIcon1 className="h-4 w-4" />
            {marinaRestaurantOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setHouseboatRentalCafe({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${houseboatRentalCafeOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Houseboat Rental Cafe Monitor"
          >
            <PalmtreeIcon1 className="h-4 w-4" />
            {houseboatRentalCafeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setFloatSpaLounge({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${floatSpaLoungeOpen ? 'bg-violet-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Float Spa Lounge Monitor"
          >
            <SparklesIcon1 className="h-4 w-4" />
            {floatSpaLoungeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-violet-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSaltCaveRelaxationCafe({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${saltCaveRelaxationCafeOpen ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Salt Cave Relaxation Cafe Monitor"
          >
            <GemIcon className="h-4 w-4" />
            {saltCaveRelaxationCafeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setDaySpaCafe({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${daySpaCafeOpen ? 'bg-pink-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Day Spa Cafe Monitor"
          >
            <FlowerIcon1 className="h-4 w-4" />
            {daySpaCafeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-pink-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setHotSpringResortCafe({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${hotSpringResortCafeOpen ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Hot Spring Resort Cafe Monitor"
          >
            <FlameIcon1 className="h-4 w-4" />
            {hotSpringResortCafeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setThermalBathLounge({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${thermalBathLoungeOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Thermal Bath Lounge Monitor"
          >
            <CloudIcon1 className="h-4 w-4" />
            {thermalBathLoungeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCryotherapyClinicCafe({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${cryotherapyClinicCafeOpen ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Cryotherapy Clinic Cafe Monitor"
          >
            <SnowflakeIcon1 className="h-4 w-4" />
            {cryotherapyClinicCafeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setInfraredSaunaLounge({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${infraredSaunaLoungeOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Infrared Sauna Lounge Monitor"
          >
            <DropletIcon1 className="h-4 w-4" />
            {infraredSaunaLoungeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setMeditationStudioCafe({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${meditationStudioCafeOpen ? 'bg-violet-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Meditation Studio Cafe Monitor"
          >
            <MoonIcon1 className="h-4 w-4" />
            {meditationStudioCafeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-violet-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setYogaRetreatCafe({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${yogaRetreatCafeOpen ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Yoga Retreat Cafe Monitor"
          >
            <LeafIcon1 className="h-4 w-4" />
            {yogaRetreatCafeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setPilatesStudioBarre({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${pilatesStudioBarreOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Pilates Studio Barre Monitor"
          >
            <StarIcon1 className="h-4 w-4" />
            {pilatesStudioBarreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBarreFitnessStudioCafe({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${barreFitnessStudioCafeOpen ? 'bg-pink-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Barre Fitness Studio Cafe Monitor"
          >
            <HeartIcon1 className="h-4 w-4" />
            {barreFitnessStudioCafeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-pink-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setHotYogaStudioCafe({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${hotYogaStudioCafeOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Hot Yoga Studio Cafe Monitor"
          >
            <FlameIcon18 className="h-4 w-4" />
            {hotYogaStudioCafeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSoundBathMeditationLounge({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${soundBathMeditationLoungeOpen ? 'bg-violet-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Sound Bath Meditation Lounge Monitor"
          >
            <ConciergeBellIcon1 className="h-4 w-4" />
            {soundBathMeditationLoungeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-violet-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setAromatherapySpaCafe({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${aromatherapySpaCafeOpen ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Aromatherapy Spa Cafe Monitor"
          >
            <FlowerIcon5 className="h-4 w-4" />
            {aromatherapySpaCafeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setReflexologyLoungeCafe({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${reflexologyLoungeCafeOpen ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Reflexology Lounge Cafe Monitor"
          >
            <HandHeartIcon1 className="h-4 w-4" />
            {reflexologyLoungeCafeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setReikiHealingCenterCafe({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${reikiHealingCenterCafeOpen ? 'bg-fuchsia-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Reiki Healing Center Cafe Monitor"
          >
            <SparkleIcon1 className="h-4 w-4" />
            {reikiHealingCenterCafeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-fuchsia-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setAcupunctureClinicCafe({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${acupunctureClinicCafeOpen ? 'bg-teal-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Acupuncture Clinic Cafe Monitor"
          >
            <ActivityIcon1 className="h-4 w-4" />
            {acupunctureClinicCafeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-teal-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setChiropracticWellnessCafe({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${chiropracticWellnessCafeOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Chiropractic Wellness Cafe Monitor"
          >
            <StethoscopeIcon1 className="h-4 w-4" />
            {chiropracticWellnessCafeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setNaturopathicClinicCafe({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${naturopathicClinicCafeOpen ? 'bg-green-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Naturopathic Clinic Cafe Monitor"
          >
            <LeafIcon13 className="h-4 w-4" />
            {naturopathicClinicCafeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setHairSalonStudio({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${hairSalonStudioOpen ? 'bg-pink-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Hair Salon Studio Monitor"
          >
            <ScissorsIcon5 className="h-4 w-4" />
            {hairSalonStudioOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-pink-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBarberShopLounge({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${barberShopLoungeOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Barber Shop Lounge Monitor"
          >
            <BrushIcon1 className="h-4 w-4" />
            {barberShopLoungeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setManicurePedicureSpa({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${manicurePedicureSpaOpen ? 'bg-fuchsia-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Manicure Pedicure Spa Monitor"
          >
            <HandIcon1 className="h-4 w-4" />
            {manicurePedicureSpaOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-fuchsia-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSkinCareClinic({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${skinCareClinicOpen ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Skin Care Clinic Monitor"
          >
            <SparklesIcon13 className="h-4 w-4" />
            {skinCareClinicOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setLashBrowBar({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${lashBrowBarOpen ? 'bg-violet-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Lash Brow Bar Monitor"
          >
            <EyeIcon3 className="h-4 w-4" />
            {lashBrowBarOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-violet-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setWaxingHairRemoval({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${waxingHairRemovalOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Waxing Hair Removal Monitor"
          >
            <FlameIcon26 className="h-4 w-4" />
            {waxingHairRemovalOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setMakeupCosmeticsStudio({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${makeupCosmeticsStudioOpen ? 'bg-purple-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Makeup Cosmetics Studio Monitor"
          >
            <PaletteIcon5 className="h-4 w-4" />
            {makeupCosmeticsStudioOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-purple-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setSprayTanStudio({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${sprayTanStudioOpen ? 'bg-yellow-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Spray Tan Studio Monitor"
          >
            <SunIcon15 className="h-4 w-4" />
            {sprayTanStudioOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setAutoMechanicShop({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${autoMechanicShopOpen ? 'bg-red-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Auto Mechanic Shop Monitor"
          >
            <WrenchIcon1 className="h-4 w-4" />
            {autoMechanicShopOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setTireRotationShop({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${tireRotationShopOpen ? 'bg-stone-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Tire Rotation Shop Monitor"
          >
            <DiscIcon1 className="h-4 w-4" />
            {tireRotationShopOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-stone-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setOilChangeExpress({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${oilChangeExpressOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Oil Change Express Monitor"
          >
            <DropletIcon21 className="h-4 w-4" />
            {oilChangeExpressOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCarWashDetailing({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${carWashDetailingOpen ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Car Wash Detailing Monitor"
          >
            <CarIcon7 className="h-4 w-4" />
            {carWashDetailingOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setAftermarketPartsStore({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${aftermarketPartsStoreOpen ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Aftermarket Parts Store Monitor"
          >
            <PackageIcon3 className="h-4 w-4" />
            {aftermarketPartsStoreOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBodyCollisionShop({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${bodyCollisionShopOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Body Collision Shop Monitor"
          >
            <HammerIcon3 className="h-4 w-4" />
            {bodyCollisionShopOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setMufflerExhaustShop({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${mufflerExhaustShopOpen ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Muffler Exhaust Shop Monitor"
          >
            <WindIcon21 className="h-4 w-4" />
            {mufflerExhaustShopOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-slate-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setTransmissionRepairShop({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${transmissionRepairShopOpen ? 'bg-violet-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Transmission Repair Shop Monitor"
          >
            <CogIcon6 className="h-4 w-4" />
            {transmissionRepairShopOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-violet-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setBankBranchOffice({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${bankBranchOfficeOpen ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Bank Branch Office Monitor"
          >
            <LandmarkIcon7 className="h-4 w-4" />
            {bankBranchOfficeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setCreditUnionBranch({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${creditUnionBranchOpen ? 'bg-green-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Credit Union Branch Monitor"
          >
            <Building2Icon8 className="h-4 w-4" />
            {creditUnionBranchOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setAccountingFirmOffice({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${accountingFirmOfficeOpen ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Accounting Firm Office Monitor"
          >
            <CalculatorIcon className="h-4 w-4" />
            {accountingFirmOfficeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setTaxPrepService({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${taxPrepServiceOpen ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Tax Prep Service Monitor"
          >
            <ReceiptIcon className="h-4 w-4" />
            {taxPrepServiceOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setInsuranceAgencyOffice({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${insuranceAgencyOfficeOpen ? 'bg-teal-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Insurance Agency Office Monitor"
          >
            <ShieldIcon9 className="h-4 w-4" />
            {insuranceAgencyOfficeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-teal-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setLawFirmPractice({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${lawFirmPracticeOpen ? 'bg-stone-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Law Firm Practice Monitor"
          >
            <ScaleIcon4 className="h-4 w-4" />
            {lawFirmPracticeOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-stone-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setNotarySigningService({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${notarySigningServiceOpen ? 'bg-purple-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Notary Signing Service Monitor"
          >
            <StampIcon className="h-4 w-4" />
            {notarySigningServiceOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-purple-300" />}
          </button>
          <button
            onClick={() => useMapStore.getState().setRealEstateAgency({ open: true })}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-all ${realEstateAgencyOpen ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Real Estate Agency Monitor"
          >
            <BriefcaseIcon2 className="h-4 w-4" />
            {realEstateAgencyOpen && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-300" />}
          </button>
        </div>
      </div>
    </>
  )
}
