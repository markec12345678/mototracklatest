# 🗺️ MotoTrack - MapLibre Explorer

A feature-rich, interactive mapping application built with **Next.js 16**, **MapLibre GL JS**, and **MapTiler**. Explore maps, search locations, plan routes, measure distances, analyze terrain, track weather, and much more — all in one beautiful interface.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![MapLibre GL](https://img.shields.io/badge/MapLibre_GL-5-blueviolet?logo=maplibre)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

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
- **Isochrone Visualization** — See reachable areas from a point

### 📏 Measurement & Drawing
- **Distance Measurement** — Click points to measure with haversine formula
- **Area Measurement** — Calculate enclosed area with shoelace formula
- **Marker Placement** — Click to add draggable markers with categories
- **Map Annotations** — Add text labels anywhere on the map
- **Right-Click Context Menu** — Add markers, measure, copy coordinates, and more

### 🏔️ Terrain & Elevation
- **Elevation Profile** — Visualize terrain along routes and paths
- **3D Terrain Rendering** with adjustable exaggeration
- **Elevation at Cursor** — Real-time altitude display

### 🌤️ Weather & Sun
- **Weather Panel** — Current conditions with temperature, wind, humidity, and more
- **Mobile Weather Bar** — Compact weather strip for mobile
- **Sun Position Overlay** — Day/night terminator line and subsolar point
- **Golden & Blue Hour** indicators for photography planning
- **Sun Info Panel** — Sunrise, sunset, solar noon, and day length

### 📦 Import & Export
- **GPX Import** — Load GPX 1.1 tracks and waypoints onto the map
- **GPX Export** — Save routes and tracks as GPX files
- **Map Export** — Screenshot the map as PNG, JPEG, or WebP at custom resolutions
- **Share Link** — Generate a shareable URL with current map view

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
- **Context Menu** — Right-click for quick actions
- **Map Stats Panel** — Zoom level, center coordinates, bearing, pitch
- **Notifications** — Real-time feedback for all actions
- **Location Detail Drawer** — Expandable info panel for markers and POIs

### 🎨 Design & UX
- **Dark/Light Mode** with next-themes
- **Fully Responsive** — Optimized for desktop, tablet, and mobile
- **Glassmorphism UI** — Frosted glass panels with blur effects
- **Smooth Animations** — Framer Motion transitions throughout
- **Custom Scrollbars** — Styled for both light and dark themes
- **Mobile Safe Areas** — Respects iOS notch and home indicator
- **Accessible** — Semantic HTML, ARIA labels, keyboard navigation

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
| **Map Engine** | MapLibre GL JS 5 |
| **Tiles & Geocoding** | MapTiler API |
| **Routing** | OSRM (Open Source Routing Machine) |
| **POI Data** | Overpass API (OpenStreetMap) |
| **State Management** | Zustand (persisted) |
| **Database** | Prisma ORM + SQLite |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Notifications** | Sonner |

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

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
├── prisma/
│   └── schema.prisma          # Database schema (Location, MapStyle, Route)
├── public/
│   ├── logo.svg               # App logo
│   └── robots.txt             # SEO robots
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── directions/    # OSRM routing proxy
│   │   │   ├── elevation/     # Elevation data proxy
│   │   │   ├── export/gpx/    # GPX file export
│   │   │   ├── import/gpx/    # GPX file import
│   │   │   ├── isochrone/     # Isochrone calculation
│   │   │   ├── locations/     # CRUD for saved locations
│   │   │   ├── poi/           # Overpass POI search
│   │   │   ├── reverse-geocode/ # Reverse geocoding
│   │   │   ├── routes/        # CRUD for saved routes
│   │   │   ├── search/        # MapTiler geocoding search
│   │   │   ├── styles/        # Map style management
│   │   │   ├── sun-position/  # Solar position calculations
│   │   │   └── weather/       # Weather data proxy
│   │   ├── globals.css        # Global styles, animations, custom scrollbars
│   │   ├── layout.tsx         # Root layout with providers
│   │   └── page.tsx           # Main application page
│   ├── components/
│   │   ├── map/               # Map-specific components
│   │   │   ├── MapView.tsx        # Core map renderer
│   │   │   ├── MapSidebar.tsx     # Sidebar with tabs
│   │   │   ├── SearchBar.tsx      # Geocoding search
│   │   │   ├── MapToolbar.tsx     # Floating tool palette
│   │   │   ├── StyleSwitcher.tsx  # Map style selector
│   │   │   ├── WeatherPanel.tsx   # Weather information
│   │   │   ├── ElevationProfile.tsx # Terrain profile chart
│   │   │   ├── MiniMap.tsx        # Overview minimap
│   │   │   ├── MapComparison.tsx  # Split-screen comparison
│   │   │   ├── BookmarkManager.tsx # Location bookmarks
│   │   │   ├── MapAnnotations.tsx  # Text annotations
│   │   │   ├── MapContextMenu.tsx  # Right-click menu
│   │   │   ├── UndoRedoBar.tsx    # Undo/redo controls
│   │   │   └── ...                # 25+ more components
│   │   └── ui/                # shadcn/ui components (40+)
│   ├── hooks/
│   │   ├── use-mobile.ts      # Mobile detection hook
│   │   └── use-toast.ts       # Toast notification hook
│   └── lib/
│       ├── map-store.ts       # Zustand map state (persisted)
│       ├── undo-manager.ts    # Generic undo/redo engine
│       ├── use-undo-store.ts  # Undo/redo Zustand store
│       ├── weather-utils.ts   # Weather data utilities
│       ├── db.ts              # Prisma client instance
│       └── utils.ts           # General utilities (cn, etc.)
├── .env.example               # Environment variable template
├── .gitignore                 # Git ignore rules
├── components.json            # shadcn/ui configuration
├── next.config.ts             # Next.js configuration
├── package.json               # Dependencies and scripts
├── tailwind.config.ts         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

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
| `/api/elevation` | GET | Elevation data lookup |
| `/api/weather` | GET | Current weather data |
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

---

## 🌐 External APIs

| Service | Purpose | Docs |
|---------|---------|------|
| **MapTiler** | Map tiles, geocoding, styles | [docs.maptiler.com](https://docs.maptiler.com/) |
| **OSRM** | Routing (driving, cycling, walking) | [project-osrm.org](https://project-osrm.org/) |
| **Overpass** | OpenStreetMap POI queries | [overpass-api.de](https://overpass-api.de/) |
| **Open-Meteo** | Weather data | [open-meteo.com](https://open-meteo.com/) |

---

## 📱 Responsive Design

The app is fully responsive with three breakpoints:

- **Mobile** (<640px) — Compact UI, bottom sheets, swipe gestures, safe-area padding
- **Tablet** (640-1024px) — Side panel collapsible, floating controls
- **Desktop** (>1024px) — Full sidebar, multi-panel layout, keyboard shortcuts

---

## 🎯 Roadmap

- [ ] **Offline / PWA Support** — Service worker caching for offline maps
- [ ] **Terrain Profile for Routes** — Elevation graph along route path
- [ ] **Multi-route Comparison** — Compare multiple routes side by side
- [ ] **Collaborative Maps** — Share and edit maps with others in real-time
- [ ] **Custom Tile Sources** — Add your own tile server URLs
- [ ] **3D Building Explorer** — Interactive 3D building inspection
- [ ] **Heatmap Layer** — Visualize density of markers/POIs
- [ ] **Geofencing Alerts** — Notification when entering/leaving areas
- [ ] **Track Recording** — Record GPS tracks in real-time
- [ ] **Multi-language Support** — i18n with next-intl

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

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
