'use client'

import { useState, useCallback } from 'react'
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
import {
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Tag,
} from 'lucide-react'
import { useMapStore, type MarkerCategory } from '@/lib/map-store'
import { toast } from 'sonner'

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#10b981',
  '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899',
  '#6b7280', '#1f2937',
]

const PRESET_EMOJIS = [
  '📌', '⭐', '🍽️', '🏨', '🌳', '🛍️', '⛽', '🏥', '🏫', '🎭',
  '🍺', '☕', '🚌', '✈️', '🚂', '🏟️', '🏛️', '🏖️', '⛰️', '🗻',
  '🎡', '🎠', '🎪', '🎬', '📸', '🎯', '🎮', '🎵', '🎨', '📚',
]

interface MarkerCategoriesManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MarkerCategoriesManager({ open, onOpenChange }: MarkerCategoriesManagerProps) {
  const markerCategories = useMapStore((s) => s.markerCategories)
  const addMarkerCategory = useMapStore((s) => s.addMarkerCategory)
  const updateMarkerCategory = useMapStore((s) => s.updateMarkerCategory)
  const deleteMarkerCategory = useMapStore((s) => s.deleteMarkerCategory)

  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('📌')
  const [newColor, setNewColor] = useState('#10b981')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmoji, setEditEmoji] = useState('')
  const [editColor, setEditColor] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const handleAdd = useCallback(() => {
    const name = newName.trim()
    if (!name) {
      toast.error('Please enter a category name')
      return
    }
    if (markerCategories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      toast.error('Category already exists')
      return
    }
    addMarkerCategory({ name, emoji: newEmoji, color: newColor, icon: 'MapPin' })
    setNewName('')
    setNewEmoji('📌')
    setNewColor('#10b981')
    toast.success(`Category "${name}" added`)
  }, [newName, newEmoji, newColor, markerCategories, addMarkerCategory])

  const handleStartEdit = useCallback((category: MarkerCategory) => {
    if (category.isDefault) {
      toast.info('Default categories can only be renamed or recolored')
    }
    setEditingId(category.id)
    setEditName(category.name)
    setEditEmoji(category.emoji)
    setEditColor(category.color)
  }, [])

  const handleSaveEdit = useCallback(() => {
    if (!editingId) return
    const name = editName.trim()
    if (!name) {
      toast.error('Category name cannot be empty')
      return
    }
    updateMarkerCategory(editingId, { name, emoji: editEmoji, color: editColor })
    setEditingId(null)
    toast.success('Category updated')
  }, [editingId, editName, editEmoji, editColor, updateMarkerCategory])

  const handleDelete = useCallback((category: MarkerCategory) => {
    if (category.isDefault) {
      toast.error('Cannot delete default categories')
      return
    }
    deleteMarkerCategory(category.id)
    toast.success(`Category "${category.name}" deleted`)
  }, [deleteMarkerCategory])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-emerald-600" />
            Marker Categories
          </DialogTitle>
          <DialogDescription>
            Manage custom categories for your map markers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add new category */}
          <div className="rounded-xl border bg-muted/30 p-3 space-y-3">
            <Label className="text-xs font-medium text-muted-foreground">Add New Category</Label>
            <div className="flex items-center gap-2">
              <button
                className="h-9 w-9 rounded-lg border flex items-center justify-center text-lg hover:bg-accent/50 transition-colors shrink-0"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                title="Choose emoji"
              >
                {newEmoji}
              </button>
              <Input
                placeholder="Category name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="h-9 text-sm flex-1"
              />
              <Button
                size="sm"
                className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                onClick={handleAdd}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {/* Color picker */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${newColor === color ? 'border-foreground scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewColor(color)}
                  aria-label={`Select color ${color}`}
                />
              ))}
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-6 h-6 rounded-full border cursor-pointer"
                title="Custom color"
              />
            </div>
            {/* Emoji picker */}
            {showEmojiPicker && (
              <div className="flex flex-wrap gap-1 p-2 rounded-lg border bg-background">
                {PRESET_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    className={`w-8 h-8 rounded flex items-center justify-center text-lg hover:bg-accent/50 transition-colors ${newEmoji === emoji ? 'bg-accent ring-1 ring-emerald-500' : ''}`}
                    onClick={() => {
                      setNewEmoji(emoji)
                      setShowEmojiPicker(false)
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Categories list */}
          <div className="space-y-1.5">
            {markerCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-2 rounded-lg border p-2.5 hover:bg-accent/30 transition-colors"
              >
                {editingId === category.id ? (
                  <>
                    <button
                      className="h-7 w-7 rounded flex items-center justify-center text-sm shrink-0"
                      onClick={() => setShowEmojiPicker(true)}
                    >
                      {editEmoji}
                    </button>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                      className="h-7 text-sm flex-1"
                      autoFocus
                    />
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700"
                        onClick={handleSaveEdit}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-muted-foreground"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-sm shrink-0"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      {category.emoji}
                    </div>
                    <span className="text-sm font-medium flex-1">{category.name}</span>
                    <Badge
                      variant="outline"
                      className="text-[10px] h-5 shrink-0"
                      style={{ borderColor: category.color, color: category.color }}
                    >
                      <span
                        className="w-2 h-2 rounded-full mr-1"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.isDefault ? 'Default' : 'Custom'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => handleStartEdit(category)}
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                    {!category.isDefault && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleDelete(category)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Info */}
          <p className="text-xs text-muted-foreground text-center">
            {markerCategories.length} categories ({markerCategories.filter((c) => c.isDefault).length} default, {markerCategories.filter((c) => !c.isDefault).length} custom)
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
