'use client'

import { useState, useCallback } from 'react'
import { useMapStore, type SurveyForm, type SurveyField, type SurveyResponse } from '@/lib/map-store'
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
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ClipboardList,
  Plus,
  Trash2,
  MapPin,
  Download,
  ArrowUp,
  ArrowDown,
  Star,
  FileText,
  Hash,
  CheckSquare,
  Camera,
  Calendar,
  List,
  GripVertical,
  ClipboardCheck,
} from 'lucide-react'

type FieldType = SurveyField['type']

const FIELD_TYPE_CONFIG: Record<FieldType, { icon: React.ReactNode; label: string }> = {
  text: { icon: <FileText className="h-3 w-3" />, label: 'Text' },
  number: { icon: <Hash className="h-3 w-3" />, label: 'Number' },
  select: { icon: <List className="h-3 w-3" />, label: 'Select' },
  checkbox: { icon: <CheckSquare className="h-3 w-3" />, label: 'Checkbox' },
  photo: { icon: <Camera className="h-3 w-3" />, label: 'Photo' },
  date: { icon: <Calendar className="h-3 w-3" />, label: 'Date' },
  rating: { icon: <Star className="h-3 w-3" />, label: 'Rating' },
}

const TEMPLATES: { name: string; description: string; color: string; icon: string; fields: Omit<SurveyField, 'id'>[] }[] = [
  {
    name: 'Quick Inspection',
    description: 'Fast field inspection checklist',
    color: '#f59e0b',
    icon: 'clipboard-check',
    fields: [
      { label: 'Condition', type: 'select', options: ['Good', 'Fair', 'Poor', 'Critical'], required: true, defaultValue: '' },
      { label: 'Notes', type: 'text', required: false, defaultValue: '' },
      { label: 'Photo', type: 'photo', required: false, defaultValue: '' },
      { label: 'Urgency', type: 'rating', required: false, defaultValue: '3' },
    ],
  },
  {
    name: 'Environmental Survey',
    description: 'Environmental data collection',
    color: '#10b981',
    icon: 'trees',
    fields: [
      { label: 'Temperature (°C)', type: 'number', required: true, defaultValue: '' },
      { label: 'Humidity (%)', type: 'number', required: true, defaultValue: '' },
      { label: 'Vegetation Type', type: 'select', options: ['Forest', 'Grassland', 'Wetland', 'Desert', 'Urban'], required: true, defaultValue: '' },
      { label: 'Water Present', type: 'checkbox', required: false, defaultValue: 'false' },
      { label: 'Observations', type: 'text', required: false, defaultValue: '' },
      { label: 'Date', type: 'date', required: true, defaultValue: '' },
    ],
  },
  {
    name: 'Infrastructure Assessment',
    description: 'Road & building assessment',
    color: '#ef4444',
    icon: 'building',
    fields: [
      { label: 'Structure Type', type: 'select', options: ['Road', 'Bridge', 'Building', 'Utility', 'Other'], required: true, defaultValue: '' },
      { label: 'Damage Level', type: 'rating', required: true, defaultValue: '1' },
      { label: 'Accessible', type: 'checkbox', required: true, defaultValue: 'true' },
      { label: 'Repair Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'], required: true, defaultValue: '' },
      { label: 'Estimated Cost', type: 'number', required: false, defaultValue: '' },
      { label: 'Photo', type: 'photo', required: false, defaultValue: '' },
    ],
  },
]

const FORM_COLORS = ['#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316']

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function FieldSurveyTool() {
  const fieldSurvey = useMapStore((s) => s.fieldSurvey)
  const setFieldSurvey = useMapStore((s) => s.setFieldSurvey)

  const [newFieldName, setNewFieldName] = useState('')
  const [newFieldType, setNewFieldType] = useState<FieldType>('text')
  const [newFieldOptions, setNewFieldOptions] = useState('')
  const [newFieldRequired, setNewFieldRequired] = useState(false)
  const [collectValues, setCollectValues] = useState<Record<string, string>>({})

  const activeForm = fieldSurvey.forms.find((f) => f.id === fieldSurvey.activeFormId)

  const createForm = useCallback(
    (template?: typeof TEMPLATES[0]) => {
      const form: SurveyForm = {
        id: `form-${generateId()}`,
        name: template?.name ?? `Survey ${fieldSurvey.forms.length + 1}`,
        description: template?.description ?? '',
        color: template?.color ?? FORM_COLORS[fieldSurvey.forms.length % FORM_COLORS.length],
        icon: template?.icon ?? 'clipboard',
        fields: template
          ? template.fields.map((f) => ({ ...f, id: `field-${generateId()}` }))
          : [],
      }
      setFieldSurvey({
        forms: [...fieldSurvey.forms, form],
        activeFormId: form.id,
      })
    },
    [fieldSurvey, setFieldSurvey]
  )

  const deleteForm = useCallback(
    (id: string) => {
      const filtered = fieldSurvey.forms.filter((f) => f.id !== id)
      setFieldSurvey({
        forms: filtered,
        activeFormId:
          fieldSurvey.activeFormId === id
            ? filtered.length > 0
              ? filtered[0].id
              : null
            : fieldSurvey.activeFormId,
      })
    },
    [fieldSurvey, setFieldSurvey]
  )

  const addField = useCallback(() => {
    if (!activeForm || !newFieldName.trim()) return
    const field: SurveyField = {
      id: `field-${generateId()}`,
      label: newFieldName.trim(),
      type: newFieldType,
      options: newFieldType === 'select' ? newFieldOptions.split(',').map((o) => o.trim()).filter(Boolean) : undefined,
      required: newFieldRequired,
      defaultValue: '',
    }
    const updatedForms = fieldSurvey.forms.map((f) =>
      f.id === activeForm.id ? { ...f, fields: [...f.fields, field] } : f
    )
    setFieldSurvey({ forms: updatedForms })
    setNewFieldName('')
    setNewFieldOptions('')
    setNewFieldRequired(false)
  }, [activeForm, newFieldName, newFieldType, newFieldOptions, newFieldRequired, fieldSurvey.forms, setFieldSurvey])

  const removeField = useCallback(
    (fieldId: string) => {
      if (!activeForm) return
      const updatedForms = fieldSurvey.forms.map((f) =>
        f.id === activeForm.id
          ? { ...f, fields: f.fields.filter((fld) => fld.id !== fieldId) }
          : f
      )
      setFieldSurvey({ forms: updatedForms })
    },
    [activeForm, fieldSurvey.forms, setFieldSurvey]
  )

  const moveField = useCallback(
    (fieldId: string, direction: 'up' | 'down') => {
      if (!activeForm) return
      const fields = [...activeForm.fields]
      const idx = fields.findIndex((f) => f.id === fieldId)
      if (idx === -1) return
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= fields.length) return
      ;[fields[idx], fields[swapIdx]] = [fields[swapIdx], fields[idx]]
      const updatedForms = fieldSurvey.forms.map((f) =>
        f.id === activeForm.id ? { ...f, fields } : f
      )
      setFieldSurvey({ forms: updatedForms })
    },
    [activeForm, fieldSurvey.forms, setFieldSurvey]
  )

  const startCollect = useCallback(() => {
    if (!activeForm) return
    setFieldSurvey({ collectMode: true })
    if (typeof window === 'undefined') return
    const map = (window as any).__mainMap
    if (!map) return

    const clickHandler = (e: any) => {
      const { lng, lat } = e.lngLat
      const response: SurveyResponse = {
        id: `resp-${generateId()}`,
        formId: activeForm.id,
        latitude: lat,
        longitude: lng,
        values: { ...collectValues },
        timestamp: Date.now(),
      }
      setFieldSurvey({
        responses: [...useMapStore.getState().fieldSurvey.responses, response],
        collectMode: false,
      })
      map.off('click', clickHandler)
    }
    map.once('click', clickHandler)
  }, [activeForm, collectValues, setFieldSurvey])

  const exportCSV = useCallback(() => {
    if (fieldSurvey.responses.length === 0) return
    const formIds = [...new Set(fieldSurvey.responses.map((r) => r.formId))]
    const allFields = formIds.flatMap((fid) => {
      const form = fieldSurvey.forms.find((f) => f.id === fid)
      return form ? form.fields : []
    })
    const uniqueLabels = [...new Set(allFields.map((f) => f.label))]

    const headers = ['id', 'formId', 'latitude', 'longitude', 'timestamp', ...uniqueLabels]
    const rows = fieldSurvey.responses.map((r) => {
      const row = [r.id, r.formId, r.latitude.toString(), r.longitude.toString(), new Date(r.timestamp).toISOString()]
      uniqueLabels.forEach((label) => {
        row.push(r.values[label] ?? '')
      })
      return row.join(',')
    })

    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `survey-responses-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [fieldSurvey.responses, fieldSurvey.forms])

  return (
    <Dialog
      open={fieldSurvey.open}
      onOpenChange={(open) => setFieldSurvey({ open })}
    >
      <DialogContent
        className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        aria-label="Field Survey Tool"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <ClipboardList className="h-4 w-4 text-white" />
            </div>
            Field Survey Tool
          </DialogTitle>
          <DialogDescription>Create forms and collect field survey data</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="forms" className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full">
            <TabsTrigger value="forms" className="flex-1">Forms</TabsTrigger>
            <TabsTrigger value="collect" className="flex-1">Collect</TabsTrigger>
            <TabsTrigger value="responses" className="flex-1">Responses</TabsTrigger>
          </TabsList>

          <TabsContent value="forms" className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Template buttons */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Quick Start Templates</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.name}
                    className="p-2.5 rounded-xl border border-border/50 hover:bg-accent/30 transition-all text-left"
                    onClick={() => createForm(tpl)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="h-5 w-5 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: tpl.color + '20', color: tpl.color }}
                      >
                        <ClipboardCheck className="h-3 w-3" />
                      </div>
                      <span className="text-xs font-medium">{tpl.name}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{tpl.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full border-dashed border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
              onClick={() => createForm()}
            >
              <Plus className="h-4 w-4 mr-2" /> Create Blank Form
            </Button>

            {/* Form list */}
            <div className="space-y-2">
              {fieldSurvey.forms.map((form) => (
                <div
                  key={form.id}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    form.id === fieldSurvey.activeFormId
                      ? 'border-amber-500/50 bg-gradient-to-r from-amber-500/5 to-orange-500/5'
                      : 'border-border/50 hover:bg-accent/30'
                  }`}
                  onClick={() => setFieldSurvey({ activeFormId: form.id })}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: form.color }}
                      />
                      <span className="text-sm font-medium">{form.name}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {form.fields.length} fields
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteForm(form.id)
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {form.description && (
                    <p className="text-xs text-muted-foreground mt-1">{form.description}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Field builder for active form */}
            {activeForm && (
              <div className="space-y-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/10">
                <Label className="text-sm font-medium">
                  Fields for: {activeForm.name}
                </Label>

                {/* Existing fields */}
                <div className="space-y-1.5">
                  {activeForm.fields.map((field, i) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-2 p-2 rounded-lg border border-border/50 bg-card"
                    >
                      <GripVertical className="h-3 w-3 text-muted-foreground shrink-0" />
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        {FIELD_TYPE_CONFIG[field.type].icon}
                        <span className="text-xs font-medium truncate">{field.label}</span>
                        <Badge variant="outline" className="text-[9px] shrink-0">
                          {field.type}
                        </Badge>
                        {field.required && (
                          <span className="text-[9px] text-amber-600 shrink-0">*required</span>
                        )}
                      </div>
                      <div className="flex gap-0.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveField(field.id, 'up')}
                          disabled={i === 0}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveField(field.id, 'down')}
                          disabled={i === activeForm.fields.length - 1}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => removeField(field.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add field */}
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label className="text-[10px] text-muted-foreground">Label</Label>
                    <Input
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      placeholder="Field name"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="w-28">
                    <Label className="text-[10px] text-muted-foreground">Type</Label>
                    <Select value={newFieldType} onValueChange={(v) => setNewFieldType(v as FieldType)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(FIELD_TYPE_CONFIG) as FieldType[]).map((t) => (
                          <SelectItem key={t} value={t}>
                            {FIELD_TYPE_CONFIG[t].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {newFieldType === 'select' && (
                    <div className="flex-1">
                      <Label className="text-[10px] text-muted-foreground">Options</Label>
                      <Input
                        value={newFieldOptions}
                        onChange={(e) => setNewFieldOptions(e.target.value)}
                        placeholder="A, B, C"
                        className="h-8 text-xs"
                      />
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-amber-500/30 text-amber-600"
                    onClick={addField}
                    disabled={!newFieldName.trim()}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="collect" className="flex-1 overflow-y-auto space-y-4 pr-1">
            {!activeForm ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ClipboardList className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">Select a form first</p>
              </div>
            ) : (
              <>
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: activeForm.color }}
                    />
                    <span className="text-sm font-medium">{activeForm.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Fill in the fields below, then click &quot;Collect at Point&quot; and click on the map to place the response.
                  </p>

                  {/* Collect form fields */}
                  <div className="space-y-3">
                    {activeForm.fields.map((field) => (
                      <div key={field.id}>
                        <Label className="text-xs mb-1 block">
                          {field.label}
                          {field.required && <span className="text-amber-600 ml-0.5">*</span>}
                        </Label>
                        {field.type === 'text' && (
                          <Input
                            value={collectValues[field.label] ?? ''}
                            onChange={(e) =>
                              setCollectValues((prev) => ({ ...prev, [field.label]: e.target.value }))
                            }
                            className="h-8 text-xs"
                          />
                        )}
                        {field.type === 'number' && (
                          <Input
                            type="number"
                            value={collectValues[field.label] ?? ''}
                            onChange={(e) =>
                              setCollectValues((prev) => ({ ...prev, [field.label]: e.target.value }))
                            }
                            className="h-8 text-xs"
                          />
                        )}
                        {field.type === 'select' && (
                          <Select
                            value={collectValues[field.label] ?? ''}
                            onValueChange={(v) =>
                              setCollectValues((prev) => ({ ...prev, [field.label]: v }))
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options?.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {field.type === 'checkbox' && (
                          <Switch
                            checked={collectValues[field.label] === 'true'}
                            onCheckedChange={(v) =>
                              setCollectValues((prev) => ({ ...prev, [field.label]: v.toString() }))
                            }
                          />
                        )}
                        {field.type === 'date' && (
                          <Input
                            type="date"
                            value={collectValues[field.label] ?? ''}
                            onChange={(e) =>
                              setCollectValues((prev) => ({ ...prev, [field.label]: e.target.value }))
                            }
                            className="h-8 text-xs"
                          />
                        )}
                        {field.type === 'rating' && (
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                className={`p-1 rounded transition-colors ${
                                  parseInt(collectValues[field.label] ?? '0') >= n
                                    ? 'text-amber-500'
                                    : 'text-muted-foreground/30'
                                }`}
                                onClick={() =>
                                  setCollectValues((prev) => ({ ...prev, [field.label]: n.toString() }))
                                }
                              >
                                <Star className="h-4 w-4 fill-current" />
                              </button>
                            ))}
                          </div>
                        )}
                        {field.type === 'photo' && (
                          <p className="text-[10px] text-muted-foreground italic">
                            Photo capture via map device
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                  onClick={startCollect}
                  disabled={fieldSurvey.collectMode}
                >
                  {fieldSurvey.collectMode ? (
                    'Click on the map to place response...'
                  ) : (
                    <>
                      <MapPin className="h-4 w-4 mr-2" /> Collect at Map Point
                    </>
                  )}
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="responses" className="flex-1 overflow-y-auto space-y-3 pr-1">
            {fieldSurvey.responses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ClipboardCheck className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No responses collected yet</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {fieldSurvey.responses.length} responses
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                    onClick={exportCSV}
                  >
                    <Download className="h-3 w-3 mr-1" /> Export CSV
                  </Button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {fieldSurvey.responses.map((resp) => {
                    const form = fieldSurvey.forms.find((f) => f.id === resp.formId)
                    return (
                      <div
                        key={resp.id}
                        className="p-2.5 rounded-lg border border-border/50 bg-card text-xs"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            {form && (
                              <div
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: form.color }}
                              />
                            )}
                            <span className="font-medium">{form?.name ?? 'Unknown'}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(resp.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="font-mono text-[10px] text-muted-foreground mb-1">
                          {resp.longitude.toFixed(6)}, {resp.latitude.toFixed(6)}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                          {Object.entries(resp.values).map(([key, val]) => (
                            <span key={key} className="text-[10px]">
                              <span className="text-muted-foreground">{key}:</span>{' '}
                              <span className="font-medium">{val || '—'}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
