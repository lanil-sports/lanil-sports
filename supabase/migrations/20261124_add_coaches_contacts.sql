create table if not exists public.coaches_contacts (
  id bigserial primary key,
  school_id text,
  school_name text not null,
  school_level text, -- high_school | college
  sport text,
  coach_name text,
  role text, -- Head Coach | Assistant Coach | Athletic Director | Recruiting Coordinator
  email text,
  phone text,
  source_url text,
  source_type text, -- official_staff_directory | lhsaa | maxpreps | manual
  verified boolean not null default false,
  confidence numeric not null default 0,
  opt_out boolean not null default false,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists coaches_contacts_unique_idx
  on public.coaches_contacts (lower(school_name), lower(coalesce(sport,'')), lower(coalesce(email,'')), lower(coalesce(coach_name,'')));

create index if not exists coaches_contacts_school_idx on public.coaches_contacts (school_id, school_name);
create index if not exists coaches_contacts_email_idx on public.coaches_contacts (lower(email));