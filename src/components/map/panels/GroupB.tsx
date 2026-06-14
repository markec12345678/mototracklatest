'use client'

import dynamic from 'next/dynamic'

const TectonicPlateViewer = dynamic(() => import('@/components/map/TectonicPlateViewer').then((m) => ({ default: m.TectonicPlateViewer })), { ssr: false })
const TectonicStrainMonitor = dynamic(() => import('@/components/map/TectonicStrainMonitor').then((m) => ({ default: m.TectonicStrainMonitor })), { ssr: false })
const TectonicSubductionMonitor = dynamic(() => import('@/components/map/TectonicSubductionMonitor').then((m) => ({ default: m.TectonicSubductionMonitor })), { ssr: false })
const GeomagneticStormTracker = dynamic(() => import('@/components/map/GeomagneticStormTracker').then((m) => ({ default: m.GeomagneticStormTracker })), { ssr: false })
const GeomagneticReversalTracker = dynamic(() => import('@/components/map/GeomagneticReversalTracker').then((m) => ({ default: m.GeomagneticReversalTracker })), { ssr: false })
const ContinentalDriftMonitor = dynamic(() => import('@/components/map/ContinentalDriftMonitor').then((m) => ({ default: m.ContinentalDriftMonitor })), { ssr: false })
const SeismicActivityMap = dynamic(() => import('@/components/map/SeismicActivityMap').then((m) => ({ default: m.SeismicActivityMap })), { ssr: false })
const EarthquakeSwarmMonitor = dynamic(() => import('@/components/map/EarthquakeSwarmMonitor').then((m) => ({ default: m.EarthquakeSwarmMonitor })), { ssr: false })
const SeismicHazardAssessor = dynamic(() => import('@/components/map/SeismicHazardAssessor').then((m) => ({ default: m.SeismicHazardAssessor })), { ssr: false })
const VolcanoMonitor = dynamic(() => import('@/components/map/VolcanoMonitor').then((m) => ({ default: m.VolcanoMonitor })), { ssr: false })
const VolcanoSeismicMonitor = dynamic(() => import('@/components/map/VolcanoSeismicMonitor').then((m) => ({ default: m.VolcanoSeismicMonitor })), { ssr: false })
const VolcanoThermalMonitor = dynamic(() => import('@/components/map/VolcanoThermalMonitor').then((m) => ({ default: m.VolcanoThermalMonitor })), { ssr: false })
const VolcanicAshTracker = dynamic(() => import('@/components/map/VolcanicAshTracker').then((m) => ({ default: m.VolcanicAshTracker })), { ssr: false })
const VolcanicGasMonitor = dynamic(() => import('@/components/map/VolcanicGasMonitor').then((m) => ({ default: m.VolcanicGasMonitor })), { ssr: false })
const VolcanicPlumeTracker = dynamic(() => import('@/components/map/VolcanicPlumeTracker').then((m) => ({ default: m.VolcanicPlumeTracker })), { ssr: false })
const VolcanicDeformationMapper = dynamic(() => import('@/components/map/VolcanicDeformationMapper').then((m) => ({ default: m.VolcanicDeformationMapper })), { ssr: false })
const VolcanicGasEmissionMonitor = dynamic(() => import('@/components/map/VolcanicGasEmissionMonitor').then((m) => ({ default: m.VolcanicGasEmissionMonitor })), { ssr: false })
const VolcanicLavaFlowMonitor = dynamic(() => import('@/components/map/VolcanicLavaFlowMonitor').then((m) => ({ default: m.VolcanicLavaFlowMonitor })), { ssr: false })
const VolcanicIslandMonitor = dynamic(() => import('@/components/map/VolcanicIslandMonitor').then((m) => ({ default: m.VolcanicIslandMonitor })), { ssr: false })
const VolcanicAshDispersion = dynamic(() => import('@/components/map/VolcanicAshDispersion').then((m) => ({ default: m.VolcanicAshDispersion })), { ssr: false })

export function GroupB() {
  return (
    <>
      <TectonicPlateViewer />
      <TectonicStrainMonitor />
      <TectonicSubductionMonitor />
      <GeomagneticStormTracker />
      <GeomagneticReversalTracker />
      <ContinentalDriftMonitor />
      <SeismicActivityMap />
      <EarthquakeSwarmMonitor />
      <SeismicHazardAssessor />
      <VolcanoMonitor />
      <VolcanoSeismicMonitor />
      <VolcanoThermalMonitor />
      <VolcanicAshTracker />
      <VolcanicGasMonitor />
      <VolcanicPlumeTracker />
      <VolcanicDeformationMapper />
      <VolcanicGasEmissionMonitor />
      <VolcanicLavaFlowMonitor />
      <VolcanicIslandMonitor />
      <VolcanicAshDispersion />
    </>
  )
}
