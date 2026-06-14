'use client'

import dynamic from 'next/dynamic'

const DroughtMonitorPanel = dynamic(() => import('@/components/map/DroughtMonitorPanel').then((m) => ({ default: m.DroughtMonitorPanel })), { ssr: false })
const CarbonFootprintMapper = dynamic(() => import('@/components/map/CarbonFootprintMapper').then((m) => ({ default: m.CarbonFootprintMapper })), { ssr: false })
const CarbonCaptureTracker = dynamic(() => import('@/components/map/CarbonCaptureTracker').then((m) => ({ default: m.CarbonCaptureTracker })), { ssr: false })
const MethaneEmissionsTracker = dynamic(() => import('@/components/map/MethaneEmissionsTracker').then((m) => ({ default: m.MethaneEmissionsTracker })), { ssr: false })
const MethaneEmissionTracker = dynamic(() => import('@/components/map/MethaneEmissionTracker').then((m) => ({ default: m.MethaneEmissionTracker })), { ssr: false })
const MethaneHydrateMonitor = dynamic(() => import('@/components/map/MethaneHydrateMonitor').then((m) => ({ default: m.MethaneHydrateMonitor })), { ssr: false })
const MethaneSeepMapper = dynamic(() => import('@/components/map/MethaneSeepMapper').then((m) => ({ default: m.MethaneSeepMapper })), { ssr: false })
const PeatlandMonitorPanel = dynamic(() => import('@/components/map/PeatlandMonitorPanel').then((m) => ({ default: m.PeatlandMonitorPanel })), { ssr: false })
const PeatlandCarbonTracker = dynamic(() => import('@/components/map/PeatlandCarbonTracker').then((m) => ({ default: m.PeatlandCarbonTracker })), { ssr: false })
const PeatFireTracker = dynamic(() => import('@/components/map/PeatFireTracker').then((m) => ({ default: m.PeatFireTracker })), { ssr: false })
const SoilCarbonSequestrationMonitor = dynamic(() => import('@/components/map/SoilCarbonSequestrationMonitor').then((m) => ({ default: m.SoilCarbonSequestrationMonitor })), { ssr: false })
const DeforestationTracker = dynamic(() => import('@/components/map/DeforestationTracker').then((m) => ({ default: m.DeforestationTracker })), { ssr: false })
const DesertificationMonitor = dynamic(() => import('@/components/map/DesertificationMonitor').then((m) => ({ default: m.DesertificationMonitor })), { ssr: false })
const DesertificationRiskAssessor = dynamic(() => import('@/components/map/DesertificationRiskAssessor').then((m) => ({ default: m.DesertificationRiskAssessor })), { ssr: false })
const SaharaReforestationTracker = dynamic(() => import('@/components/map/SaharaReforestationTracker').then((m) => ({ default: m.SaharaReforestationTracker })), { ssr: false })
const VegetationIndexTracker = dynamic(() => import('@/components/map/VegetationIndexTracker').then((m) => ({ default: m.VegetationIndexTracker })), { ssr: false })
const SeaLevelRiseProjector = dynamic(() => import('@/components/map/SeaLevelRiseProjector').then((m) => ({ default: m.SeaLevelRiseProjector })), { ssr: false })
const AcidRainTracker = dynamic(() => import('@/components/map/AcidRainTracker').then((m) => ({ default: m.AcidRainTracker })), { ssr: false })
const OzoneLayerMonitor = dynamic(() => import('@/components/map/OzoneLayerMonitor').then((m) => ({ default: m.OzoneLayerMonitor })), { ssr: false })
const StratosphericOzoneMapper = dynamic(() => import('@/components/map/StratosphericOzoneMapper').then((m) => ({ default: m.StratosphericOzoneMapper })), { ssr: false })

export function GroupG() {
  return (
    <>
      <DroughtMonitorPanel />
      <CarbonFootprintMapper />
      <CarbonCaptureTracker />
      <MethaneEmissionsTracker />
      <MethaneEmissionTracker />
      <MethaneHydrateMonitor />
      <MethaneSeepMapper />
      <PeatlandMonitorPanel />
      <PeatlandCarbonTracker />
      <PeatFireTracker />
      <SoilCarbonSequestrationMonitor />
      <DeforestationTracker />
      <DesertificationMonitor />
      <DesertificationRiskAssessor />
      <SaharaReforestationTracker />
      <VegetationIndexTracker />
      <SeaLevelRiseProjector />
      <AcidRainTracker />
      <OzoneLayerMonitor />
      <StratosphericOzoneMapper />
    </>
  )
}
