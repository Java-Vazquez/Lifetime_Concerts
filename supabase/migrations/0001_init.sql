-- Esquema para el rastreador de conciertos.

create extension if not exists "pgcrypto";

create table if not exists concerts (
  id uuid primary key default gen_random_uuid(),
  artist_name text not null,
  venue_name text not null,
  city text not null,
  country text,
  event_date date not null,
  setlistfm_id text,
  created_at timestamptz not null default now()
);

create table if not exists songs (
  id uuid primary key default gen_random_uuid(),
  concert_id uuid not null references concerts (id) on delete cascade,
  position int not null,
  name text not null,
  info text,
  is_tape boolean not null default false
);

create index if not exists songs_concert_id_idx on songs (concert_id);

alter table concerts enable row level security;
alter table songs enable row level security;

-- Lectura pública: cualquiera puede ver los conciertos y sus setlists.
create policy "concerts_select_public" on concerts
  for select using (true);

create policy "songs_select_public" on songs
  for select using (true);

-- Escritura restringida: solo el usuario dueño del sitio.
create policy "concerts_write_owner" on concerts
  for all using (auth.uid() = 'fe1d98f1-490a-4467-9cb1-f1bd7af6506d')
  with check (auth.uid() = 'fe1d98f1-490a-4467-9cb1-f1bd7af6506d');

create policy "songs_write_owner" on songs
  for all using (auth.uid() = 'fe1d98f1-490a-4467-9cb1-f1bd7af6506d')
  with check (auth.uid() = 'fe1d98f1-490a-4467-9cb1-f1bd7af6506d');
