'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePWAInstall } from '@/hooks/use-pwa-install'

const DISMISSED_KEY = 'pwa-install-banner-dismissed'

function getDismissedFromStorage(): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(DISMISSED_KEY) === 'true'
}

export function PWAInstallBanner() {
  const { canInstall, install } = usePWAInstall()
  const [installing, setInstalling] = useState(false)
  const [dismissed, setDismissed] = useState(getDismissedFromStorage)

  const handleDismiss = useCallback(() => {
    setDismissed(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem(DISMISSED_KEY, 'true')
    }
  }, [])

  const handleInstall = useCallback(async () => {
    setInstalling(true)
    const accepted = await install()
    setInstalling(false)
    if (accepted) {
      handleDismiss()
    }
  }, [install, handleDismiss])

  const visible = canInstall && !dismissed

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-16 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md"
        >
          <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
              <Download className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Install MapExplorer</p>
              <p className="text-xs text-muted-foreground mt-0.5">Use offline & get a native-like experience</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                onClick={handleInstall}
                disabled={installing}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 text-xs px-3 h-8"
              >
                {installing ? 'Installing…' : 'Install'}
              </Button>
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Dismiss install banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
