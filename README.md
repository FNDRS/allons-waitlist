# allons-waitlist

Landing page super minimalista para Allons.
Negro, logo + un solo CTA → captura email → guarda en Supabase con atribución por QR.

## Stack
- Next.js 15 (App Router)
- React 19
- Tailwind 4
- Supabase (tabla `waitlist`)
- `qrcode` (script de generación)

## Setup rápido

```bash
cd allons-waitlist
pnpm install
cp .env.example .env.local   # llena las 3 variables
pnpm dev
```

### 1. Variables de entorno

`.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

> El `SUPABASE_SERVICE_ROLE_KEY` solo se usa server-side en `/api/waitlist`. **Nunca** lo expongas con prefijo `NEXT_PUBLIC_`.

### 2. Crear la tabla en Supabase

Abre tu proyecto → **SQL Editor** → pega y corre `db/schema.sql`.

Crea:
- `public.waitlist` con columnas `email`, `source`, `referer`, `user_agent`, `ip`, `created_at`
- Índice único en `lower(email)` (un email solo se registra una vez)
- View `waitlist_by_source` para ver el conteo por QR/ubicación
- RLS encendido — solo el `service_role` (el server) puede leer/escribir

### 3. Deploy

Vercel:
```bash
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel --prod
```

---

## Atribución por QR

La landing lee el query param `?src=`. El valor se guarda en la columna `source`.

URL → `https://allons.app/?src=la20`
Insert → `{ email: "...", source: "la20" }`

### Generar los QRs

1. Edita `scripts/generate-qr.ts` y agrega tus ubicaciones a `SOURCES`:
   ```ts
   const SOURCES = [
     { slug: "la20", label: "La 20 Cervecería" },
     { slug: "diunsa", label: "Diunsa" },
     { slug: "multiplaza", label: "Mall Multiplaza" },
   ];
   ```

2. Corre el script:
   ```bash
   BASE_URL=https://allons.app pnpm run qr
   ```

3. Encuentra los archivos en `./qrs/`:
   - `la20.png` (1024×1024, listo para imprimir)
   - `la20.svg` (vectorial)
   - `index.json` (resumen de URLs)

### Reglas para los slugs

- Solo `a-z`, `0-9`, `-`, `_`. Máx. 40 chars.
- El backend valida con regex; cualquier slug "raro" se guarda como `null` (= directo).
- Mantén el slug igual entre reprints de la misma ubicación.

---

## Ver quién vino de cada QR

En SQL Editor de Supabase:

```sql
-- Resumen agregado
select * from waitlist_by_source;

-- Detalle de la última semana, por ubicación
select source, email, created_at
from waitlist
where created_at > now() - interval '7 days'
order by created_at desc;

-- Conversión por día y por QR
select
  date_trunc('day', created_at) as day,
  coalesce(source, '(direct)') as source,
  count(*) as signups
from waitlist
group by 1, 2
order by 1 desc, 3 desc;
```

---

## Estructura

```
.
├── db/schema.sql                  # corre esto en Supabase
├── public/                        # logo Allons
├── scripts/generate-qr.ts         # genera QRs con ?src=
└── src/
    ├── app/
    │   ├── api/waitlist/route.ts  # POST endpoint (server-side, service_role)
    │   ├── page.tsx               # landing
    │   ├── layout.tsx
    │   └── globals.css
    ├── components/
    │   ├── AllonsLogo.tsx
    │   └── WaitlistForm.tsx       # CTA → email → submit
    └── lib/
        └── supabase-server.ts     # admin client
```
