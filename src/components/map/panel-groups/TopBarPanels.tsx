'use client'

import { LazyPanel } from '@/components/LazyPanel'

export function TopBarPanels() {
  return (
    <>
      <LazyPanel
        importFn={() => import('@/components/map/UndoRedoBar')}
        exportName="UndoRedoBar"
        shouldLoad={true}
      />
      <LazyPanel
        importFn={() => import('@/components/map/StyleSwitcher')}
        exportName="StyleSwitcher"
        shouldLoad={true}
      />
      <LazyPanel
        importFn={() => import('@/components/map/ThemeToggle')}
        exportName="ThemeToggle"
        shouldLoad={true}
      />
      <LazyPanel
        importFn={() => import('@/components/map/LanguageSelector')}
        exportName="LanguageSelector"
        shouldLoad={true}
      />
      <LazyPanel
        importFn={() => import('@/components/map/NotificationCenter')}
        exportName="NotificationCenter"
        shouldLoad={true}
      />
      <LazyPanel
        importFn={() => import('@/components/map/VoiceNavigationToggle')}
        exportName="VoiceNavigationToggle"
        shouldLoad={true}
      />
      <LazyPanel
        importFn={() => import('@/components/map/CollaborationPanel')}
        exportName="CollaborationPanel"
        shouldLoad={true}
      />
    </>
  )
}
