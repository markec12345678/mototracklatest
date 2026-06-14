'use client'

import dynamic from 'next/dynamic'

const TsunamiAlertSystem = dynamic(() => import('@/components/map/TsunamiAlertSystem').then((m) => ({ default: m.TsunamiAlertSystem })), { ssr: false })
const TsunamiBuoyTracker = dynamic(() => import('@/components/map/TsunamiBuoyTracker').then((m) => ({ default: m.TsunamiBuoyTracker })), { ssr: false })
const WildfireRiskAssessor = dynamic(() => import('@/components/map/WildfireRiskAssessor').then((m) => ({ default: m.WildfireRiskAssessor })), { ssr: false })
const WildfireSpreadSimulator = dynamic(() => import('@/components/map/WildfireSpreadSimulator').then((m) => ({ default: m.WildfireSpreadSimulator })), { ssr: false })
const WildfireSmokeDispersion = dynamic(() => import('@/components/map/WildfireSmokeDispersion').then((m) => ({ default: m.WildfireSmokeDispersion })), { ssr: false })
const LandslidePredictor = dynamic(() => import('@/components/map/LandslidePredictor').then((m) => ({ default: m.LandslidePredictor })), { ssr: false })
const TropicalCycloneTracker = dynamic(() => import('@/components/map/TropicalCycloneTracker').then((m) => ({ default: m.TropicalCycloneTracker })), { ssr: false })
const TornadoActivityTracker = dynamic(() => import('@/components/map/TornadoActivityTracker').then((m) => ({ default: m.TornadoActivityTracker })), { ssr: false })
const HailStormTracker = dynamic(() => import('@/components/map/HailStormTracker').then((m) => ({ default: m.HailStormTracker })), { ssr: false })
const LightningStrikeMap = dynamic(() => import('@/components/map/LightningStrikeMap').then((m) => ({ default: m.LightningStrikeMap })), { ssr: false })
const BatchActionBar = dynamic(() => import('@/components/map/BatchOperations').then((m) => ({ default: m.BatchActionBar })), { ssr: false })

export function GroupN() {
  return (
    <>
      <TsunamiAlertSystem />
      <TsunamiBuoyTracker />
      <WildfireRiskAssessor />
      <WildfireSpreadSimulator />
      <WildfireSmokeDispersion />
      <LandslidePredictor />
      <TropicalCycloneTracker />
      <TornadoActivityTracker />
      <HailStormTracker />
      <LightningStrikeMap />
      <BatchActionBar />
    </>
  )
}
