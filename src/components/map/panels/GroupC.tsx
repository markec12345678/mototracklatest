'use client'

import dynamic from 'next/dynamic'

const GlacierMonitor = dynamic(() => import('@/components/map/GlacierMonitor').then((m) => ({ default: m.GlacierMonitor })), { ssr: false })
const IceSheetMonitor = dynamic(() => import('@/components/map/IceSheetMonitor').then((m) => ({ default: m.IceSheetMonitor })), { ssr: false })
const GlacierLakeOutburstTracker = dynamic(() => import('@/components/map/GlacierLakeOutburstTracker').then((m) => ({ default: m.GlacierLakeOutburstTracker })), { ssr: false })
const GlacialLakeMonitor = dynamic(() => import('@/components/map/GlacialLakeMonitor').then((m) => ({ default: m.GlacialLakeMonitor })), { ssr: false })
const GlacierVelocityTracker = dynamic(() => import('@/components/map/GlacierVelocityTracker').then((m) => ({ default: m.GlacierVelocityTracker })), { ssr: false })
const GlacierMassBalanceMonitor = dynamic(() => import('@/components/map/GlacierMassBalanceMonitor').then((m) => ({ default: m.GlacierMassBalanceMonitor })), { ssr: false })
const GlacierRetreatMonitor = dynamic(() => import('@/components/map/GlacierRetreatMonitor').then((m) => ({ default: m.GlacierRetreatMonitor })), { ssr: false })
const GlacierCalvingMonitor = dynamic(() => import('@/components/map/GlacierCalvingMonitor').then((m) => ({ default: m.GlacierCalvingMonitor })), { ssr: false })
const GreenlandIceTracker = dynamic(() => import('@/components/map/GreenlandIceTracker').then((m) => ({ default: m.GreenlandIceTracker })), { ssr: false })
const PolarIceSheetTracker = dynamic(() => import('@/components/map/PolarIceSheetTracker').then((m) => ({ default: m.PolarIceSheetTracker })), { ssr: false })
const IceSheetVelocityMapper = dynamic(() => import('@/components/map/IceSheetVelocityMapper').then((m) => ({ default: m.IceSheetVelocityMapper })), { ssr: false })
const SnowCoverMonitor = dynamic(() => import('@/components/map/SnowCoverMonitor').then((m) => ({ default: m.SnowCoverMonitor })), { ssr: false })
const SeaIceNavigator = dynamic(() => import('@/components/map/SeaIceNavigator').then((m) => ({ default: m.SeaIceNavigator })), { ssr: false })
const ArcticSeaIceMonitor = dynamic(() => import('@/components/map/ArcticSeaIceMonitor').then((m) => ({ default: m.ArcticSeaIceMonitor })), { ssr: false })
const PermafrostThawTracker = dynamic(() => import('@/components/map/PermafrostThawTracker').then((m) => ({ default: m.PermafrostThawTracker })), { ssr: false })
const PermafrostThawMonitor = dynamic(() => import('@/components/map/PermafrostThawMonitor').then((m) => ({ default: m.PermafrostThawMonitor })), { ssr: false })
const PermafrostThawMapper = dynamic(() => import('@/components/map/PermafrostThawMapper').then((m) => ({ default: m.PermafrostThawMapper })), { ssr: false })
const SubglacialLakeExplorer = dynamic(() => import('@/components/map/SubglacialLakeExplorer').then((m) => ({ default: m.SubglacialLakeExplorer })), { ssr: false })
const ThermokarstLakeMonitor = dynamic(() => import('@/components/map/ThermokarstLakeMonitor').then((m) => ({ default: m.ThermokarstLakeMonitor })), { ssr: false })
const CryosphereChangeTracker = dynamic(() => import('@/components/map/CryosphereChangeTracker').then((m) => ({ default: m.CryosphereChangeTracker })), { ssr: false })

export function GroupC() {
  return (
    <>
      <GlacierMonitor />
      <IceSheetMonitor />
      <GlacierLakeOutburstTracker />
      <GlacialLakeMonitor />
      <GlacierVelocityTracker />
      <GlacierMassBalanceMonitor />
      <GlacierRetreatMonitor />
      <GlacierCalvingMonitor />
      <GreenlandIceTracker />
      <PolarIceSheetTracker />
      <IceSheetVelocityMapper />
      <SnowCoverMonitor />
      <SeaIceNavigator />
      <ArcticSeaIceMonitor />
      <PermafrostThawTracker />
      <PermafrostThawMonitor />
      <PermafrostThawMapper />
      <SubglacialLakeExplorer />
      <ThermokarstLakeMonitor />
      <CryosphereChangeTracker />
    </>
  )
}
