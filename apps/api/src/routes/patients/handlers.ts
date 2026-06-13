import type { FastifyRequest, FastifyReply } from 'fastify'
import { AppError, ErrorCode } from '@alternativa/types'
import type { TablesUpdate } from '@alternativa/types'
import type {
  CreatePatientBody,
  UpdatePatientBody,
  ListPatientsQuery,
  PatientParams,
} from './schema'

export async function listPatients(
  request: FastifyRequest<{ Querystring: ListPatientsQuery }>,
  reply: FastifyReply,
) {
  const { page, limit, search, letter, active, convenioId } = request.query
  const { supabase } = request

  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('patients')
    .select('*, convenios(id, name)', { count: 'exact' })
    .is('deleted_at', null)
    .order('name', { ascending: true })
    .range(from, to)

  if (search) {
    query = query.or(`name.ilike.%${search}%,cpf.ilike.%${search}%`)
  }

  if (letter) {
    query = query.ilike('name', `${letter}%`)
  }

  if (active !== undefined) {
    query = query.eq('active', active === 'true')
  } else {
    query = query.eq('active', true)
  }

  if (convenioId) {
    query = query.eq('convenio_id', convenioId)
  }

  const { data, count, error } = await query

  if (error) {
    throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500)
  }

  return reply.send({
    data,
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
  })
}

export async function getPatient(
  request: FastifyRequest<{ Params: PatientParams }>,
  reply: FastifyReply,
) {
  const { id } = request.params
  const { supabase } = request

  const { data, error } = await supabase
    .from('patients')
    .select('*, convenios(id, name)')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error || !data) {
    throw new AppError(ErrorCode.PATIENT_NOT_FOUND, 'Paciente não encontrado', 404)
  }

  return reply.send(data)
}

export async function createPatient(
  request: FastifyRequest<{ Body: CreatePatientBody }>,
  reply: FastifyReply,
) {
  const body = request.body
  const { supabase } = request

  if (body.cpf) {
    const { data: existing } = await supabase
      .from('patients')
      .select('id')
      .eq('cpf', body.cpf)
      .is('deleted_at', null)
      .single()

    if (existing) {
      throw new AppError(ErrorCode.PATIENT_CPF_DUPLICATE, 'Já existe um paciente com este CPF', 409)
    }
  }

  const { data, error } = await supabase
    .from('patients')
    .insert({
      name: body.name,
      cpf: body.cpf ?? null,
      birth_date: body.birthDate ?? null,
      phone: body.phone ?? null,
      email: body.email ?? null,
      gender: body.gender ?? null,
      marital_status: body.maritalStatus ?? null,
      active: body.active ?? true,
      convenio_id: body.convenioId ?? null,
      cep: body.cep ?? null,
      address_street: body.addressStreet ?? null,
      address_number: body.addressNumber ?? null,
      address_complement: body.addressComplement ?? null,
      address_neighborhood: body.addressNeighborhood ?? null,
      address_city: body.addressCity ?? null,
      address_state: body.addressState ?? null,
    })
    .select()
    .single()

  if (error) {
    throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500)
  }

  return reply.status(201).send(data)
}

export async function updatePatient(
  request: FastifyRequest<{ Params: PatientParams; Body: UpdatePatientBody }>,
  reply: FastifyReply,
) {
  const { id } = request.params
  const body = request.body
  const { supabase } = request

  const { data: existing } = await supabase
    .from('patients')
    .select('id')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!existing) {
    throw new AppError(ErrorCode.PATIENT_NOT_FOUND, 'Paciente não encontrado', 404)
  }

  if (body.cpf) {
    const { data: duplicate } = await supabase
      .from('patients')
      .select('id')
      .eq('cpf', body.cpf)
      .neq('id', id)
      .is('deleted_at', null)
      .single()

    if (duplicate) {
      throw new AppError(ErrorCode.PATIENT_CPF_DUPLICATE, 'Já existe um paciente com este CPF', 409)
    }
  }

  const update: TablesUpdate<'patients'> = {}
  if (body.name !== undefined)                update.name = body.name
  if (body.cpf !== undefined)                 update.cpf = body.cpf ?? null
  if (body.birthDate !== undefined)           update.birth_date = body.birthDate ?? null
  if (body.phone !== undefined)               update.phone = body.phone ?? null
  if (body.email !== undefined)               update.email = body.email ?? null
  if (body.gender !== undefined)              update.gender = body.gender ?? null
  if (body.maritalStatus !== undefined)       update.marital_status = body.maritalStatus ?? null
  if (body.active !== undefined)              update.active = body.active
  if (body.convenioId !== undefined)          update.convenio_id = body.convenioId ?? null
  if (body.cep !== undefined)                 update.cep = body.cep ?? null
  if (body.addressStreet !== undefined)       update.address_street = body.addressStreet ?? null
  if (body.addressNumber !== undefined)       update.address_number = body.addressNumber ?? null
  if (body.addressComplement !== undefined)   update.address_complement = body.addressComplement ?? null
  if (body.addressNeighborhood !== undefined) update.address_neighborhood = body.addressNeighborhood ?? null
  if (body.addressCity !== undefined)         update.address_city = body.addressCity ?? null
  if (body.addressState !== undefined)        update.address_state = body.addressState ?? null

  const { data, error } = await supabase
    .from('patients')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500)
  }

  return reply.send(data)
}

export async function deletePatient(
  request: FastifyRequest<{ Params: PatientParams }>,
  reply: FastifyReply,
) {
  const { id } = request.params
  const { supabase } = request

  const { data: existing } = await supabase
    .from('patients')
    .select('id')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!existing) {
    throw new AppError(ErrorCode.PATIENT_NOT_FOUND, 'Paciente não encontrado', 404)
  }

  const { error } = await supabase
    .from('patients')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500)
  }

  return reply.status(204).send()
}
