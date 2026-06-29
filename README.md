# FLoC Apps

Zero-infra PWA apps — todos, food, finance — for people who want to own their own data without
running a server or managing an account. Fork of [home-apps](https://github.com/nickbenes/home-apps)
with the data layer swapped from server-side SQLite to client-side IndexedDB.

See [home-apps#115](https://github.com/nickbenes/home-apps/issues/115) for the architecture
decision and roadmap.

## Stack

- Vite + React 19 + TypeScript
- Tailwind v4 (`@tailwindcss/vite`)
- [Dexie.js](https://dexie.org/) over IndexedDB — no server, no SQLite
- `vite-plugin-pwa` — installable on iOS/Android home screen, offline-capable for loaded data

## Status

Architecture scaffold only — no feature modules yet. `src/db.ts` proves the IndexedDB wiring;
real tables get added when the first module (todos) is built.

## Principles

- Every module ships CSV + JSON import/export from day one — non-negotiable.
- No server-side persistence, ever. If a feature needs a server, it doesn't belong here.
- Encrypted export (AES-GCM via SubtleCrypto, password-based) for moving data between devices.
- Keep the UI close to home-apps's working version — port, don't redesign.

## Scripts

```
npm run dev      # start dev server
npm run build    # type-check + production build
npm run preview  # preview the production build
npm run lint     # oxlint
```
