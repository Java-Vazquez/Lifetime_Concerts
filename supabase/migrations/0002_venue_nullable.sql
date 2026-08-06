-- Algunos conciertos no tienen setlist en setlist.fm, y con ello tampoco
-- datos del venue. El concierto se guarda igual como parte del historial.
alter table concerts alter column venue_name drop not null;
