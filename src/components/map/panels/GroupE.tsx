'use client'

import dynamic from 'next/dynamic'

const WildlifeTracker = dynamic(() => import('@/components/map/WildlifeTracker').then((m) => ({ default: m.WildlifeTracker })), { ssr: false })
const WildlifeMigrationTracker = dynamic(() => import('@/components/map/WildlifeMigrationTracker').then((m) => ({ default: m.WildlifeMigrationTracker })), { ssr: false })
const WhaleMigrationTracker = dynamic(() => import('@/components/map/WhaleMigrationTracker').then((m) => ({ default: m.WhaleMigrationTracker })), { ssr: false })
const ReefHealthMonitor = dynamic(() => import('@/components/map/ReefHealthMonitor').then((m) => ({ default: m.ReefHealthMonitor })), { ssr: false })
const CoralBleachingAlert = dynamic(() => import('@/components/map/CoralBleachingAlert').then((m) => ({ default: m.CoralBleachingAlert })), { ssr: false })
const CoralBleachingMonitor = dynamic(() => import('@/components/map/CoralBleachingMonitor').then((m) => ({ default: m.CoralBleachingMonitor })), { ssr: false })
const CoralReefRestorationTracker = dynamic(() => import('@/components/map/CoralReefRestorationTracker').then((m) => ({ default: m.CoralReefRestorationTracker })), { ssr: false })
const CoralGenomicsTracker = dynamic(() => import('@/components/map/CoralGenomicsTracker').then((m) => ({ default: m.CoralGenomicsTracker })), { ssr: false })
const MangroveMonitor = dynamic(() => import('@/components/map/MangroveMonitor').then((m) => ({ default: m.MangroveMonitor })), { ssr: false })
const MangroveRestorationTracker = dynamic(() => import('@/components/map/MangroveRestorationTracker').then((m) => ({ default: m.MangroveRestorationTracker })), { ssr: false })
const MangroveCarbonTracker = dynamic(() => import('@/components/map/MangroveCarbonTracker').then((m) => ({ default: m.MangroveCarbonTracker })), { ssr: false })
const MangroveRestorationProgress = dynamic(() => import('@/components/map/MangroveRestorationProgress').then((m) => ({ default: m.MangroveRestorationProgress })), { ssr: false })
const KelpForestMonitor = dynamic(() => import('@/components/map/KelpForestMonitor').then((m) => ({ default: m.KelpForestMonitor })), { ssr: false })
const SeagrassMeadowMonitor = dynamic(() => import('@/components/map/SeagrassMeadowMonitor').then((m) => ({ default: m.SeagrassMeadowMonitor })), { ssr: false })
const SaltMarshMonitor = dynamic(() => import('@/components/map/SaltMarshMonitor').then((m) => ({ default: m.SaltMarshMonitor })), { ssr: false })
const BiomeClassifier = dynamic(() => import('@/components/map/BiomeClassifier').then((m) => ({ default: m.BiomeClassifier })), { ssr: false })
const BioluminescenceTracker = dynamic(() => import('@/components/map/BioluminescenceTracker').then((m) => ({ default: m.BioluminescenceTracker })), { ssr: false })
const PhytoBloomMonitor = dynamic(() => import('@/components/map/PhytoBloomMonitor').then((m) => ({ default: m.PhytoBloomMonitor })), { ssr: false })
const AlgalBloomTracker = dynamic(() => import('@/components/map/AlgalBloomTracker').then((m) => ({ default: m.AlgalBloomTracker })), { ssr: false })
const InvasiveSpeciesTracker = dynamic(() => import('@/components/map/InvasiveSpeciesTracker').then((m) => ({ default: m.InvasiveSpeciesTracker })), { ssr: false })

export function GroupE() {
  return (
    <>
      <WildlifeTracker />
      <WildlifeMigrationTracker />
      <WhaleMigrationTracker />
      <ReefHealthMonitor />
      <CoralBleachingAlert />
      <CoralBleachingMonitor />
      <CoralReefRestorationTracker />
      <CoralGenomicsTracker />
      <MangroveMonitor />
      <MangroveRestorationTracker />
      <MangroveCarbonTracker />
      <MangroveRestorationProgress />
      <KelpForestMonitor />
      <SeagrassMeadowMonitor />
      <SaltMarshMonitor />
      <BiomeClassifier />
      <BioluminescenceTracker />
      <PhytoBloomMonitor />
      <AlgalBloomTracker />
      <InvasiveSpeciesTracker />
    </>
  )
}
