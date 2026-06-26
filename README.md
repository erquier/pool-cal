# 🏊 Pool-Cal

Reserva la piscina del residencial con Google Calendar.

## Para vecinos

1. Abre **[pool-cal.vercel.app](https://pool-cal.vercel.app)**
2. Inicia sesión con tu cuenta de Google
3. Ve el calendario semanal — slots verdes disponibles, rojos ocupados
4. Click en un slot vacío → elige duración → **Reserva**
5. Tus reservas aparecen en azul con opción a cancelar

### Agregar a tu Google Calendar

Haz click en "Agregar a mi Google Calendar" desde la app para ver las reservas de todos en tiempo real desde tu celular 📱

## Reglas

| Regla | Detalle |
|-------|---------|
| 🕐 Horario | 7:00 AM — 10:00 PM |
| ⏱️ Duración máx | 3 horas por reserva |
| 🏠 Por hogar | 1 reserva por día |
| ❌ Cancelación | Desde la web si no vas a usar el turno |

## Stack

- **Next.js 16** (App Router)
- **NextAuth v5** (Google OAuth)
- **Google Calendar API v3** (Service Account)
- **Tailwind CSS v4**
- **Deploy:** Vercel (free)

## Dev

```bash
git clone https://github.com/erquier/pool-cal
cd pool-cal
cp .env.local.example .env.local
# Fill in your credentials
npm install
npm run dev
```

### Environment Variables

| Variable | Descripción |
|----------|-------------|
| `AUTH_GOOGLE_ID` | Google OAuth Client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Full service account JSON (minified) |
| `GOOGLE_CALENDAR_ID` | Pool calendar ID (`xxx@group.calendar.google.com`) |
| `AUTH_SECRET` | Random string for session encryption |
