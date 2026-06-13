'use client'

import { LazyPanel } from '@/components/LazyPanel'

export function MobileBottomPanels() {
  return (
    <>
      <LazyPanel
        importFn={() => import('@/components/map/MobileWeatherBar')}
        exportName="MobileWeatherBar"
        shouldLoad={true}
      />
    </>
  )
}
