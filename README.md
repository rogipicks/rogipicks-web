# 🎯 RogiPicks Web

Plataforma de picks deportivos construida con **Next.js** y **TypeScript**.

## Stack

| Tecnología | Uso |
|---|---|
| Next.js 15 (App Router) | Framework principal |
| TypeScript | Tipado estático |
| CSS Modules + Variables CSS | Estilos |
| Zustand | Estado global |

## Estructura del proyecto

```
src/
├── app/             # Rutas y páginas (App Router)
│   ├── (auth)/      # Login / Register
│   ├── (main)/      # Dashboard, Picks, Leaderboard, Profile
│   └── api/         # API Routes
├── components/
│   ├── ui/          # Button, Card, Badge, Input, Modal
│   ├── layout/      # Navbar, Sidebar, Footer
│   └── features/    # PickCard, LeaderboardTable, LoginForm...
├── hooks/           # usePicks, useAuth, useOdds
├── store/           # Zustand stores (auth, picks)
├── lib/
│   ├── api/         # HTTP client, sports API
│   └── utils/       # formatters, validators, odds
├── types/           # pick.ts, user.ts, sport.ts, api.ts
├── constants/       # routes.ts, config.ts
└── styles/          # variables.css, animations.css
```

## Primeros pasos

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env.local

# 3. Arrancar en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Comandos útiles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm run start` | Inicia en producción |
| `npx tsc --noEmit` | Comprueba tipos sin compilar |

## Deploy en Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Sube el código a GitHub
2. Importa el repo en [vercel.com](https://vercel.com)
3. Configura las variables de entorno de `.env.example`
4. ¡Listo! Cada `git push` redespliega automáticamente ✅
