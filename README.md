# 🏊 Pool-Cal

Reserva la piscina del **Residencial Ian 2** con Google Calendar como backend.

**🌐 [pool.erqlabs.site](https://pool.erqlabs.site)**

---

## Para vecinos

1. Abre **[pool.erqlabs.site](https://pool.erqlabs.site)** — vista pública del calendario, sin login
2. Inicia sesión con tu cuenta de Google para reservar
3. Navegación semanal con selector de mes integrado
4. Toca un slot vacío → confirma → **Reserva hecha**
5. Tus reservas aparecen en azul en el grid y en la sección "Mis reservas" abajo
6. Cancela desde "Mis reservas" si no vas a usar el turno

### Ver el calendario en tu celular

Agrega la suscripción a tu app favorita desde la página:
- **Google Calendar:** toca el link → se agrega solo
- **Apple Calendar / iCal:** toca el link → "Suscribirse" → se sincroniza

El feed ICS está disponible en `/api/events/cal.ics`.

## Reglas

| Regla | Detalle |
|-------|---------|
| 🕐 Horario | Desde las **7:00 AM** en adelante |
| 🏠 Por hogar | 1 reserva por día |
| ❌ Cancelación | Desde la web si no vas a usar el turno |

## Stack

- **Next.js 16** (App Router, standalone build)
- **NextAuth v5** (Google OAuth)
- **Google Calendar API v3** (Service Account)
- **Tailwind CSS v4**
- **Docker** deploy en servidor propio

## Deploy

```bash
docker compose build app
docker compose up -d
```

La app corre en el puerto `3000`, servida detrás de **Cloudflare** (proxy SSL).

### Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `AUTH_GOOGLE_ID` | Google OAuth Client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Full service account JSON (minified) |
| `GOOGLE_CALENDAR_ID` | Pool calendar ID (`xxx@group.calendar.google.com`) |
| `AUTH_SECRET` | Random string para encriptar sesiones |
| `AUTH_URL` | URL pública (`https://pool.erqlabs.site`) |
| `AUTH_TRUST_HOST` | `true` para Cloudflare proxy |

## Dev

```bash
git clone https://github.com/erquier/pool-cal
cd pool-cal
cp .env.example .env.local
# Llena tus credenciales
npm install
npm run dev
```
