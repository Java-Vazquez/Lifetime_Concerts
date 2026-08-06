# Mis Conciertos

Página personal para llevar registro de los conciertos a los que asististe. Al agregar un
concierto, busca automáticamente el setlist tocado esa noche en [setlist.fm](https://www.setlist.fm/).

## Stack

- **Frontend**: React + Vite, desplegado en GitHub Pages.
- **Datos**: Supabase (Postgres), con Row Level Security: lectura pública, escritura solo para vos.
- **Setlists**: dos Supabase Edge Functions que llaman a la API de setlist.fm (necesarias porque
  setlist.fm no permite llamadas directas desde el navegador y la API key no puede exponerse
  en el código del cliente):
  - `fetch-setlist`: busca setlists por artista/fecha al agregar un concierto.
  - `get-setlist`: trae el setlist de un concierto ya guardado cuando se pulsa
    "Ver las canciones que se tocaron ese día", y lo guarda en la base para que las
    visitas siguientes no vuelvan a llamar a la API.

## Setup local

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Crear un proyecto gratis en [supabase.com](https://supabase.com).

3. Copiar `.env.example` a `.env` y completar con los datos de tu proyecto (Project Settings → API):

   ```
   VITE_SUPABASE_URL=https://tuproyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=...
   ```

4. Instalar la [Supabase CLI](https://supabase.com/docs/guides/cli) y vincular el proyecto:

   ```bash
   supabase login
   supabase link --project-ref <tu-project-ref>
   ```

5. Antes de aplicar la migración, editar `supabase/migrations/0001_init.sql` y reemplazar
   `'00000000-0000-0000-0000-000000000000'` por tu propio user id. Para conseguirlo:

   - Ir a Authentication → Users en el dashboard de Supabase y crear tu usuario (email + password).
   - Copiar el UID que aparece en la tabla.

6. Aplicar la migración:

   ```bash
   supabase db push
   ```

7. Desplegar las Edge Functions:

   ```bash
   supabase functions deploy fetch-setlist
   ```

   ```bash
   supabase functions deploy get-setlist
   ```

8. Pedir tu API key gratis en https://www.setlist.fm/settings/apikey (requiere cuenta; la
   aprobación no es instantánea). Mientras no la tengas, la función devuelve datos de ejemplo
   (mock) para que puedas probar todo el flujo igual. Cuando la tengas:

   ```bash
   supabase secrets set SETLISTFM_API_KEY=tu_api_key
   ```

9. Correr en desarrollo:

   ```bash
   npm run dev
   ```

## Deploy a GitHub Pages

Repo: https://github.com/Java-Vazquez/Lifetime_Concerts
Sitio: https://java-vazquez.github.io/Lifetime_Concerts/

1. En el repo → Settings → Secrets and variables → Actions, agregar `VITE_SUPABASE_URL` y
   `VITE_SUPABASE_ANON_KEY` (los mismos valores que tenés en `.env`).
2. En Settings → Pages, configurar el origen como la branch `gh-pages`.
3. Cada push a `main` dispara `.github/workflows/deploy.yml`, que buildea y publica el sitio.

El nombre del repo aparece en tres lugares que deben coincidir: `base` en `vite.config.js`,
`basename` en `src/main.jsx` y `pathSegmentsToKeep` en `public/404.html`. Ese 404 existe porque
GitHub Pages no reescribe rutas: sin él, entrar directo a `/concierto/<id>` daría error.
