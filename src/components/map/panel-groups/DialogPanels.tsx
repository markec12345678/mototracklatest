'use client'

import { useMapStore } from '@/lib/map-store'
import { AddLocationDialog } from '@/components/map/AddLocationDialog'
import { CoordinateInputDialog } from '@/components/map/CoordinateInputDialog'
import { MapExportDialog } from '@/components/map/MapExportDialog'
import { MapPrintDialog } from '@/components/map/MapPrintDialog'
import { BookmarkManager } from '@/components/map/BookmarkManager'
import { KeyboardShortcutsDialog } from '@/components/map/KeyboardShortcutsDialog'
import { ShareDialog } from '@/components/map/ShareDialog'
import { EmbedMapDialog } from '@/components/map/EmbedMapDialog'
import { MarkerCategoriesManager } from '@/components/map/MarkerCategoriesManager'
import { WaypointOptimizer } from '@/components/map/WaypointOptimizer'
import { StylesMixer } from '@/components/map/StylesMixer'
import { RouteSharingDialog } from '@/components/map/RouteSharingDialog'
import { RoutePlayback } from '@/components/map/RoutePlayback'
import { SpeedAlertSystem } from '@/components/map/SpeedAlertSystem'
import { AltitudeAlertSystem } from '@/components/map/AltitudeAlertSystem'
import { GeofenceDialog } from '@/components/map/GeofenceDialog'
import { DistanceMatrix } from '@/components/map/DistanceMatrix'
import { StyleGallery } from '@/components/map/StyleGallery'

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
      <AddLocationDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <CoordinateInputDialog open={coordDialogOpen} onOpenChange={setCoordDialogOpen} />
      <MapExportDialog open={exportDialogOpen} onOpenChange={setExportDialogOpen} />
      <MapPrintDialog />
      <BookmarkManager open={bookmarkManagerOpen} onOpenChange={setBookmarkManagerOpen} />
      <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
      <ShareDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} />
      <EmbedMapDialog open={embedDialogOpen} onOpenChange={setEmbedDialogOpen} />
      <MarkerCategoriesManager open={markerCategoriesOpen} onOpenChange={setMarkerCategoriesOpen} />
      <WaypointOptimizer open={waypointOptimizerOpen} onOpenChange={setWaypointOptimizerOpen} />
      <StylesMixer open={stylesMixerOpen} onOpenChange={setStylesMixerOpen} />
      <RouteSharingDialog open={routeSharingOpen} onOpenChange={setRouteSharingOpen} />
      <RoutePlayback />
      <SpeedAlertSystem />
      <AltitudeAlertSystem />
      <GeofenceDialog open={geofenceDialogOpen} onOpenChange={setGeofenceDialogOpen} latitude={geofenceCoords?.lat} longitude={geofenceCoords?.lng} />
      <DistanceMatrix open={distanceMatrixOpen} onOpenChange={setDistanceMatrixOpen} />
      <StyleGallery open={styleGalleryOpen} onOpenChange={setStyleGalleryOpen} />
    </>
  )
}
