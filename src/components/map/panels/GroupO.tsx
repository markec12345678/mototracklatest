'use client'

import dynamic from 'next/dynamic'

const CulturalHeritageMap = dynamic(() => import('@/components/map/CulturalHeritageMap').then((m) => ({ default: m.CulturalHeritageMap })), { ssr: false })
const ArchaeologyMap = dynamic(() => import('@/components/map/ArchaeologyMap').then((m) => ({ default: m.ArchaeologyMap })), { ssr: false })
const PhenologyTracker = dynamic(() => import('@/components/map/PhenologyTracker').then((m) => ({ default: m.PhenologyTracker })), { ssr: false })
const PolynyaMonitor = dynamic(() => import('@/components/map/PolynyaMonitor').then((m) => ({ default: m.PolynyaMonitor })), { ssr: false })
const PelagicZoneTracker = dynamic(() => import('@/components/map/PelagicZoneTracker').then((m) => ({ default: m.PelagicZoneTracker })), { ssr: false })

export function GroupO() {
  return (
    <>
      <CulturalHeritageMap />
      <ArchaeologyMap />
      <PhenologyTracker />
      <PolynyaMonitor />
      <PelagicZoneTracker />
    </>
  )
}
