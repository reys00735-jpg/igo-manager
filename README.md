# IGO Manager

IGO Manager es una aplicación móvil y un panel administrativo para ayudar a emprendedores a priorizar iniciativas con la metodología IGO y ofrecer data estratégica a Dinámica del Oriente.

## Stack
- App móvil: React Native + Expo
- Panel administrativo: React + Vite
- Base de datos: Supabase

## Requisitos previos
- Node.js 20+
- npm
- Cuenta en Supabase
- Expo Go o EAS para pruebas móviles

## Variables de entorno

### App móvil
Crear [app/.env.example](app/.env.example) como [app/.env](app/.env) con:
- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY

### Panel administrativo
Crear [admin-panel/.env.example](admin-panel/.env.example) como [admin-panel/.env](admin-panel/.env) con:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_SUPABASE_SERVICE_KEY

## Levantar el panel administrativo
```bash
cd admin-panel
npm install
npm run dev
```

## Levantar la app móvil
```bash
cd app
npm install
npx expo start
```

## Base de datos
El esquema base está en [supabase/schema.sql](supabase/schema.sql) y las migraciones iniciales en [supabase/migrations](supabase/migrations).

## Despliegues
- El panel web puede publicarse con Vercel o Netlify.
- La app puede compilarse con EAS para Android e iOS.
