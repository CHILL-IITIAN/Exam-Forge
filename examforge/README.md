# ExamForge

The exam-performance operating system for serious aspirants.

## Phase 1 — Foundation (current)
- Design tokens, app shell, sidebar, landing page, dashboard skeleton.

## Run locally
```bash
npm install
npm run dev
```

## Architecture
- React 18 + Vite + TypeScript
- Tailwind CSS with CSS-variable design tokens (`src/styles/tokens.css`)
- React Router for navigation
- Zustand (added in later phases) for state
- Framer Motion for subtle motion
- Recharts (analytics phase)

## Folder map
```
src/
  app/                # App router/providers
  components/
    ui/               # Primitives
    layout/           # Shell + sidebar
  features/
    auth/  dashboard/  tests/  exam/  results/  reflection/  analytics/  history/
  lib/                # storage, time, ids
  stores/             # Zustand stores
  styles/             # tokens.css + globals.css
  types/              # Shared types
```

## Next phase
Auth + guest mode + persistent session, then dashboard with real metrics.
