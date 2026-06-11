/**
 * Generic Undo/Redo Manager using the Command Pattern.
 *
 * Each action stores an inverse operation so it can be reversed and re-applied.
 * The manager maintains separate undo and redo stacks with a configurable max
 * history size.
 */

/** A single undoable action following the Command Pattern */
export interface UndoAction {
  /** Category of the action (e.g. "marker", "measure", "route") */
  type: string
  /** Human-readable description shown in tooltips / UI */
  description: string
  /** Function that reverses the action */
  undo: () => void
  /** Function that re-applies the action after it was undone */
  redo: () => void
}

const MAX_HISTORY = 50

type ChangeListener = () => void

export class UndoManager {
  private undoStack: UndoAction[] = []
  private redoStack: UndoAction[] = []
  private listeners: Set<ChangeListener> = new Set()
  private _isExecuting = false

  /** Whether we are currently executing an undo/redo (to prevent recursive pushes) */
  get isExecuting(): boolean {
    return this._isExecuting
  }

  /** Current undo stack (read-only snapshot) */
  get undoActions(): UndoAction[] {
    return [...this.undoStack]
  }

  /** Current redo stack (read-only snapshot) */
  get redoActions(): UndoAction[] {
    return [...this.redoStack]
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0
  }

  /** Subscribe to stack changes. Returns an unsubscribe function. */
  subscribe(listener: ChangeListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private emitChange() {
    this.listeners.forEach((fn) => fn())
  }

  /**
   * Push a new action onto the undo stack.
   * The action's `do()` is NOT called here — the caller is expected to have
   * already performed the action before pushing.
   * Clears the redo stack (standard behaviour: a new action invalidates redo history).
   */
  pushAction(action: UndoAction): void {
    // Don't record actions while executing undo/redo
    if (this._isExecuting) return

    this.undoStack.push(action)

    // Enforce max history size
    if (this.undoStack.length > MAX_HISTORY) {
      this.undoStack.shift()
    }

    // New action invalidates redo history
    this.redoStack = []

    this.emitChange()
  }

  /** Undo the most recent action. Returns the undone action or null. */
  undo(): UndoAction | null {
    const action = this.undoStack.pop()
    if (!action) return null

    this._isExecuting = true
    try {
      action.undo()
    } finally {
      this._isExecuting = false
    }

    this.redoStack.push(action)
    this.emitChange()
    return action
  }

  /** Redo the most recently undone action. Returns the redone action or null. */
  redo(): UndoAction | null {
    const action = this.redoStack.pop()
    if (!action) return null

    this._isExecuting = true
    try {
      action.redo()
    } finally {
      this._isExecuting = false
    }

    this.undoStack.push(action)
    this.emitChange()
    return action
  }

  /** Clear both stacks. */
  clear(): void {
    this.undoStack = []
    this.redoStack = []
    this.emitChange()
  }
}

/** Singleton manager instance used by the Zustand store */
export const undoManager = new UndoManager()
