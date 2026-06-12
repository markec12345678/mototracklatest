'use client'

import { useState, useRef, useCallback } from 'react'
import { useMapStore, type AnimationKeyframe, type MapAnimation } from '@/lib/map-store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Film,
  Play,
  Pause,
  Square,
  Plus,
  Trash2,
  MapPin,
  RotateCcw,
  ChevronRight,
} from 'lucide-react'

const EASING_OPTIONS: AnimationKeyframe['easing'][] = ['linear', 'ease-in', 'ease-out', 'ease-in-out', 'fly']
const SPEED_OPTIONS = [0.5, 1, 1.5, 2, 3]

function generateId(): string {
  return `kf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function MapAnimationStudio() {
  const animationStudio = useMapStore((s) => s.animationStudio)
  const setAnimationStudio = useMapStore((s) => s.setAnimationStudio)
  const animationStudioOpen = useMapStore((s) => s.animationStudioOpen)
  const setAnimationStudioOpen = useMapStore((s) => s.setAnimationStudioOpen)

  const [editingName, setEditingName] = useState<string | null>(null)
  const [nameInput, setNameInput] = useState('')
  const playbackRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeAnimation = animationStudio.animations.find(
    (a) => a.id === animationStudio.activeAnimationId
  )

  const createAnimation = useCallback(() => {
    const newAnim: MapAnimation = {
      id: `anim-${Date.now()}`,
      name: `Animation ${animationStudio.animations.length + 1}`,
      keyframes: [],
      loop: false,
      speed: 1,
    }
    setAnimationStudio({
      animations: [...animationStudio.animations, newAnim],
      activeAnimationId: newAnim.id,
    })
  }, [animationStudio, setAnimationStudio])

  const deleteAnimation = useCallback(
    (id: string) => {
      const filtered = animationStudio.animations.filter((a) => a.id !== id)
      setAnimationStudio({
        animations: filtered,
        activeAnimationId:
          animationStudio.activeAnimationId === id
            ? filtered.length > 0
              ? filtered[0].id
              : null
            : animationStudio.activeAnimationId,
        isPlaying: false,
      })
    },
    [animationStudio, setAnimationStudio]
  )

  const captureKeyframe = useCallback(() => {
    if (typeof window === 'undefined' || !activeAnimation) return
    const map = (window as any).__mainMap
    if (!map) return

    const center = map.getCenter()
    const kf: AnimationKeyframe = {
      id: generateId(),
      longitude: parseFloat(center.lng.toFixed(6)),
      latitude: parseFloat(center.lat.toFixed(6)),
      zoom: parseFloat(map.getZoom().toFixed(2)),
      bearing: parseFloat(map.getBearing().toFixed(1)),
      pitch: parseFloat(map.getPitch().toFixed(1)),
      duration: 2000,
      easing: 'fly',
      label: `Keyframe ${activeAnimation.keyframes.length + 1}`,
    }

    const updatedAnims = animationStudio.animations.map((a) =>
      a.id === activeAnimation.id ? { ...a, keyframes: [...a.keyframes, kf] } : a
    )
    setAnimationStudio({ animations: updatedAnims })
  }, [activeAnimation, animationStudio.animations, setAnimationStudio])

  const removeKeyframe = useCallback(
    (kfId: string) => {
      if (!activeAnimation) return
      const updatedAnims = animationStudio.animations.map((a) =>
        a.id === activeAnimation.id
          ? { ...a, keyframes: a.keyframes.filter((k) => k.id !== kfId) }
          : a
      )
      setAnimationStudio({ animations: updatedAnims })
    },
    [activeAnimation, animationStudio.animations, setAnimationStudio]
  )

  const updateKeyframe = useCallback(
    (kfId: string, updates: Partial<AnimationKeyframe>) => {
      if (!activeAnimation) return
      const updatedAnims = animationStudio.animations.map((a) =>
        a.id === activeAnimation.id
          ? {
              ...a,
              keyframes: a.keyframes.map((k) => (k.id === kfId ? { ...k, ...updates } : k)),
            }
          : a
      )
      setAnimationStudio({ animations: updatedAnims })
    },
    [activeAnimation, animationStudio.animations, setAnimationStudio]
  )

  const updateActiveAnim = useCallback(
    (updates: Partial<MapAnimation>) => {
      if (!activeAnimation) return
      const updatedAnims = animationStudio.animations.map((a) =>
        a.id === activeAnimation.id ? { ...a, ...updates } : a
      )
      setAnimationStudio({ animations: updatedAnims })
    },
    [activeAnimation, animationStudio.animations, setAnimationStudio]
  )

  const flyToKeyframe = useCallback((kf: AnimationKeyframe) => {
    if (typeof window === 'undefined') return
    const map = (window as any).__mainMap
    if (!map) return
    map.flyTo({
      center: [kf.longitude, kf.latitude],
      zoom: kf.zoom,
      bearing: kf.bearing,
      pitch: kf.pitch,
      duration: kf.duration,
    })
  }, [])

  const stopPlayback = useCallback(() => {
    if (playbackRef.current) {
      clearTimeout(playbackRef.current)
      playbackRef.current = null
    }
    setAnimationStudio({ isPlaying: false, currentKeyframeIndex: 0 })
  }, [setAnimationStudio])

  const startPlayback = useCallback(() => {
    if (!activeAnimation || activeAnimation.keyframes.length === 0) return
    if (typeof window === 'undefined') return

    const map = (window as any).__mainMap
    if (!map) return

    setAnimationStudio({ isPlaying: true, currentKeyframeIndex: 0 })

    let idx = 0
    const playNext = () => {
      if (idx >= activeAnimation.keyframes.length) {
        if (activeAnimation.loop) {
          idx = 0
        } else {
          setAnimationStudio({ isPlaying: false, currentKeyframeIndex: 0 })
          return
        }
      }
      const kf = activeAnimation.keyframes[idx]
      const speed = animationStudio.playbackSpeed
      const duration = kf.duration / speed

      setAnimationStudio({ currentKeyframeIndex: idx })
      map.flyTo({
        center: [kf.longitude, kf.latitude],
        zoom: kf.zoom,
        bearing: kf.bearing,
        pitch: kf.pitch,
        duration,
      })

      idx++
      playbackRef.current = setTimeout(playNext, duration + 200)
    }

    playNext()
  }, [activeAnimation, animationStudio.playbackSpeed, setAnimationStudio])

  const togglePlayback = useCallback(() => {
    if (animationStudio.isPlaying) {
      stopPlayback()
    } else {
      startPlayback()
    }
  }, [animationStudio.isPlaying, stopPlayback, startPlayback])

  return (
    <Dialog open={animationStudioOpen} onOpenChange={setAnimationStudioOpen}>
      <DialogContent
        className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        aria-label="Animation Studio"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Film className="h-4 w-4 text-white" />
            </div>
            Animation Studio
          </DialogTitle>
          <DialogDescription>Create animated map flyovers with keyframes</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
          {/* Animation list */}
          <div className="flex items-center gap-2 flex-wrap">
            {animationStudio.animations.map((anim) => (
              <Badge
                key={anim.id}
                variant={anim.id === animationStudio.activeAnimationId ? 'default' : 'outline'}
                className={`cursor-pointer transition-all text-xs px-3 py-1 ${
                  anim.id === animationStudio.activeAnimationId
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0'
                    : 'hover:bg-emerald-500/10'
                }`}
                onClick={() => setAnimationStudio({ activeAnimationId: anim.id })}
              >
                {editingName === anim.id ? (
                  <Input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onBlur={() => {
                      const updatedAnims = animationStudio.animations.map((a) =>
                        a.id === anim.id && nameInput.trim() ? { ...a, name: nameInput.trim() } : a
                      )
                      setAnimationStudio({ animations: updatedAnims })
                      setEditingName(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const updatedAnims = animationStudio.animations.map((a) =>
                          a.id === anim.id && nameInput.trim()
                            ? { ...a, name: nameInput.trim() }
                            : a
                        )
                        setAnimationStudio({ animations: updatedAnims })
                        setEditingName(null)
                      }
                    }}
                    className="h-5 w-24 text-xs p-1"
                    autoFocus
                  />
                ) : (
                  <span
                    onDoubleClick={() => {
                      setEditingName(anim.id)
                      setNameInput(anim.name)
                    }}
                  >
                    {anim.name}
                  </span>
                )}
                <Trash2
                  className="h-3 w-3 ml-1 opacity-50 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteAnimation(anim.id)
                  }}
                />
              </Badge>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs border-dashed border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10"
              onClick={createAnimation}
            >
              <Plus className="h-3 w-3 mr-1" /> New
            </Button>
          </div>

          {activeAnimation && (
            <>
              {/* Playback controls */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border border-emerald-500/10">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full border-emerald-500/30"
                  onClick={togglePlayback}
                  disabled={activeAnimation.keyframes.length === 0}
                  aria-label={animationStudio.isPlaying ? 'Pause' : 'Play'}
                >
                  {animationStudio.isPlaying ? (
                    <Pause className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Play className="h-4 w-4 text-emerald-600" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full border-emerald-500/30"
                  onClick={stopPlayback}
                  aria-label="Stop"
                >
                  <Square className="h-3 w-3 text-emerald-600" />
                </Button>

                {/* Speed control */}
                <div className="flex items-center gap-1 ml-2">
                  <Label className="text-xs text-muted-foreground">Speed:</Label>
                  {SPEED_OPTIONS.map((spd) => (
                    <button
                      key={spd}
                      className={`text-[10px] px-2 py-0.5 rounded-full transition-all ${
                        animationStudio.playbackSpeed === spd
                          ? 'bg-emerald-500 text-white'
                          : 'bg-muted hover:bg-emerald-500/10 text-muted-foreground'
                      }`}
                      onClick={() => setAnimationStudio({ playbackSpeed: spd })}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                <div className="ml-auto flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Loop</Label>
                  <Switch
                    checked={activeAnimation.loop}
                    onCheckedChange={(checked) => updateActiveAnim({ loop: checked })}
                  />
                </div>
              </div>

              {/* Progress bar */}
              {activeAnimation.keyframes.length > 0 && (
                <div className="flex items-center gap-1">
                  {activeAnimation.keyframes.map((kf, i) => (
                    <div
                      key={kf.id}
                      className={`h-2 flex-1 rounded-full transition-all cursor-pointer ${
                        i === animationStudio.currentKeyframeIndex && animationStudio.isPlaying
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                          : i < animationStudio.currentKeyframeIndex && animationStudio.isPlaying
                            ? 'bg-emerald-500/40'
                            : 'bg-muted'
                      }`}
                      onClick={() => flyToKeyframe(kf)}
                      title={kf.label}
                    />
                  ))}
                </div>
              )}

              {/* Add keyframe button */}
              <Button
                variant="outline"
                className="w-full border-dashed border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                onClick={captureKeyframe}
              >
                <MapPin className="h-4 w-4 mr-2" /> Capture Current Position as Keyframe
              </Button>

              {/* Keyframe timeline */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {activeAnimation.keyframes.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No keyframes yet. Capture your map position to add one.
                  </p>
                )}
                {activeAnimation.keyframes.map((kf, i) => (
                  <div
                    key={kf.id}
                    className="flex items-start gap-2 p-2.5 rounded-lg border border-border/50 bg-card hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                        {i + 1}
                      </div>
                      {i < activeAnimation.keyframes.length - 1 && (
                        <ChevronRight className="h-3 w-3 text-muted-foreground rotate-90" />
                      )}
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-2 min-w-0">
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Label</Label>
                        <Input
                          value={kf.label}
                          onChange={(e) => updateKeyframe(kf.id, { label: e.target.value })}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Lng, Lat</Label>
                        <div className="text-xs font-mono mt-1">
                          {kf.longitude}, {kf.latitude}
                        </div>
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Zoom</Label>
                        <Input
                          type="number"
                          value={kf.zoom}
                          onChange={(e) =>
                            updateKeyframe(kf.id, { zoom: parseFloat(e.target.value) || 0 })
                          }
                          className="h-7 text-xs"
                          step={0.5}
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Duration (ms)</Label>
                        <Input
                          type="number"
                          value={kf.duration}
                          onChange={(e) =>
                            updateKeyframe(kf.id, {
                              duration: parseInt(e.target.value) || 1000,
                            })
                          }
                          className="h-7 text-xs"
                          step={500}
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Easing</Label>
                        <Select
                          value={kf.easing}
                          onValueChange={(val) =>
                            updateKeyframe(kf.id, {
                              easing: val as AnimationKeyframe['easing'],
                            })
                          }
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {EASING_OPTIONS.map((e) => (
                              <SelectItem key={e} value={e}>
                                {e}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Bearing / Pitch</Label>
                        <div className="flex gap-1">
                          <Input
                            type="number"
                            value={kf.bearing}
                            onChange={(e) =>
                              updateKeyframe(kf.id, {
                                bearing: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="h-7 text-xs w-1/2"
                            step={10}
                          />
                          <Input
                            type="number"
                            value={kf.pitch}
                            onChange={(e) =>
                              updateKeyframe(kf.id, {
                                pitch: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="h-7 text-xs w-1/2"
                            step={5}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => flyToKeyframe(kf)}
                        aria-label="Fly to keyframe"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => removeKeyframe(kf.id)}
                        aria-label="Delete keyframe"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!activeAnimation && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Film className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Create an animation to get started</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
