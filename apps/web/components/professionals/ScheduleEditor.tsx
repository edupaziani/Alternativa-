'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

interface Slot {
  unitId: string
  dayOfWeek: number
  startTime: string
  endTime: string
}

interface ScheduleEditorProps {
  professionalId: string
  initialSlots: Slot[]
  units: { id: string; name: string }[]
}

export function ScheduleEditor({ professionalId, initialSlots, units }: ScheduleEditorProps) {
  const [slots, setSlots] = useState<Slot[]>(initialSlots)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // New slot draft state
  const [draft, setDraft] = useState<Slot>({
    unitId: units[0]?.id ?? '',
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '17:00',
  })

  function addSlot() {
    if (!draft.unitId) return
    setSlots((prev) => [...prev, { ...draft }])
  }

  function removeSlot(idx: number) {
    setSlots((prev) => prev.filter((_, i) => i !== idx))
  }

  async function save() {
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      await api.put(`/professionals/${professionalId}/schedule`, { slots })
      setSuccess(true)
    } catch (err) {
      setError((err as { message?: string }).message ?? 'Erro ao salvar agenda.')
    } finally {
      setSaving(false)
    }
  }

  const unitName = (id: string) => units.find((u) => u.id === id)?.name ?? id

  return (
    <div className="space-y-4">
      {/* Existing slots */}
      {slots.length > 0 ? (
        <div className="space-y-2">
          {slots.map((slot, idx) => (
            <div key={idx} className="flex items-center gap-3 rounded-md border bg-white px-3 py-2 text-sm">
              <Badge variant="outline">{DAY_LABELS[slot.dayOfWeek]}</Badge>
              <span className="font-medium">{unitName(slot.unitId)}</span>
              <span className="text-slate-500">{slot.startTime} – {slot.endTime}</span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto h-6 text-destructive hover:text-destructive"
                onClick={() => removeSlot(idx)}
              >
                Remover
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">Nenhum horário configurado.</p>
      )}

      {/* Add slot form */}
      <div className="rounded-md border bg-slate-50 p-3 space-y-3">
        <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Adicionar horário</p>
        <div className="flex flex-wrap gap-2 items-end">
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Unidade</label>
            <Select
              value={draft.unitId}
              onValueChange={(v) => setDraft((d) => ({ ...d, unitId: v }))}
            >
              <SelectTrigger className="w-44 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {units.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500">Dia</label>
            <Select
              value={String(draft.dayOfWeek)}
              onValueChange={(v) => setDraft((d) => ({ ...d, dayOfWeek: Number(v) }))}
            >
              <SelectTrigger className="w-24 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAY_LABELS.map((label, i) => (
                  <SelectItem key={i} value={String(i)}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500">Início</label>
            <Input
              type="time"
              className="h-8 w-28 text-sm"
              value={draft.startTime}
              onChange={(e) => setDraft((d) => ({ ...d, startTime: e.target.value }))}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500">Fim</label>
            <Input
              type="time"
              className="h-8 w-28 text-sm"
              value={draft.endTime}
              onChange={(e) => setDraft((d) => ({ ...d, endTime: e.target.value }))}
            />
          </div>

          <Button size="sm" className="h-8" onClick={addSlot} disabled={!draft.unitId}>
            Adicionar
          </Button>
        </div>
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      {success && <p className="text-sm font-medium text-green-600">Agenda salva com sucesso.</p>}

      <Button onClick={save} disabled={saving}>
        {saving ? 'Salvando...' : 'Salvar agenda'}
      </Button>
    </div>
  )
}
