# 🗺️ MotoTrack — MapLibre Explorer

A feature-rich, interactive mapping application built with **Next.js 16**, **MapLibre GL JS**, **MapTiler**, and **MapTiler Geocoding**. Explore maps, search locations, plan routes, measure distances, analyze terrain, track weather, monitor environmental hazards, and visualize business operations across **851 specialized monitor panels** — all in one beautiful interface.

[![CI](https://github.com/markec12345678/mototracklatest/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/markec12345678/mototracklatest/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![MapLibre GL](https://img.shields.io/badge/MapLibre_GL-5-blueviolet?logo=maplibre)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![Monitors](https://img.shields.io/badge/Monitor_Panels-851-brightgreen)
![License](https://img.shields.io/badge/License-MIT-green)

> **Scale**: 851 monitor components · 92 dependencies · 7 languages · 25+ API endpoints · 35+ map tools

---

## ✨ Features

### 🗺️ Map Core
- **Interactive Map** powered by MapLibre GL JS with smooth zoom, pan, and rotation
- **Multiple Map Styles** — Streets, Satellite, Topo, Dark, Basic, and custom styles via MapTiler
- **3D Terrain** with elevation exaggeration control
- **Mini Map** for overview navigation
- **Compass Indicator** with north reset
- **Map Comparison** — Split-screen side-by-side style comparison with swipe divider
- **Layer Visibility Control** — Toggle water, roads, buildings, parks, and labels
- **Map Legend** with interactive layer descriptions

### 📍 Location & Search
- **Geocoding Search** with autocomplete via MapTiler Geocoding API
- **Reverse Geocoding** — Click any point to get its address
- **Quick Jump Panel** — Instantly fly to popular world cities
- **Go to Coordinates** — Navigate by decimal degrees or DMS format with history
- **Coordinates Display** — Real-time cursor position in multiple formats
- **Bookmark Manager** — Organize saved locations into folders with colors and emojis

### 🚗 Routing & Navigation
- **Route Planning** with multiple waypoints (drag to reorder)
- **3 Route Profiles** — Driving, Cycling, and Walking via OSRM
- **Turn-by-Turn Directions** with step navigation and maneuver icons
- **Route Distance & Duration** calculation
- **Route Optimizer** — Nearest-neighbor TSP heuristic with before/after comparison
- **Isochrone Visualization** — See reachable areas from a point
- **Multi-route Comparison** — Compare multiple routes side by side

### 📏 Measurement & Drawing
- **Distance Measurement** — Click points to measure with haversine formula
- **Area Measurement** — Calculate enclosed area with shoelace formula
- **Marker Placement** — Click to add draggable markers with categories
- **Map Annotations** — Add text labels anywhere on the map
- **Right-Click Context Menu** — Add markers, measure, copy coordinates, and more
- **Distance Matrix** — Calculate distances between multiple points

### 🏔️ Terrain & Elevation
- **Elevation Profile** — Visualize terrain along routes with Recharts area chart
- **3D Terrain Rendering** with adjustable exaggeration
- **Elevation at Cursor** — Real-time altitude display
- **Route Elevation** — See elevation gain/loss for planned routes
- **3D Building Explorer** — Click buildings to inspect height, levels, and type

### 🌤️ Weather & Sun
- **Weather Panel** — Current conditions with temperature, wind, humidity, UV, and AQI
- **7-Day Forecast** — Daily forecast with max/min temps, precipitation, and wind
- **Weather Alerts** — Severity-based alerts (yellow/orange/red) for extreme conditions
- **Mobile Weather Bar** — Compact weather strip for mobile
- **Sun Position Overlay** — Day/night terminator line and subsolar point
- **Golden & Blue Hour** indicators for photography planning
- **Sun Info Panel** — Sunrise, sunset, solar noon, and day length

### 🌬️ Air Quality
- **Air Quality Index** — Real-time US AQI from Open-Meteo Air Quality API
- **Pollutant Levels** — PM2.5, PM10, CO, NO₂, SO₂, O₃ with progress bars
- **Color-Coded AQI Badge** — Good/Moderate/Unhealthy/Hazardous levels
- **24-Hour AQI Forecast** — Hourly bar chart showing predicted air quality
- **Health Recommendations** — Context-aware advice based on current AQI
- **AQI Scale Reference** — Visual scale with current position indicator

### 📊 Monitor Panel System (851 Panels)

The flagship feature of MotoTrack is a **massive library of 851 specialized monitor panels**, each providing real-time status, location lists, metrics, and detail cards for a specific domain. Every monitor follows a consistent pattern based on `OfficeSupplyChainMonitor.tsx`:

- **4 real US locations** per monitor with coordinates, status, and business data
- **4-cell metrics grid** — Daily Customers, Revenue ($M/mo), SKUs, Stores
- **5-option status filter** — All / Critical / Warning / Moderate / Stable
- **Color-coded status badges** — Red (critical), Amber (warning), Blue (moderate), Emerald (stable)
- **Trend indicators** — Up / Down / Stable with directional icons
- **Scrollable location list** with active-item detail card
- **Gradient header** with domain-specific emoji and close button
- **Lazy-loaded** via `LazyPanel` registry for optimal performance

#### Monitor Categories (selected examples)

| Category | Example Monitors | Count |
|----------|-----------------|-------|
| **Environmental & Climate** | AirQuality, AcidRainTracker, AtmosphericRiverFlow, ArcticSeaIce, AlpineGlacier, AeolianDustDeposition, AquiferDepletion | ~120 |
| **Geological & Tectonic** | EarthquakeForecast, VolcanoEruptionAlert, TsunamiWarning, LandslideHazard, AbyssalSedimentFlux | ~40 |
| **Oceanic & Marine** | AquacultureFishery, OceanCurrentTracker, CoralReefBleach, SeaLevelRise, ThermohalineCirculation | ~50 |
| **Atmospheric & Weather** | AtmosphericPressureCell, AuroraOvalPosition, OzoneLayerTrack, MethaneEmissionSource, AerosolOpticalDepth | ~60 |
| **Supply Chain & Logistics** | OfficeSupplyChain, AutomobileAssemblyPlant, AluminumSmelter, AviationFuelDepot | ~80 |
| **Retail & Commerce** | ApparelRetailChain, ApplianceRetailStore, AudioEquipmentStore, AutoPartsStore, BakeryPastryShop | ~90 |
| **Sports & Recreation Venues** | DriveInTheaterConcession, GoKartTrackConcession, TrampolineParkCafe, AxeThrowingVenueBar | ~70 |
| **Water Sports Concessions** | WhitewaterRaftingConcession, JetSkiRentalSnackBar, SailingClubBar, MarinaRestaurant | ~24 |
| **Wellness & Spa Retreats** | FloatSpaLounge, SaltCaveRelaxationCafe, HotSpringResortCafe, ThermalBathLounge, DaySpaCafe | ~24 |
| **Thermal & Mind-Body** | CryotherapyClinicCafe, InfraredSaunaLounge, MeditationStudioCafe, YogaRetreatCafe, PilatesStudioBarre | ~16 |
| **Military & Infrastructure** | AirForceBase, ArmyBaseReadiness, AirTrafficControl, AircraftHangarFacility | ~30 |
| **Education & Community** | AfterSchoolProgram, AcademicCitation, AnimalShelterRescue | ~25 |
| **Food & Beverage** | AirportFoodCourt, AirportLoungeDining, BarPubTavern, BagelDeliShop | ~60 |
| **Beauty & Personal Care** | HairSalonStudio, BarberShopLounge, ManicurePedicureSpa, SkinCareClinic, LashBrowBar, WaxingHairRemoval, MakeupCosmeticsStudio, SprayTanStudio | 8 |
| **Automotive Services** | AutoMechanicShop, TireRotationShop, OilChangeExpress, CarWashDetailing, AftermarketPartsStore, BodyCollisionShop, MufflerExhaustShop, TransmissionRepairShop | 8 |
| **Financial & Professional Services** | BankBranchNetwork, InsuranceAgencyOffice, AccountingTaxFirm, LawOfficePractice, RealEstateAgency, InvestmentAdvisoryFirm, MortgageBrokerOffice, NotaryPublicService | 8 |
| **Other Domains** | ArenaEvent, AtmNetworkStatus, AntiquesCollectiblesStore, AquariumMarineExhibit | ~120 |

> Each monitor is a standalone `*Monitor.tsx` component (~213 lines) following the exact same template, ensuring visual and behavioral consistency across all 851 panels.

### 📦 Import & Export
- **GPX Import** — Load GPX 1.1 tracks and waypoints onto the map
- **GPX Export** — Save routes and tracks as GPX files
- **Map Export** — Screenshot the map as PNG, JPEG, or WebP at custom resolutions
- **Share Dialog** — Generate shareable link, embed code, or QR code
- **Social Sharing** — Share to Twitter/X, Facebook, WhatsApp, Telegram

### 🏪 Points of Interest
- **POI Search** via Overpass API with 10+ categories:
  - 🍽️ Restaurants & Dining
  - ⛽ Fuel Stations
  - 🅿️ Parking
  - 🏥 Healthcare
  - 🏦 Banking & ATMs
  - 🎓 Education
  - 🎭 Entertainment
  - 🚌 Transport
  - ⚽ Sports
  - 💧 Water & Drinking Fountains
  - 🚻 Toilets
- **Category-Specific Markers** with distinct colors and icons
- **Nearby POI Panel** sorted by distance

### 🔧 Tools & Utilities
- **Undo/Redo System** — Ctrl+Z / Ctrl+Y with visual toolbar
- **Keyboard Shortcuts** — Full list of hotkeys for power users
- **Context Menu** — Right-click for quick actions (add marker, measure, geofence)
- **Map Stats Panel** — Zoom level, center coordinates, bearing, pitch
- **Notifications** — Real-time feedback for all actions
- **Notification Center** — Bell icon with history, mark-as-read, and clear
- **Location Detail Drawer** — Expandable info panel for markers and POIs
- **Heatmap Layer** — Visualize density of markers/POIs with adjustable intensity and radius
- **Custom Tile Sources** — Add your own tile server URLs with presets (OSM, Stamen, CartoDB)
- **Map Snapshots** — Save and restore map views with markers
- **Style Gallery** — Visual style browser with categories and search
- **Analytics Dashboard** — Session stats, tool usage charts, activity heatmap, and key metrics
- **Tool Usage Tracking** — Frequency of tool mode switches and action counts
- **Location History Timeline** — Browse saved locations by date with category filtering and search

### 🏃 GPS & Tracking
- **Track Recording** — Record GPS tracks in real-time with speed, distance, elevation
- **Track Playback** — Animate marker along saved tracks
- **Track Export** — Export recorded tracks as GPX
- **Saved Tracks** — Browse and manage all recorded tracks

### 🛡️ Geofencing
- **Create Geofences** — Define circular areas with custom radius (100m-10km)
- **Enter/Exit Alerts** — Toast notifications when crossing geofence boundaries
- **Geofence Management** — Toggle, edit, and delete geofences
- **Right-Click to Create** — Create geofence from context menu

### 🤖 AI & Intelligence
- **AI-Powered Suggestions** — Smart location recommendations based on your position
- **Personalized Preferences** — Tell the AI what you like (hiking, food, history, etc.)
- **One-Click Fly-to** — Jump to suggested places on the map

### 🌍 Internationalization
- **7 Languages Supported** — English, Slovenian, German, Croatian, Italian, French, Spanish
- **Language Selector** — Quick switch with flag emojis
- **Translated UI** — Sidebar, search, tools, and categories all translated

### 🎨 Design & UX
- **Dark/Light Mode** with next-themes
- **PWA Installable** — Install as native app on supported browsers
- **Fully Responsive** — Optimized for desktop, tablet, and mobile
- **Glassmorphism UI** — Frosted glass panels with blur effects
- **Smooth Animations** — Framer Motion transitions throughout
- **Custom Scrollbars** — Styled for both light and dark themes
- **Mobile Safe Areas** — Respects iOS notch and home indicator
- **Accessible** — Semantic HTML, ARIA labels, keyboard navigation
- **Custom Marker Icons** — 8 icon presets with color picker
- **Category-Specific POI Icons** — Each POI type has its own icon and color

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 (App Router, webpack mode) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 + shadcn/ui (New York style) |
| **Map Engine** | MapLibre GL JS 5 |
| **Tiles & Geocoding** | MapTiler API |
| **Routing** | OSRM (Open Source Routing Machine) |
| **POI Data** | Overpass API (OpenStreetMap) |
| **State Management** | Zustand (persisted) |
| **Server State** | TanStack Query |
| **Database** | Prisma ORM + SQLite |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Notifications** | Sonner |
| **Forms** | React Hook Form + Zod |
| **Charts** | Recharts |
| **Rich Text** | MDX Editor |

---

## 📋 Prerequisites

- **Node.js** 18+ or **Bun** runtime
- **MapTiler API Key** — [Get one free](https://cloud.maptiler.com/)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/markec12345678/mototracklatest.git
cd mototracklatest
```

### 2. Install Dependencies

```bash
bun install
# or
npm install
```

### 3. Configure Environment

Copy the example environment file and add your MapTiler API key:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=file:./db/custom.db
NEXT_PUBLIC_MAPTILER_KEY=your_maptiler_api_key_here
```

### 4. Initialize Database

```bash
bun run db:push
# or
npx prisma db push
```

### 5. Start Development Server

```bash
bun run dev
# or
npm run dev
```

The app runs on `http://localhost:3000`.

> **Note**: The dev server uses webpack mode (not turbopack) with `--max-old-space-size=7168` to handle the large codebase (851 monitor components). The server writes logs to `dev.log`.

---

## 📁 Project Structure

```
├── prisma/
│   └── schema.prisma              # Database schema (Location, MapStyle, Route)
├── public/
│   ├── logo.svg                   # App logo
│   └── robots.txt                 # SEO robots
├── src/
│   ├── app/
│   │   ├── api/                   # API routes (25+ endpoints)
│   │   │   ├── directions/        # OSRM routing proxy
│   │   │   ├── elevation/         # Elevation data proxy
│   │   │   ├── export/gpx/        # GPX file export
│   │   │   ├── import/gpx/        # GPX file import
│   │   │   ├── isochrone/         # Isochrone calculation
│   │   │   ├── locations/         # CRUD for saved locations
│   │   │   ├── poi/               # Overpass POI search
│   │   │   ├── reverse-geocode/   # Reverse geocoding
│   │   │   ├── routes/            # CRUD for saved routes
│   │   │   ├── search/            # MapTiler geocoding search
│   │   │   ├── styles/            # Map style management
│   │   │   ├── sun-position/      # Solar position calculations
│   │   │   ├── weather/           # Weather data proxy
│   │   │   ├── weather-forecast/  # 7-day forecast
│   │   │   ├── air-quality/       # AQI data
│   │   │   ├── chat/              # AI chat endpoint
│   │   │   ├── export/            # Map export
│   │   │   └── terrain-analysis/  # Terrain analysis
│   │   ├── globals.css            # Global styles, animations, custom scrollbars
│   │   ├── layout.tsx             # Root layout with providers
│   │   └── page.tsx               # Main application page (sole user route)
│   ├── components/
│   │   ├── map/                   # Map-specific components (1136+ files)
│   │   │   ├── MapView.tsx            # Core map renderer
│   │   │   ├── MapSidebar.tsx         # Sidebar with tabs
│   │   │   ├── SearchBar.tsx          # Geocoding search
│   │   │   ├── MapToolbar.tsx         # Floating tool palette
│   │   │   ├── MapToolbarButtons.tsx  # 851 monitor toolbar buttons (~620KB)
│   │   │   ├── StyleSwitcher.tsx      # Map style selector
│   │   │   ├── WeatherPanel.tsx       # Weather information
│   │   │   ├── ElevationProfile.tsx   # Terrain profile chart
│   │   │   ├── MiniMap.tsx            # Overview minimap
│   │   │   ├── MapComparison.tsx      # Split-screen comparison
│   │   │   ├── BookmarkManager.tsx    # Location bookmarks
│   │   │   ├── OfficeSupplyChainMonitor.tsx  # Monitor pattern template
│   │   │   ├── *Monitor.tsx           # 851 monitor components
│   │   │   ├── panel-groups/
│   │   │   │   └── MonitorPanelRegistry.tsx  # Lazy-load registry (~232KB)
│   │   │   └── ...                    # 35+ map tool components
│   │   └── ui/                    # shadcn/ui components (40+)
│   ├── hooks/
│   │   ├── use-mobile.ts          # Mobile detection hook
│   │   ├── use-toast.ts           # Toast notification hook
│   │   └── use-pwa-install.ts     # PWA install detection hook
│   └── lib/
│       ├── map-store.ts           # Zustand map state (persisted, ~520KB)
│       ├── undo-manager.ts        # Generic undo/redo engine
│       ├── use-undo-store.ts      # Undo/redo Zustand store
│       ├── weather-utils.ts       # Weather data utilities
│       ├── db.ts                  # Prisma client instance
│       └── utils.ts               # General utilities (cn, etc.)
├── .env.example                   # Environment variable template
├── .gitignore                     # Git ignore rules
├── components.json                # shadcn/ui configuration
├── next.config.ts                 # Next.js configuration
├── package.json                   # Dependencies and scripts (92 deps)
├── tailwind.config.ts             # Tailwind CSS configuration
└── tsconfig.json                  # TypeScript configuration
```

---

## 📊 Monitor Panel Architecture

The 851 monitor panels are the largest subsystem in MotoTrack. Here is how they are architected:

### Pattern Template
Every monitor follows `OfficeSupplyChainMonitor.tsx` exactly (~213 lines):
1. `'use client'` directive
2. Imports: `useEffect`, `useMemo`, `Card`, `Select` components, `X` icon, `useMapStore`
3. `SAMPLE_LOCATIONS` array with 4 entries, each containing: `id`, `name`, `lat`, `lng`, `status`, `value`, `dailyCustomers`, `monthlyRevenue` (number in $M), `skusInStock`, `flagshipLines` (comma-separated string), `trend` (`'up'|'down'|'stable'` with `as const`), `description`
4. `STATUS_COLORS` record — critical (red), warning (amber), moderate (blue), stable (emerald)
5. `TrendIcon` helper component
6. `useEffect` seeding into Zustand store on first open
7. `useMemo` triplet with `void geojson` (to satisfy bundler)
8. SSR guard and open guard
9. Fixed-position Card: `fixed right-4 top-16 z-[60] w-[340px] max-h-[80vh]`
10. Gradient header with emoji HTML entity + close button
11. 5-option `Select` filter (all/critical/warning/moderate/stable)
12. 4-cell metrics grid
13. Scrollable location list (`max-h-[260px] overflow-y-auto`)
14. Active-item detail card with status badge + description + footer metrics

### State Management
Each monitor has 3 references in `src/lib/map-store.ts`:
- Interface field: `monitorKey: MonitorState`
- Default state: `monitorKey: { open: false, data: [], statusFilter: 'all', activeItemId: null }`
- Setter: `setMonitorKey: (updates) => set((state) => ({ monitorKey: { ...state.monitorKey, ...updates } }))`

### Lazy Loading
Monitors are lazy-loaded via `LazyPanel` in `MonitorPanelRegistry.tsx`:
```tsx
{monitorKey.open && (
  <LazyPanel
    importFn={() => import('@/components/map/MonitorName')}
    exportName="MonitorName"
    shouldLoad={monitorKey.open}
  />
)}
```

### Toolbar Integration
Each monitor has a button in `MapToolbarButtons.tsx`:
- Icon import with unique alias (e.g., `Waves as WavesIcon30`)
- Store read: `const monitorOpen = useMapStore((s) => s.monitorKey.open)`
- Button block with `onClick`, `className` (color-coded), `title`, icon, and active indicator dot

### Color Rules
- **NO indigo/blue** primary gradient colors (allowed: emerald, pink, amber, fuchsia, teal, orange, green, cyan, rose, red, violet, stone, purple, sky, yellow)
- The only blue allowed is the canonical `bg-blue-500` STATUS_COLORS entry for `moderate` status

### Icon Alias System
With 851 monitors, icon aliases are heavily reused. Lucide icons like `Waves`, `Sparkles`, `Mountain` have 20+ aliases (e.g., `WavesIcon1` through `WavesIcon30`). New monitors must grep for the first free alias suffix before assignment.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo last action |
| `Ctrl+Y` | Redo last action |
| `Ctrl+K` | Open search |
| `Escape` | Cancel current tool / Close dialogs |
| `+` / `-` | Zoom in / out |
| `M` | Cycle map styles |
| `F` | Toggle fullscreen |
| `L` | Toggle layer visibility |
| `G` | Toggle geolocation |
| `?` | Show keyboard shortcuts |

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/search` | GET | Geocoding search (MapTiler) |
| `/api/reverse-geocode` | GET | Reverse geocode coordinates |
| `/api/directions` | GET | Route directions (OSRM) |
| `/api/elevation` | GET/POST | Elevation data lookup or batch query |
| `/api/weather` | GET | Current weather data |
| `/api/weather-forecast` | GET | 7-day weather forecast |
| `/api/air-quality` | GET | Air quality index data |
| `/api/sun-position` | GET | Solar position calculations |
| `/api/poi` | GET | POI search (Overpass) |
| `/api/isochrone` | GET | Isochrone reachability |
| `/api/styles` | GET | Available map styles |
| `/api/locations` | GET/POST | Saved locations CRUD |
| `/api/locations/[id]` | PUT/DELETE | Update/delete location |
| `/api/routes` | GET/POST | Saved routes CRUD |
| `/api/routes/[id]` | PUT/DELETE | Update/delete route |
| `/api/import/gpx` | POST | Import GPX file |
| `/api/export/gpx` | POST | Export route as GPX |
| `/api/export` | POST | Export map as image |
| `/api/chat` | POST | AI chat endpoint |
| `/api/terrain-analysis` | GET | Terrain analysis |
| `/api/suggestions` | GET | AI location suggestions |

---

## 🌐 External APIs

| Service | Purpose | Docs |
|---------|---------|------|
| **MapTiler** | Map tiles, geocoding, styles | [docs.maptiler.com](https://docs.maptiler.com/) |
| **OSRM** | Routing (driving, cycling, walking) | [project-osrm.org](https://project-osrm.org/) |
| **Overpass** | OpenStreetMap POI queries | [overpass-api.de](https://overpass-api.de/) |
| **Open-Meteo** | Weather & air quality data | [open-meteo.com](https://open-meteo.com/) |

---

## 📱 Responsive Design

The app is fully responsive with three breakpoints:

- **Mobile** (<640px) — Compact UI, bottom sheets, swipe gestures, safe-area padding
- **Tablet** (640-1024px) — Side panel collapsible, floating controls
- **Desktop** (>1024px) — Full sidebar, multi-panel layout, keyboard shortcuts

---

## 🎯 Roadmap

### Completed ✅
- [x] PWA Support — Installable as native app
- [x] Route Elevation Profile — Recharts area chart
- [x] Custom Tile Sources — Add any tile URL with presets
- [x] 3D Building Explorer — Click to inspect buildings
- [x] Heatmap Layer — Density visualization with controls
- [x] Geofencing Alerts — Enter/exit notifications
- [x] Track Recording — Real-time GPS tracking
- [x] Multi-language Support — 7 languages with i18n foundation
- [x] AI-Powered Suggestions — LLM-based location recommendations
- [x] Weather Alerts & Forecast — 7-day forecast with severity alerts
- [x] Distance Matrix — Multi-point distance calculator
- [x] Style Gallery — Visual style browser
- [x] Map Snapshots — Save/restore map views
- [x] Notification Center — Centralized notification history
- [x] Route Optimizer — Nearest-neighbor TSP heuristic
- [x] Location History Timeline — Browse by date with filtering
- [x] Multi-route Comparison — Compare routes side by side
- [x] Map Analytics Dashboard — Session stats, activity charts, tool usage
- [x] Air Quality Index — Real-time AQI with pollutant levels and forecast
- [x] **Monitor Panel System — 851 specialized monitor panels** spanning environmental, geological, oceanic, atmospheric, supply chain, retail, sports venue, wellness retreat, beauty/personal care, automotive, and financial/professional services domains
- [x] **Repository hardening** — Comprehensive README, CONTRIBUTING.md, SECURITY.md, MIT LICENSE, and GitHub Actions CI pipeline (lint + typecheck + build)

### Planned 🚧
- [ ] Collaborative Maps — Share and edit maps with others in real-time
- [ ] Offline Map Caching — Service worker for tile caching
- [ ] Real-time Chat — Discuss locations with other users
- [ ] Voice Navigation — Turn-by-turn voice instructions
- [ ] Monitor panel code-splitting — Split `MapToolbarButtons.tsx` (~620KB) into batched files to reduce compilation memory pressure
- [ ] Store slicing — Split `map-store.ts` (~520KB) into domain-specific slices
- [ ] Dependabot config — Automated dependency updates
- [ ] Code coverage reporting — Istanbul/c8 in CI

---

## 🤝 Contributing

Contributions are welcome! Please read the full **[CONTRIBUTING.md](CONTRIBUTING.md)** for detailed setup, conventions, monitor-adding guide, and the PR checklist.

### Quick Start

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes following [Conventional Commits](https://www.conventionalcommits.org/)
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request against `main`

### Adding a New Monitor Panel

To add a new monitor following the established pattern, see the **[Adding a Monitor Panel](CONTRIBUTING.md#-adding-a-monitor-panel-most-common)** section in CONTRIBUTING.md. The short version:

1. **Verify no conflicts** — Check that the component file and store key do not already exist
2. **Verify icon existence** — Grep `node_modules/lucide-react/dist/lucide-react.d.ts` for the export (NOT via `require()` — that's unreliable)
3. **Check alias conflicts** — Grep `MapToolbarButtons.tsx` for `as IconNameN` to find a free suffix
4. **Add store references** — Add interface field, default state, and setter in `map-store.ts` (3 refs per key)
5. **Create the component** — Copy `OfficeSupplyChainMonitor.tsx` pattern, replace with 4 real US locations and domain data. Export name MUST end in `Monitor`.
6. **Register LazyPanel** — Add store read and LazyPanel block in `MonitorPanelRegistry.tsx`
7. **Add toolbar button** — Add icon import, store read, and button block in `MapToolbarButtons.tsx`
8. **Verify** — `bun run lint` (exit 0), then test via agent-browser: open page, click button, verify heading + 4 locations + metrics

### Rules
- **NO indigo/blue** primary gradient colors
- `trend` must be `'up' | 'down' | 'stable'` with `as const`
- `flagshipLines` is a comma-separated STRING, `monthlyRevenue` is a NUMBER in $M
- **NEVER use `\'` or `\\'`** in description strings — causes parse errors
- Use real US locations with realistic business data

---

## 🔒 Security

For vulnerability reports and security policy, see **[SECURITY.md](SECURITY.md)**. Please **do not** open public GitHub issues for security vulnerabilities — follow the responsible disclosure process outlined in SECURITY.md.

---

## ⚙️ CI/CD

This repository uses [GitHub Actions](.github/workflows/ci.yml) for continuous integration. Every push to `main` and every pull request triggers:

| Job | Purpose | Tool |
|-----|---------|------|
| **lint** | Enforce code style and ESLint rules | `bun run lint` |
| **typecheck** | Catch type errors before merge | `bunx tsc --noEmit` |
| **build** | Verify production build succeeds | `bun run build` |
| **ci-pass** | Single status gate for branch protection | Aggregated |

The `concurrency` block cancels in-progress runs when a new commit is pushed to the same branch, keeping CI fast and cheap. To enable branch protection, require the `CI Passed` status check on `main`.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [MapLibre GL JS](https://maplibre.org/) — Open-source map rendering
- [MapTiler](https://www.maptiler.com/) — Map tiles and geocoding
- [OpenStreetMap](https://www.openstreetmap.org/) — Map data
- [OSRM](https://project-osrm.org/) — Routing engine
- [shadcn/ui](https://ui.shadcn.com/) — UI component library
- [Next.js](https://nextjs.org/) — React framework
- [Lucide](https://lucide.dev/) — Icon library
- [Prisma](https://www.prisma.io/) — Database ORM
- [Zustand](https://github.com/pmndrs/zustand) — State management
- [Framer Motion](https://www.framer.com/motion/) — Animations
