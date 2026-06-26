# Pool-Cal Rebuild Plan

## Objetivo
Rebuild UI del calendario de piscina con skills frontend, manteniendo funcionalidad Google Calendar.

## Cambios clave
1. **Vista pública** — calendario visible sin login (service account en server-side)
2. **Login solo para reservar** — botón "Reservar" → Google OAuth
3. **UI belleza** — emil-design-eng + impeccable + taste-skill
4. **Quitar textos "Máximo"** — info simplificada
5. **Animaciones estratégicas** — transiciones suaves, stagger en slots

## Arquitectura
- `/` → Página pública con calendario semanal/mensual
- API `/api/events/public` → GET sin auth (service account)
- API `/api/events` → POST/DELETE con auth (Google OAuth)
- El service account ya está configurado y funcional

## Fases
1. Fase A: Refactor API routes (separar pública de autenticada)
2. Fase B: Rebuild UI page con skills frontend
3. Fase C: Quitar textos "Máximo" e info irrelevante
4. Fase D: Docker rebuild + test
