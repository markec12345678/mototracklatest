'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useMapStore } from '@/lib/map-store'

export function VoiceNavigationToggle() {
  const voiceNavigationEnabled = useMapStore((s) => s.voiceNavigationEnabled)
  const setVoiceNavigationEnabled = useMapStore((s) => s.setVoiceNavigationEnabled)
  const routeSteps = useMapStore((s) => s.routeSteps)
  const [requesting, setRequesting] = useState(false)

  const handleToggle = useCallback(() => {
    if (!voiceNavigationEnabled) {
      // Request permission - some browsers need user interaction first
      setRequesting(true)
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        // Speak a test utterance to trigger permission in some browsers
        const utterance = new SpeechSynthesisUtterance('')
        utterance.volume = 0
        utterance.onend = () => {
          setRequesting(false)
          setVoiceNavigationEnabled(true)
        }
        utterance.onerror = () => {
          setRequesting(false)
          setVoiceNavigationEnabled(true)
        }
        window.speechSynthesis.speak(utterance)
        // Fallback in case onend doesn't fire for empty utterance
        setTimeout(() => {
          setRequesting(false)
          setVoiceNavigationEnabled(true)
        }, 300)
      } else {
        setRequesting(false)
        setVoiceNavigationEnabled(true)
      }
    } else {
      // Stop speaking
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      setVoiceNavigationEnabled(false)
    }
  }, [voiceNavigationEnabled, setVoiceNavigationEnabled])

  const hasSteps = routeSteps.length > 0
  const isActive = voiceNavigationEnabled && hasSteps

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${
                isActive
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-600 dark:text-emerald-400'
                  : 'map-control-glass'
              }`}
              onClick={handleToggle}
              disabled={requesting}
              aria-label={voiceNavigationEnabled ? 'Disable voice navigation' : 'Enable voice navigation'}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            {/* Active indicator */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-background"
                >
                  <motion.div
                    className="absolute inset-0 rounded-full bg-emerald-400"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {voiceNavigationEnabled ? 'Disable voice navigation' : 'Enable voice navigation'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
