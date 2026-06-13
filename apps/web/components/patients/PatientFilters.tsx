'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

interface PatientFiltersProps {
  convenios: { id: string; name: string }[]
}

export function PatientFilters({ convenios }: PatientFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })
      params.delete('page')
      return params.toString()
    },
    [searchParams],
  )

  const push = (updates: Record<string, string | undefined>) => {
    router.push(`${pathname}?${createQueryString(updates)}`)
  }

  const activeLetter = searchParams.get('letter') ?? ''
  const activeStatus = searchParams.get('active') ?? ''
  const activeConvenio = searchParams.get('convenioId') ?? ''

  return (
    <div className="space-y-3">
      {/* Search */}
      <Input
        placeholder="Buscar por nome ou CPF..."
        defaultValue={searchParams.get('search') ?? ''}
        onChange={(e) => push({ search: e.target.value || undefined })}
        className="max-w-sm"
      />

      {/* A-Z quick filter */}
      <div className="flex flex-wrap gap-1">
        <Button
          variant={activeLetter === '' ? 'default' : 'outline'}
          size="sm"
          className="h-7 w-8 p-0 text-xs"
          onClick={() => push({ letter: undefined })}
        >
          Todos
        </Button>
        {LETTERS.map((l) => (
          <Button
            key={l}
            variant={activeLetter === l ? 'default' : 'outline'}
            size="sm"
            className={cn('h-7 w-7 p-0 text-xs')}
            onClick={() => push({ letter: activeLetter === l ? undefined : l })}
          >
            {l}
          </Button>
        ))}
      </div>

      {/* Status + Convenio filters */}
      <div className="flex gap-3">
        <Select
          value={activeStatus || 'true'}
          onValueChange={(v) => push({ active: v === 'all' ? undefined : v })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Ativos</SelectItem>
            <SelectItem value="false">Desativados</SelectItem>
            <SelectItem value="all">Todos</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={activeConvenio || 'all'}
          onValueChange={(v) => push({ convenioId: v === 'all' ? undefined : v })}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Convênio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os convênios</SelectItem>
            {convenios.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
