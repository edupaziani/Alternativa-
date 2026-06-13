import type { FastifyRequest, FastifyReply } from 'fastify'
import { AppError, ErrorCode } from '@alternativa/types'
import type { TablesUpdate } from '@alternativa/types'
import type {
  CreateProfessionalBody,
  UpdateProfessionalBody,
  ListProfessionalsQuery,
  ProfessionalParams,
  SetScheduleBody,
} from './schema'

export async function listProfessionals(
  request: FastifyRequest<{ Querystring: ListProfessionalsQuery }>,
  reply: FastifyReply,
) {
  const { specialty, unitId, search } = request.query
  const { supabase } = request

  let query = supabase
    .from('professionals')
    .select('*, attendance_units!professionals_unit_id_fkey(id, name)')
    .is('deleted_at', null)
    .order('name', { ascending: true })

  if (search) query = query.ilike('name', `%${search}%`)
  if (specialty) query = query.ilike('specialty', `%${specialty}%`)
  if (unitId) query = query.eq('unit_id', unitId)

  const { data, error } = await query
  if (error) throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500)

  return reply.send({ data })
}

export async function getProfessional(
  request: FastifyRequest<{ Params: ProfessionalParams }>,
  reply: FastifyReply,
) {
  const { id } = request.params
  const { supabase } = request

  const { data, error } = await supabase
    .from('professionals')
    .select('*, attendance_units!professionals_unit_id_fkey(id, name)')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error || !data) {
    throw new AppError(ErrorCode.PROFESSIONAL_NOT_FOUND, 'Profissional não encontrado', 404)
  }

  return reply.send(data)
}

export async function createProfessional(
  request: FastifyRequest<{ Body: CreateProfessionalBody }>,
  reply: FastifyReply,
) {
  const body = request.body
  const { supabase } = request

  const { data, error } = await supabase
    .from('professionals')
    .insert({
      name: body.name,
      specialty: body.specialty ?? null,
      crm: body.crm ?? null,
      profile_id: body.profileId ?? null,
      unit_id: body.unitId ?? null,
    })
    .select()
    .single()

  if (error) throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500)

  return reply.status(201).send(data)
}

export async function updateProfessional(
  request: FastifyRequest<{ Params: ProfessionalParams; Body: UpdateProfessionalBody }>,
  reply: FastifyReply,
) {
  const { id } = request.params
  const body = request.body
  const { supabase } = request

  const { data: existing } = await supabase
    .from('professionals')
    .select('id')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!existing) {
    throw new AppError(ErrorCode.PROFESSIONAL_NOT_FOUND, 'Profissional não encontrado', 404)
  }

  const update: TablesUpdate<'professionals'> = {}
  if (body.name !== undefined)      update.name = body.name
  if (body.specialty !== undefined) update.specialty = body.specialty ?? null
  if (body.crm !== undefined)       update.crm = body.crm ?? null
  if (body.profileId !== undefined) update.profile_id = body.profileId ?? null
  if (body.unitId !== undefined)    update.unit_id = body.unitId ?? null

  const { data, error } = await supabase
    .from('professionals')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500)

  return reply.send(data)
}

export async function deleteProfessional(
  request: FastifyRequest<{ Params: ProfessionalParams }>,
  reply: FastifyReply,
) {
  const { id } = request.params
  const { supabase } = request

  const { data: existing } = await supabase
    .from('professionals')
    .select('id')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!existing) {
    throw new AppError(ErrorCode.PROFESSIONAL_NOT_FOUND, 'Profissional não encontrado', 404)
  }

  const { error } = await supabase
    .from('professionals')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500)

  return reply.status(204).send()
}

export async function getSchedule(
  request: FastifyRequest<{ Params: ProfessionalParams }>,
  reply: FastifyReply,
) {
  const { id } = request.params
  const { supabase } = request

  const { data: professional } = await supabase
    .from('professionals')
    .select('id')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!professional) {
    throw new AppError(ErrorCode.PROFESSIONAL_NOT_FOUND, 'Profissional não encontrado', 404)
  }

  const { data, error } = await supabase
    .from('professional_schedules')
    .select('*, attendance_units(id, name)')
    .eq('professional_id', id)
    .is('deleted_at', null)
    .order('unit_id')
    .order('day_of_week')
    .order('start_time')

  if (error) throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500)

  return reply.send({ data })
}

function detectConflict(
  slots: SetScheduleBody['slots'],
): { a: (typeof slots)[number]; b: (typeof slots)[number] } | null {
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const a = slots[i], b = slots[j]
      if (a.unitId === b.unitId && a.dayOfWeek === b.dayOfWeek) {
        if (a.startTime < b.endTime && b.startTime < a.endTime) {
          return { a, b }
        }
      }
    }
  }
  return null
}

export async function setSchedule(
  request: FastifyRequest<{ Params: ProfessionalParams; Body: SetScheduleBody }>,
  reply: FastifyReply,
) {
  const { id } = request.params
  const { slots } = request.body
  const { supabase } = request

  const { data: professional } = await supabase
    .from('professionals')
    .select('id')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!professional) {
    throw new AppError(ErrorCode.PROFESSIONAL_NOT_FOUND, 'Profissional não encontrado', 404)
  }

  const conflict = detectConflict(slots)
  if (conflict) {
    throw new AppError(
      ErrorCode.PROFESSIONAL_SCHEDULE_CONFLICT,
      `Conflito de horário: ${conflict.a.startTime}–${conflict.a.endTime} e ${conflict.b.startTime}–${conflict.b.endTime} no mesmo dia e unidade`,
      409,
    )
  }

  // Soft-delete all existing slots for this professional, then insert new ones
  const { error: deleteError } = await supabase
    .from('professional_schedules')
    .update({ deleted_at: new Date().toISOString() })
    .eq('professional_id', id)
    .is('deleted_at', null)

  if (deleteError) throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, deleteError.message, 500)

  if (slots.length > 0) {
    const { error: insertError } = await supabase.from('professional_schedules').insert(
      slots.map((s) => ({
        professional_id: id,
        unit_id: s.unitId,
        day_of_week: s.dayOfWeek,
        start_time: s.startTime,
        end_time: s.endTime,
      })),
    )
    if (insertError) throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, insertError.message, 500)
  }

  return reply.status(204).send()
}
