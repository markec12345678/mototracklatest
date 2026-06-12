'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Copy, LogOut, X, Link2, UserPlus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useCollaborationStore } from '@/lib/collaboration-store'
import { toast } from 'sonner'

export function CollaborationPanel() {
  const {
    sessionCode,
    isHost,
    collaborators,
    isCollaborating,
    createSession,
    joinSession,
    leaveSession,
  } = useCollaborationStore()

  const [joinCode, setJoinCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const handleCreateSession = useCallback(() => {
    createSession()
    toast.success('Collaboration session started!')
  }, [createSession])

  const handleJoinSession = useCallback(() => {
    if (joinCode.trim().length === 6) {
      joinSession(joinCode.trim())
      setJoinCode('')
      toast.success('Joined collaboration session!')
    } else {
      toast.error('Please enter a valid 6-character session code')
    }
  }, [joinCode, joinSession])

  const handleLeaveSession = useCallback(() => {
    leaveSession()
    setOpen(false)
    toast.info('Left collaboration session')
  }, [leaveSession])

  const handleCopyCode = useCallback(async () => {
    if (!sessionCode) return
    try {
      await navigator.clipboard.writeText(sessionCode)
      setCopied(true)
      toast.success('Session code copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }, [sessionCode])

  const handleCopyShareLink = useCallback(async () => {
    if (!sessionCode) return
    try {
      const url = `${window.location.origin}${window.location.pathname}?collab=${sessionCode}`
      await navigator.clipboard.writeText(url)
      toast.success('Share link copied!')
    } catch {
      toast.error('Failed to copy link')
    }
  }, [sessionCode])

  const onlineCount = collaborators.filter((c) => c.isOnline).length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 relative ${
            isCollaborating
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-600 dark:text-emerald-400'
              : 'map-control-glass'
          }`}
          aria-label="Collaboration"
        >
          <Users className="h-4 w-4" />
          {isCollaborating && (
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-background" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-500" />
            Collaborative Map Sharing
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {!isCollaborating ? (
            <>
              {/* Start Session */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Start a New Session</h4>
                <p className="text-xs text-muted-foreground">
                  Create a session and share the code with others to collaborate in real-time on this map.
                </p>
                <Button
                  onClick={handleCreateSession}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Start Session
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>

              {/* Join Session */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Join an Existing Session</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter 6-char code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleJoinSession()
                    }}
                    maxLength={6}
                    className="flex-1 font-mono text-center tracking-widest uppercase"
                  />
                  <Button
                    onClick={handleJoinSession}
                    disabled={joinCode.length !== 6}
                    variant="outline"
                  >
                    Join
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Active Session */}
              <div className="space-y-4">
                {/* Session Code */}
                <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      {isHost ? 'Your Session Code' : 'Session Code'}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {isHost ? 'Host' : 'Guest'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-2xl font-mono font-bold tracking-[0.3em] text-center py-2 bg-background rounded-lg border">
                      {sessionCode}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0 h-10 w-10"
                      onClick={handleCopyCode}
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={handleCopyShareLink}
                  >
                    <Link2 className="h-3 w-3 mr-1" />
                    Copy Share Link
                  </Button>
                </div>

                {/* Collaborators List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Collaborators ({onlineCount} online)
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {collaborators.map((collaborator) => (
                      <div
                        key={collaborator.id}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-background border border-border/50"
                      >
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ backgroundColor: collaborator.color }}
                        >
                          {collaborator.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{collaborator.name}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {collaborator.isOnline ? 'Online' : `Last seen ${new Date(collaborator.lastSeen).toLocaleTimeString()}`}
                          </div>
                        </div>
                        <div className={`h-2 w-2 rounded-full shrink-0 ${collaborator.isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Leave Session */}
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={handleLeaveSession}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Leave Session
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
