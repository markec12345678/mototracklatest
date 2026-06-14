'use client'

import dynamic from 'next/dynamic'

const AddLocationDialog = dynamic(() => import('@/components/map/AddLocationDialog').then((m) => ({ default: m.AddLocationDialog })), { ssr: false })
const KeyboardShortcutsDialog = dynamic(() => import('@/components/map/KeyboardShortcutsDialog').then((m) => ({ default: m.KeyboardShortcutsDialog })), { ssr: false })
const CoordinateInputDialog = dynamic(() => import('@/components/map/CoordinateInputDialog').then((m) => ({ default: m.CoordinateInputDialog })), { ssr: false })
const MapExportDialog = dynamic(() => import('@/components/map/MapExportDialog').then((m) => ({ default: m.MapExportDialog })), { ssr: false })
const EmbedMapDialog = dynamic(() => import('@/components/map/EmbedMapDialog').then((m) => ({ default: m.EmbedMapDialog })), { ssr: false })
const BookmarkManager = dynamic(() => import('@/components/map/BookmarkManager').then((m) => ({ default: m.BookmarkManager })), { ssr: false })
const ShareDialog = dynamic(() => import('@/components/map/ShareDialog').then((m) => ({ default: m.ShareDialog })), { ssr: false })
const GeofenceDialog = dynamic(() => import('@/components/map/GeofenceDialog').then((m) => ({ default: m.GeofenceDialog })), { ssr: false })
const DistanceMatrix = dynamic(() => import('@/components/map/DistanceMatrix').then((m) => ({ default: m.DistanceMatrix })), { ssr: false })
const StyleGallery = dynamic(() => import('@/components/map/StyleGallery').then((m) => ({ default: m.StyleGallery })), { ssr: false })
const MapPrintDialog = dynamic(() => import('@/components/map/MapPrintDialog').then((m) => ({ default: m.MapPrintDialog })), { ssr: false })
const MarkerCategoriesManager = dynamic(() => import('@/components/map/MarkerCategoriesManager').then((m) => ({ default: m.MarkerCategoriesManager })), { ssr: false })
const StylesMixer = dynamic(() => import('@/components/map/StylesMixer').then((m) => ({ default: m.StylesMixer })), { ssr: false })
const MapLabelsOverlay = dynamic(() => import('@/components/map/MapLabelsOverlay').then((m) => ({ default: m.MapLabelsOverlay })), { ssr: false })
const LocationClusterMap = dynamic(() => import('@/components/map/LocationClusterMap').then((m) => ({ default: m.LocationClusterMap })), { ssr: false })
const MapStoryCreator = dynamic(() => import('@/components/map/MapStoryCreator').then((m) => ({ default: m.MapStoryCreator })), { ssr: false })
const DataImportExport = dynamic(() => import('@/components/map/DataImportExport').then((m) => ({ default: m.DataImportExport })), { ssr: false })
const MapOverlayGallery = dynamic(() => import('@/components/map/MapOverlayGallery').then((m) => ({ default: m.MapOverlayGallery })), { ssr: false })
const AdvancedMarkerManager = dynamic(() => import('@/components/map/AdvancedMarkerManager').then((m) => ({ default: m.AdvancedMarkerManager })), { ssr: false })
const ImageOverlayManager = dynamic(() => import('@/components/map/ImageOverlayManager').then((m) => ({ default: m.ImageOverlayManager })), { ssr: false })

export function GroupL() {
  return (
    <>
      <AddLocationDialog />
      <KeyboardShortcutsDialog />
      <CoordinateInputDialog />
      <MapExportDialog />
      <EmbedMapDialog />
      <BookmarkManager />
      <ShareDialog />
      <GeofenceDialog />
      <DistanceMatrix />
      <StyleGallery />
      <MapPrintDialog />
      <MarkerCategoriesManager />
      <StylesMixer />
      <MapLabelsOverlay />
      <LocationClusterMap />
      <MapStoryCreator />
      <DataImportExport />
      <MapOverlayGallery />
      <AdvancedMarkerManager />
      <ImageOverlayManager />
    </>
  )
}
