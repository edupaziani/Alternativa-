-- Extend patients table with fields required by the patient module (ALT-9)

alter table public.patients
  add column if not exists gender         text check (gender in ('male', 'female', 'other')),
  add column if not exists marital_status text check (marital_status in ('single', 'married', 'divorced', 'widowed', 'other')),
  add column if not exists active         boolean not null default true,
  add column if not exists cep            text,
  add column if not exists address_street       text,
  add column if not exists address_number       text,
  add column if not exists address_complement   text,
  add column if not exists address_neighborhood text,
  add column if not exists address_city         text,
  add column if not exists address_state        char(2);

create index if not exists patients_active_idx on public.patients (active) where deleted_at is null;
