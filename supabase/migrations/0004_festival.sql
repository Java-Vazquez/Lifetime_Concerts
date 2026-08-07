-- Varios conciertos fueron parte de un festival. Las bandas se mantienen como
-- entradas separadas; el festival es solo una etiqueta para ubicarlas.
alter table concerts add column if not exists festival text;

update concerts set festival = 'Domination'      where event_date = '2019-05-03';
update concerts set festival = 'Hell & Heaven'   where event_date = '2022-12-02';
update concerts set festival = 'Music Bank'      where event_date = '2023-10-22';
update concerts set festival = 'Axe Ceremonia'   where event_date = '2025-04-05';
