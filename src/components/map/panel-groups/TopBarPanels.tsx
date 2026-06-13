'use client'

import { UndoRedoBar } from '@/components/map/UndoRedoBar'
import { StyleSwitcher } from '@/components/map/StyleSwitcher'
import { ThemeToggle } from '@/components/map/ThemeToggle'
import { LanguageSelector } from '@/components/map/LanguageSelector'
import { NotificationCenter } from '@/components/map/NotificationCenter'
import { VoiceNavigationToggle } from '@/components/map/VoiceNavigationToggle'
import { CollaborationPanel } from '@/components/map/CollaborationPanel'

export function TopBarPanels() {
  return (
    <>
      <UndoRedoBar />
      <StyleSwitcher />
      <ThemeToggle />
      <LanguageSelector />
      <NotificationCenter />
      <VoiceNavigationToggle />
      <CollaborationPanel />
    </>
  )
}
