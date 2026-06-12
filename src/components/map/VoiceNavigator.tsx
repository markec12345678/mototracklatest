'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX, SkipForward, SkipBack, ChevronRight, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMapStore } from '@/lib/map-store'

function formatInstruction(step: { maneuver: { type: string; modifier?: string }; name: string; distance: number }): string {
  const { maneuver, name, distance } = step
  const distText = distance >= 1000
    ? `${(distance / 1000).toFixed(1)} kilometers`
    : `${Math.round(distance)} meters`

  let instruction = ''

  switch (maneuver.type) {
    case 'depart':
      instruction = `Head ${maneuver.modifier || 'north'}${name ? ` on ${name}` : ''}`
      break
    case 'arrive':
      instruction = name ? `Arrive at ${name}` : 'You have arrived at your destination'
      break
    case 'turn':
      instruction = `Turn ${maneuver.modifier || 'right'}${name ? ` onto ${name}` : ''}`
      break
    case 'new name':
      instruction = `Continue onto ${name || 'the road'}`
      break
    case 'merge':
      instruction = `Merge ${maneuver.modifier || ''}${name ? ` onto ${name}` : ''}`
      break
    case 'fork':
      instruction = `Take the ${maneuver.modifier || 'right'} fork${name ? ` onto ${name}` : ''}`
      break
    case 'roundabout':
      instruction = `Enter the roundabout${name ? `, then exit onto ${name}` : ''}`
      break
    case 'rotary':
      instruction = `Enter the rotary${name ? `, then exit onto ${name}` : ''}`
      break
    case 'end of road':
      instruction = `Turn ${maneuver.modifier || 'right'} at the end of the road`
      break
    case 'continue':
      instruction = `Continue${maneuver.modifier ? ` ${maneuver.modifier}` : ''}${name ? ` on ${name}` : ''}`
      break
    default:
      instruction = name ? `Continue on ${name}` : 'Continue'
      break
  }

  return `${instruction} for ${distText}`
}

export function VoiceNavigator() {
  const voiceNavigationEnabled = useMapStore((s) => s.voiceNavigationEnabled)
  const routeSteps = useMapStore((s) => s.routeSteps)
  const voiceCurrentStepIndex = useMapStore((s) => s.voiceCurrentStepIndex)
  const setVoiceCurrentStepIndex = useMapStore((s) => s.setVoiceCurrentStepIndex)
  const setHighlightedStepIndex = useMapStore((s) => s.setHighlightedStepIndex)
  const voiceLanguage = useMapStore((s) => s.voiceLanguage)

  const [isMuted, setIsMuted] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const speakingRef = useRef(false)
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined') return
    if (!window.speechSynthesis) return
    if (isMuted) return

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = voiceLanguage
    utterance.rate = 1
    utterance.pitch = 1

    const voices = window.speechSynthesis.getVoices()
    const langPrefix = voiceLanguage.split('-')[0]
    const matchingVoice = voices.find((v) => v.lang.startsWith(langPrefix))
    if (matchingVoice) {
      utterance.voice = matchingVoice
    }

    utterance.onstart = () => {
      setIsSpeaking(true)
      speakingRef.current = true
    }
    utterance.onend = () => {
      setIsSpeaking(false)
      speakingRef.current = false
      // Auto-advance to next step after speaking
      const steps = useMapStore.getState().routeSteps
      const currentIdx = useMapStore.getState().voiceCurrentStepIndex
      if (currentIdx < steps.length - 1) {
        autoAdvanceRef.current = setTimeout(() => {
          const nextIdx = currentIdx + 1
          setVoiceCurrentStepIndex(nextIdx)
          setHighlightedStepIndex(nextIdx)
        }, 1500)
      }
    }
    utterance.onerror = () => {
      setIsSpeaking(false)
      speakingRef.current = false
    }

    window.speechSynthesis.speak(utterance)
  }, [isMuted, voiceLanguage, setVoiceCurrentStepIndex, setHighlightedStepIndex])

  // Speak the current step when it changes
  useEffect(() => {
    if (!voiceNavigationEnabled || routeSteps.length === 0) return

    const step = routeSteps[voiceCurrentStepIndex]
    if (step) {
      const instruction = formatInstruction(step)
      speak(instruction)
    }

    // Highlight the current step on the map
    setHighlightedStepIndex(voiceCurrentStepIndex)

    return () => {
      if (autoAdvanceRef.current) {
        clearTimeout(autoAdvanceRef.current)
      }
    }
  }, [voiceNavigationEnabled, voiceCurrentStepIndex, routeSteps, speak, setHighlightedStepIndex])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      if (autoAdvanceRef.current) {
        clearTimeout(autoAdvanceRef.current)
      }
    }
  }, [])

  const handleNextStep = useCallback(() => {
    if (voiceCurrentStepIndex < routeSteps.length - 1) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      const nextIdx = voiceCurrentStepIndex + 1
      setVoiceCurrentStepIndex(nextIdx)
      setHighlightedStepIndex(nextIdx)
    }
  }, [voiceCurrentStepIndex, routeSteps.length, setVoiceCurrentStepIndex, setHighlightedStepIndex])

  const handlePrevStep = useCallback(() => {
    if (voiceCurrentStepIndex > 0) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      const prevIdx = voiceCurrentStepIndex - 1
      setVoiceCurrentStepIndex(prevIdx)
      setHighlightedStepIndex(prevIdx)
    }
  }, [voiceCurrentStepIndex, setVoiceCurrentStepIndex, setHighlightedStepIndex])

  const handleMuteToggle = useCallback(() => {
    setIsMuted((prev) => {
      if (!prev && typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
      }
      return !prev
    })
  }, [])

  if (!voiceNavigationEnabled || routeSteps.length === 0) return null

  const currentStep = routeSteps[voiceCurrentStepIndex]
  if (!currentStep) return null

  const instruction = formatInstruction(currentStep)
  const isLastStep = voiceCurrentStepIndex === routeSteps.length - 1

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="absolute top-16 left-1/2 -translate-x-1/2 z-20 max-w-md w-[calc(100%-2rem)] sm:w-auto"
      >
        <div className="bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
          {/* Instruction banner */}
          <div className="px-4 py-3 flex items-center gap-3">
            {/* Voice indicator */}
            <div className="relative shrink-0">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isSpeaking ? 'bg-emerald-500' : 'bg-muted'}`}>
                {isMuted ? (
                  <VolumeX className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Volume2 className="h-5 w-5 text-white" />
                )}
              </div>
              {isSpeaking && !isMuted && (
                <div className="absolute -bottom-1 -right-1 flex items-end gap-0.5">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-emerald-400 rounded-full"
                      animate={{ height: [4, 8 + i * 2, 4] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Instruction text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
                <Navigation className="h-3 w-3" />
                <span>Step {voiceCurrentStepIndex + 1} of {routeSteps.length}</span>
                {isLastStep && (
                  <span className="text-emerald-500 font-medium ml-1">• Final step</span>
                )}
              </div>
              <p className="text-sm font-medium truncate">{instruction}</p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handlePrevStep}
                disabled={voiceCurrentStepIndex === 0}
                aria-label="Previous step"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleMuteToggle}
                aria-label={isMuted ? 'Unmute voice' : 'Mute voice'}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleNextStep}
                disabled={isLastStep}
                aria-label="Next step"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-muted">
            <motion.div
              className="h-full bg-emerald-500"
              animate={{ width: `${((voiceCurrentStepIndex + 1) / routeSteps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Next step preview */}
        {!isLastStep && routeSteps[voiceCurrentStepIndex + 1] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            className="bg-background/70 backdrop-blur-sm rounded-b-xl px-4 py-1.5 flex items-center gap-2 text-xs text-muted-foreground border border-t-0 border-border/30"
          >
            <ChevronRight className="h-3 w-3" />
            <span className="truncate">Next: {formatInstruction(routeSteps[voiceCurrentStepIndex + 1])}</span>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
