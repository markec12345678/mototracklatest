import { create } from 'zustand'

export interface Collaborator {
  id: string
  name: string
  color: string
  cursor?: { lng: number; lat: number }
  isOnline: boolean
  lastSeen: number
}

const COLLABORATOR_COLORS = [
  '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1',
]

function generateSessionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

function generateUserId(): string {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function getRandomColor(): string {
  return COLLABORATOR_COLORS[Math.floor(Math.random() * COLLABORATOR_COLORS.length)]
}

const ADJECTIVES = ['Swift', 'Bold', 'Calm', 'Bright', 'Keen', 'Wise', 'Noble', 'Quick']
const NOUNS = ['Panda', 'Eagle', 'Tiger', 'Wolf', 'Hawk', 'Bear', 'Fox', 'Lynx']

function generateUserName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  return `${adj}${noun}`
}

interface CollaborationState {
  sessionCode: string | null
  isHost: boolean
  collaborators: Collaborator[]
  isCollaborating: boolean
  userId: string
  userName: string
  userColor: string

  createSession: () => void
  joinSession: (code: string) => void
  leaveSession: () => void
  updateCursor: (lng: number, lat: number) => void
  addCollaborator: (collaborator: Collaborator) => void
  removeCollaborator: (id: string) => void
}

export const useCollaborationStore = create<CollaborationState>()((set, get) => ({
  sessionCode: null,
  isHost: false,
  collaborators: [],
  isCollaborating: false,
  userId: generateUserId(),
  userName: generateUserName(),
  userColor: getRandomColor(),

  createSession: () => {
    const code = generateSessionCode()
    const { userId, userName, userColor } = get()
    set({
      sessionCode: code,
      isHost: true,
      isCollaborating: true,
      collaborators: [
        {
          id: userId,
          name: userName,
          color: userColor,
          isOnline: true,
          lastSeen: Date.now(),
        },
      ],
    })
  },

  joinSession: (code: string) => {
    const { userId, userName, userColor } = get()
    set({
      sessionCode: code.toUpperCase(),
      isHost: false,
      isCollaborating: true,
      collaborators: [
        {
          id: userId,
          name: userName,
          color: userColor,
          isOnline: true,
          lastSeen: Date.now(),
        },
      ],
    })
  },

  leaveSession: () => {
    set({
      sessionCode: null,
      isHost: false,
      isCollaborating: false,
      collaborators: [],
    })
  },

  updateCursor: (lng: number, lat: number) => {
    const { userId } = get()
    set((state) => ({
      collaborators: state.collaborators.map((c) =>
        c.id === userId
          ? { ...c, cursor: { lng, lat }, lastSeen: Date.now() }
          : c
      ),
    }))
  },

  addCollaborator: (collaborator: Collaborator) => {
    set((state) => {
      if (state.collaborators.find((c) => c.id === collaborator.id)) {
        return state
      }
      return { collaborators: [...state.collaborators, collaborator] }
    })
  },

  removeCollaborator: (id: string) => {
    set((state) => ({
      collaborators: state.collaborators.filter((c) => c.id !== id),
    }))
  },
}))
