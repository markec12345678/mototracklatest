'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMapStore, MAP_STYLES } from '@/lib/map-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  MessageCircle,
  Send,
  X,
  Trash2,
  Sparkles,
} from 'lucide-react'

const QUICK_ACTIONS = [
  { label: '🔍 Find nearby', command: 'What\'s nearby?' },
  { label: '🧭 Navigate', command: 'Navigate to ' },
  { label: '📏 Measure', command: 'Measure distance from ' },
  { label: '🌤️ Weather', command: 'Show weather' },
  { label: '📍 Add pin', command: 'Add pin at current location' },
  { label: '🗺️ Satellite', command: 'Switch to satellite view' },
  { label: '📐 Elevation', command: 'Show elevation profile' },
  { label: '🚗 Route', command: 'Route from ' },
]

function executeCommand(command: string) {
  const map = (window as any).__mainMap
  const store = useMapStore.getState()

  if (command.startsWith('navigate:')) {
    const location = command.slice(9)
    if (location) {
      window.dispatchEvent(new CustomEvent('map-search-query', { detail: location }))
    }
  } else if (command.startsWith('search-poi:')) {
    const category = command.slice(11)
    if (category) {
      store.setToolMode('navigate')
      window.dispatchEvent(new CustomEvent('map-poi-search', { detail: category }))
    }
  } else if (command.startsWith('measure:')) {
    store.setToolMode('measure')
  } else if (command === 'weather:show') {
    store.setWeatherEnabled(true)
  } else if (command === 'add-pin:current') {
    const center = store.center
    store.addMarker({
      id: `pin-${Date.now()}`,
      longitude: center[0],
      latitude: center[1],
      name: 'Dropped Pin',
      color: '#ef4444',
      category: 'pin',
    })
  } else if (command.startsWith('style:')) {
    const styleName = command.slice(6)
    const style = MAP_STYLES.find((s) => s.id === styleName || s.name.toLowerCase() === styleName)
    if (style) {
      store.setCurrentStyle(style)
    }
  } else if (command.startsWith('route:')) {
    store.setToolMode('directions')
  } else if (command === 'zoom:in') {
    if (map) {
      map.zoomIn({ duration: 300 })
      store.setZoom(map.getZoom())
    }
  } else if (command === 'zoom:out') {
    if (map) {
      map.zoomOut({ duration: 300 })
      store.setZoom(map.getZoom())
    }
  } else if (command === 'elevation:show') {
    const routes = store.routes
    if (routes.length > 0) {
      store.setElevationRouteId(routes[0].id)
    }
  } else if (command === 'nearby:show') {
    window.dispatchEvent(new CustomEvent('map-poi-search', { detail: 'restaurant' }))
  }
}

export function MapChatAssistant() {
  const chatOpen = useMapStore((s) => s.chatOpen)
  const setChatOpen = useMapStore((s) => s.setChatOpen)
  const chatMessages = useMapStore((s) => s.chatMessages)
  const addChatMessage = useMapStore((s) => s.addChatMessage)
  const clearChatMessages = useMapStore((s) => s.clearChatMessages)
  const center = useMapStore((s) => s.center)
  const zoom = useMapStore((s) => s.zoom)
  const currentStyle = useMapStore((s) => s.currentStyle)
  const savedLocations = useMapStore((s) => s.savedLocations)

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatMessages])

  // Focus input when chat opens
  useEffect(() => {
    if (chatOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }
  }, [chatOpen])

  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading) return

    const text = messageText.trim()
    setInput('')

    // Add user message
    addChatMessage({ role: 'user', content: text })

    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: {
            center: center,
            zoom: zoom,
            style: currentStyle.id,
            locationCount: savedLocations.length,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      addChatMessage({
        role: 'assistant',
        content: data.response || 'I couldn\'t process that request. Please try again.',
        actions: data.actions,
      })
    } catch {
      addChatMessage({
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, center, zoom, currentStyle.id, savedLocations.length, addChatMessage])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }, [input, sendMessage])

  const handleQuickAction = useCallback((command: string) => {
    sendMessage(command)
  }, [sendMessage])

  const handleActionClick = useCallback((command: string) => {
    executeCommand(command)
  }, [])

  return (
    <>
      {/* Toggle button */}
      <motion.div
        className="fixed bottom-20 right-3 sm:bottom-24 sm:right-5 z-30"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => setChatOpen(!chatOpen)}
          className={cn(
            'h-12 w-12 rounded-full shadow-lg transition-all duration-200',
            chatOpen
              ? 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white'
          )}
          aria-label={chatOpen ? 'Close chat assistant' : 'Open chat assistant'}
        >
          {chatOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        </Button>
        {!chatOpen && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
        )}
      </motion.div>

      {/* Chat panel */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-36 right-3 sm:bottom-40 sm:right-5 z-30 w-[calc(100vw-24px)] sm:w-96 max-h-[70vh] flex flex-col bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Map Assistant</h3>
                  <p className="text-[10px] text-muted-foreground">AI-powered map queries</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                  onClick={clearChatMessages}
                  title="Clear chat history"
                  aria-label="Clear chat history"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                  onClick={() => setChatOpen(false)}
                  title="Close chat"
                  aria-label="Close chat"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Messages area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0"
              style={{ maxHeight: 'calc(70vh - 140px)' }}
            >
              {chatMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-3">
                    <MessageCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                  <p className="text-sm font-medium mb-1">How can I help you?</p>
                  <p className="text-xs text-muted-foreground mb-4">Ask me about navigation, nearby places, or map features</p>

                  {/* Quick action chips */}
                  <div className="flex flex-wrap gap-1.5 justify-center max-w-xs">
                    {QUICK_ACTIONS.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => handleQuickAction(action.command)}
                        className="text-[10px] px-2.5 py-1 rounded-full border border-border/50 bg-background/80 hover:bg-accent/50 transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex flex-col gap-1',
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-br-md'
                        : 'bg-muted/80 text-foreground rounded-bl-md'
                    )}
                  >
                    {msg.content}
                  </div>

                  {/* Action buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {msg.actions.map((action, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="text-[10px] px-2 py-0.5 cursor-pointer hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-colors"
                          onClick={() => handleActionClick(action.command)}
                        >
                          {action.label}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <span className="text-[9px] text-muted-foreground/60 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="bg-muted/80 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick actions when chat has messages */}
            {chatMessages.length > 0 && (
              <div className="px-3 py-2 border-t border-border/30">
                <div className="flex gap-1 overflow-x-auto pb-1">
                  {QUICK_ACTIONS.slice(0, 4).map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action.command)}
                      className="text-[9px] px-2 py-0.5 rounded-full border border-border/40 bg-background/80 hover:bg-accent/50 transition-colors whitespace-nowrap shrink-0"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input area */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-2.5 border-t border-border/50">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about the map..."
                className="h-9 text-sm rounded-xl border-border/50 bg-muted/30 focus-visible:ring-emerald-500/30"
                disabled={isLoading}
                aria-label="Chat message input"
              />
              <Button
                type="submit"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0"
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}
