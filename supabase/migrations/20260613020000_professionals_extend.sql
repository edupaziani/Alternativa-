-- Add name column to professionals (required for display when no profile_id is linked)
alter table public.professionals
  add column if not exists name text not null default '';

create index if not exists professionals_name_idx on public.professionals (name);
create index if not exists professionals_specialty_idx on public.professionals (specialty);
