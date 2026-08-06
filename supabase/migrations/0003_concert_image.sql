-- Imagen del artista (Deezer) para identificar visualmente cada concierto.
alter table concerts add column if not exists image_url text;
