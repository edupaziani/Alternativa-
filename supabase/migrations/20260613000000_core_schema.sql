-- ============================================================
-- Core schema: enums, lookup tables, main domain tables
-- ============================================================

-- ── Enums ────────────────────────────────────────────────────
create type public.user_role as enum (
  'admin',
  'professional',
  'receptionist',
  'financial'
);

-- ── Shared trigger: keep updated_at current ──────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── attendance_units ─────────────────────────────────────────
create table public.attendance_units (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  address     text,
  phone       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create trigger set_attendance_units_updated_at
  before update on public.attendance_units
  for each row execute function public.set_updated_at();

-- ── convenios ────────────────────────────────────────────────
create table public.convenios (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  code        text,
  ans_code    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create trigger set_convenios_updated_at
  before update on public.convenios
  for each row execute function public.set_updated_at();

-- ── profiles (extends auth.users) ────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  role        public.user_role not null default 'receptionist',
  crm         text,
  phone       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create profile row on new auth user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── professionals ────────────────────────────────────────────
create table public.professionals (
  id          uuid primary key default uuid_generate_v4(),
  profile_id  uuid references public.profiles(id),
  unit_id     uuid references public.attendance_units(id),
  specialty   text,
  crm         text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create index on public.professionals (profile_id);
create index on public.professionals (unit_id);
create index on public.professionals (deleted_at);

create trigger set_professionals_updated_at
  before update on public.professionals
  for each row execute function public.set_updated_at();

-- ── patients ─────────────────────────────────────────────────
create table public.patients (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  cpf          text,
  birth_date   date,
  phone        text,
  email        text,
  convenio_id  uuid references public.convenios(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create index on public.patients (name);
create index on public.patients (cpf);
create index on public.patients (deleted_at);

create trigger set_patients_updated_at
  before update on public.patients
  for each row execute function public.set_updated_at();

-- ── appointment_types ────────────────────────────────────────
create table public.appointment_types (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  duration_minutes  int not null default 30,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz
);

create trigger set_appointment_types_updated_at
  before update on public.appointment_types
  for each row execute function public.set_updated_at();

-- ── professional_schedules ───────────────────────────────────
create table public.professional_schedules (
  id               uuid primary key default uuid_generate_v4(),
  professional_id  uuid not null references public.professionals(id),
  unit_id          uuid not null references public.attendance_units(id),
  day_of_week      smallint not null check (day_of_week between 0 and 6),
  start_time       time not null,
  end_time         time not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz,
  constraint end_after_start check (end_time > start_time)
);

create index on public.professional_schedules (professional_id, unit_id, day_of_week);
create index on public.professional_schedules (deleted_at);

create trigger set_professional_schedules_updated_at
  before update on public.professional_schedules
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row-Level Security
-- ============================================================

-- Helper: returns the role of the authenticated user
create or replace function public.current_user_role()
returns public.user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid() and deleted_at is null;
$$;

-- ── attendance_units ─────────────────────────────────────────
alter table public.attendance_units enable row level security;

create policy "attendance_units: authenticated users can read"
  on public.attendance_units for select
  to authenticated using (deleted_at is null);

create policy "attendance_units: admin and receptionist can write"
  on public.attendance_units for insert
  to authenticated with check (
    public.current_user_role() in ('admin', 'receptionist')
  );

create policy "attendance_units: admin and receptionist can update"
  on public.attendance_units for update
  to authenticated using (
    public.current_user_role() in ('admin', 'receptionist')
  );

-- ── convenios ────────────────────────────────────────────────
alter table public.convenios enable row level security;

create policy "convenios: authenticated users can read"
  on public.convenios for select
  to authenticated using (deleted_at is null);

create policy "convenios: admin and receptionist can write"
  on public.convenios for insert
  to authenticated with check (
    public.current_user_role() in ('admin', 'receptionist')
  );

create policy "convenios: admin and receptionist can update"
  on public.convenios for update
  to authenticated using (
    public.current_user_role() in ('admin', 'receptionist')
  );

-- ── profiles ─────────────────────────────────────────────────
alter table public.profiles enable row level security;

create policy "profiles: users can read own profile"
  on public.profiles for select
  to authenticated using (
    id = auth.uid() or public.current_user_role() = 'admin'
  );

create policy "profiles: users can update own profile"
  on public.profiles for update
  to authenticated using (id = auth.uid());

create policy "profiles: admin can update any profile"
  on public.profiles for update
  to authenticated using (public.current_user_role() = 'admin');

-- ── professionals ────────────────────────────────────────────
alter table public.professionals enable row level security;

create policy "professionals: authenticated users can read"
  on public.professionals for select
  to authenticated using (deleted_at is null);

create policy "professionals: admin can write"
  on public.professionals for insert
  to authenticated with check (public.current_user_role() = 'admin');

create policy "professionals: admin can update"
  on public.professionals for update
  to authenticated using (public.current_user_role() = 'admin');

-- ── patients ─────────────────────────────────────────────────
alter table public.patients enable row level security;

create policy "patients: authenticated users can read"
  on public.patients for select
  to authenticated using (deleted_at is null);

create policy "patients: admin and receptionist can write"
  on public.patients for insert
  to authenticated with check (
    public.current_user_role() in ('admin', 'receptionist')
  );

create policy "patients: admin and receptionist can update"
  on public.patients for update
  to authenticated using (
    public.current_user_role() in ('admin', 'receptionist')
  );

-- ── appointment_types ────────────────────────────────────────
alter table public.appointment_types enable row level security;

create policy "appointment_types: authenticated users can read"
  on public.appointment_types for select
  to authenticated using (deleted_at is null);

create policy "appointment_types: admin can write"
  on public.appointment_types for insert
  to authenticated with check (public.current_user_role() = 'admin');

create policy "appointment_types: admin can update"
  on public.appointment_types for update
  to authenticated using (public.current_user_role() = 'admin');

-- ── professional_schedules ───────────────────────────────────
alter table public.professional_schedules enable row level security;

create policy "professional_schedules: authenticated users can read"
  on public.professional_schedules for select
  to authenticated using (deleted_at is null);

create policy "professional_schedules: admin can write"
  on public.professional_schedules for insert
  to authenticated with check (public.current_user_role() = 'admin');

create policy "professional_schedules: admin and own professional can update"
  on public.professional_schedules for update
  to authenticated using (
    public.current_user_role() = 'admin'
    or exists (
      select 1 from public.professionals p
      where p.id = professional_id
        and p.profile_id = auth.uid()
        and p.deleted_at is null
    )
  );
