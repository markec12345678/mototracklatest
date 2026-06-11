'use client'

import { create } from 'zustand'
import { undoManager, type UndoAction } from '@/lib/undo-manager'

interface UndoState {
  /** Snapshot of the undo stack (updated via subscription) */
  undoStack: UndoAction[]
  /** Snapshot of the redo stack (updated via subscription) */
  redoStack: UndoAction[]
  /** Whether undo is currently possible */
  canUndo: boolean
  /** Whether redo is currently possible */
  canRedo: boolean

  /** Push an action onto the undo stack (call AFTER performing the action) */
  pushAction: (action: UndoAction) => void
  /** Undo the last action */
  undo: () => void
  /** Redo the last undone action */
  redo: () => void
  /** Clear all undo/redo history */
  clearHistory: () => void
  /** Sync local state from the manager (called on every change) */
  _sync: () => void
}

export const useUndoStore = create<UndoState>()((set, get) => {
  // Subscribe to the manager so we can re-sync on every change
  if (typeof window !== 'undefined') {
    undoManager.subscribe(() => {
      get()._sync()
    })
  }

  return {
    undoStack: [],
    redoStack: [],
    canUndo: false,
    canRedo: false,

    pushAction: (action) => {
      undoManager.pushAction(action)
      // _sync is called automatically via the subscription
    },

    undo: () => {
      const action = undoManager.undo()
      if (action) {
        // _sync is called automatically via the subscription
      }
    },

    redo: () => {
      const action = undoManager.redo()
      if (action) {
        // _sync is called automatically via the subscription
      }
    },

    clearHistory: () => {
      undoManager.clear()
    },

    _sync: () => {
      set({
        undoStack: undoManager.undoActions,
        redoStack: undoManager.redoActions,
        canUndo: undoManager.canUndo,
        canRedo: undoManager.canRedo,
      })
    },
  }
})
