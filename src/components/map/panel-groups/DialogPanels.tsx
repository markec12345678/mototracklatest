'use client'

import { useMapStore } from '@/lib/map-store'
import { LazyPanel } from '@/components/LazyPanel'

interface DialogPanelsProps {
  geofenceCoords: { lat: number; lng: number } | null
}

export function DialogPanels({ geofenceCoords }: DialogPanelsProps) {
  const addDialogOpen = useMapStore((s) => s.addLocationDialogOpen)
  const setAddDialogOpen = useMapStore((s) => s.setAddLocationDialogOpen)
  const shortcutsOpen = useMapStore((s) => s.shortcutsDialogOpen)
  const setShortcutsOpen = useMapStore((s) => s.setShortcutsDialogOpen)
  const coordDialogOpen = useMapStore((s) => s.coordInputDialogOpen)
  const setCoordDialogOpen = useMapStore((s) => s.setCoordInputDialogOpen)
  const exportDialogOpen = useMapStore((s) => s.exportDialogOpen)
  const setExportDialogOpen = useMapStore((s) => s.setExportDialogOpen)
  const bookmarkManagerOpen = useMapStore((s) => s.bookmarkManagerOpen)
  const setBookmarkManagerOpen = useMapStore((s) => s.setBookmarkManagerOpen)
  const shareDialogOpen = useMapStore((s) => s.shareDialogOpen)
  const setShareDialogOpen = useMapStore((s) => s.setShareDialogOpen)
  const embedDialogOpen = useMapStore((s) => s.embedDialogOpen)
  const setEmbedDialogOpen = useMapStore((s) => s.setEmbedDialogOpen)
  const markerCategoriesOpen = useMapStore((s) => s.markerCategoriesOpen)
  const setMarkerCategoriesOpen = useMapStore((s) => s.setMarkerCategoriesOpen)
  const waypointOptimizerOpen = useMapStore((s) => s.waypointOptimizerOpen)
  const setWaypointOptimizerOpen = useMapStore((s) => s.setWaypointOptimizerOpen)
  const stylesMixerOpen = useMapStore((s) => s.stylesMixerOpen)
  const setStylesMixerOpen = useMapStore((s) => s.setStylesMixerOpen)
  const routeSharingOpen = useMapStore((s) => s.routeSharingOpen)
  const setRouteSharingOpen = useMapStore((s) => s.setRouteSharingOpen)
  const geofenceDialogOpen = useMapStore((s) => s.geofenceDialogOpen)
  const setGeofenceDialogOpen = useMapStore((s) => s.setGeofenceDialogOpen)
  const distanceMatrixOpen = useMapStore((s) => s.distanceMatrixOpen)
  const setDistanceMatrixOpen = useMapStore((s) => s.setDistanceMatrixOpen)
  const styleGalleryOpen = useMapStore((s) => s.styleGalleryOpen)
  const setStyleGalleryOpen = useMapStore((s) => s.setStyleGalleryOpen)

  return (
    <>
      {/* Each dialog is lazy-loaded only when opened */}
      <LazyPanel
        importFn={() => import('@/components/map/AddLocationDialog')}
        exportName="AddLocationDialog"
        shouldLoad={addDialogOpen}
        props={{ open: addDialogOpen, onOpenChange: setAddDialogOpen }}
      />
      <LazyPanel
        importFn={() => import('@/components/map/CoordinateInputDialog')}
        exportName="CoordinateInputDialog"
        shouldLoad={coordDialogOpen}
        props={{ open: coordDialogOpen, onOpenChange: setCoordDialogOpen }}
      />
      <LazyPanel
        importFn={() => import('@/components/map/MapExportDialog')}
        exportName="MapExportDialog"
        shouldLoad={exportDialogOpen}
        props={{ open: exportDialogOpen, onOpenChange: setExportDialogOpen }}
      />
      <LazyPanel
        importFn={() => import('@/components/map/MapPrintDialog')}
        exportName="MapPrintDialog"
        shouldLoad={true}
      />
      <LazyPanel
        importFn={() => import('@/components/map/BookmarkManager')}
        exportName="BookmarkManager"
        shouldLoad={bookmarkManagerOpen}
        props={{ open: bookmarkManagerOpen, onOpenChange: setBookmarkManagerOpen }}
      />
      <LazyPanel
        importFn={() => import('@/components/map/KeyboardShortcutsDialog')}
        exportName="KeyboardShortcutsDialog"
        shouldLoad={shortcutsOpen}
        props={{ open: shortcutsOpen, onOpenChange: setShortcutsOpen }}
      />
      <LazyPanel
        importFn={() => import('@/components/map/ShareDialog')}
        exportName="ShareDialog"
        shouldLoad={shareDialogOpen}
        props={{ open: shareDialogOpen, onOpenChange: setShareDialogOpen }}
      />
      <LazyPanel
        importFn={() => import('@/components/map/EmbedMapDialog')}
        exportName="EmbedMapDialog"
        shouldLoad={embedDialogOpen}
        props={{ open: embedDialogOpen, onOpenChange: setEmbedDialogOpen }}
      />
      <LazyPanel
        importFn={() => import('@/components/map/MarkerCategoriesManager')}
        exportName="MarkerCategoriesManager"
        shouldLoad={markerCategoriesOpen}
        props={{ open: markerCategoriesOpen, onOpenChange: setMarkerCategoriesOpen }}
      />
      <LazyPanel
        importFn={() => import('@/components/map/WaypointOptimizer')}
        exportName="WaypointOptimizer"
        shouldLoad={waypointOptimizerOpen}
        props={{ open: waypointOptimizerOpen, onOpenChange: setWaypointOptimizerOpen }}
      />
      <LazyPanel
        importFn={() => import('@/components/map/StylesMixer')}
        exportName="StylesMixer"
        shouldLoad={stylesMixerOpen}
        props={{ open: stylesMixerOpen, onOpenChange: setStylesMixerOpen }}
      />
      <LazyPanel
        importFn={() => import('@/components/map/RouteSharingDialog')}
        exportName="RouteSharingDialog"
        shouldLoad={routeSharingOpen}
        props={{ open: routeSharingOpen, onOpenChange: setRouteSharingOpen }}
      />
      <LazyPanel
        importFn={() => import('@/components/map/RoutePlayback')}
        exportName="RoutePlayback"
        shouldLoad={true}
      />
      <LazyPanel
        importFn={() => import('@/components/map/SpeedAlertSystem')}
        exportName="SpeedAlertSystem"
        shouldLoad={true}
      />
      <LazyPanel
        importFn={() => import('@/components/map/AltitudeAlertSystem')}
        exportName="AltitudeAlertSystem"
        shouldLoad={true}
      />
      <LazyPanel
        importFn={() => import('@/components/map/GeofenceDialog')}
        exportName="GeofenceDialog"
        shouldLoad={geofenceDialogOpen}
        props={{ open: geofenceDialogOpen, onOpenChange: setGeofenceDialogOpen, latitude: geofenceCoords?.lat, longitude: geofenceCoords?.lng }}
      />
      <LazyPanel
        importFn={() => import('@/components/map/DistanceMatrix')}
        exportName="DistanceMatrix"
        shouldLoad={distanceMatrixOpen}
        props={{ open: distanceMatrixOpen, onOpenChange: setDistanceMatrixOpen }}
      />
      <LazyPanel
        importFn={() => import('@/components/map/StyleGallery')}
        exportName="StyleGallery"
        shouldLoad={styleGalleryOpen}
        props={{ open: styleGalleryOpen, onOpenChange: setStyleGalleryOpen }}
      />
    </>
  )
}
