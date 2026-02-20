# Project Structure

## Apps

- [`@my-monorepo/api`](../apps/api) - Node.js runtime API using Hono + tRPC, with shared AI/logging/utilities. Dev server via `tsx watch`.
- [`@my-monorepo/web`](../apps/web) - React app built with TanStack Router/React Query/TanStack Start on Vite.
- [`@my-monorepo/tauri`](../apps/tauri) - Tauri v2 desktop app (Rust core) with a React + Vite frontend.
- [`@my-monorepo/mobile`](../apps/mobile) - Expo (React Native) app using Expo Router.

## Packages

- [`@my-monorepo/tsconfig`](../packages/tsconfig) - Shared TypeScript base configs (base, hono, react-app, react-library).
- [`@my-monorepo/utils`](../packages/utils) - Cross-app helpers for crypto/format/validation and shared libs (zod, validator, date-fns, superjson, jose, etc.).
- [`@my-monorepo/env`](../packages/env) - Type-safe environment variable validation using Zod.
- [`@my-monorepo/i18n`](../packages/i18n) - i18next setup with locale bundles and React hooks.
- [`@my-monorepo/ui`](../packages/ui) - Shared UI components/styles (shadcn/ui, Radix, Tailwind, CVA/clsx).
- [`@my-monorepo/logger`](../packages/logger) - Pino-based logger with contextual helpers.
- [`@my-monorepo/auth`](../packages/auth) - Authentication layer using better-auth with Prisma adapter.
- [`@my-monorepo/db`](../packages/db) - Prisma client wrapper for database access.
- [`@my-monorepo/ai`](../packages/ai) - AI SDK wrapper (ai-sdk + OpenAI-compatible provider).

## Dependency Graph

```mermaid
graph BT
    subgraph Packages
        TSCONFIG[tsconfig]
        UTILS[utils]
        ENV[env]
        I18N[i18n]
        UI[ui]
        LOGGER[logger]
        DB[db]
        AUTH[auth]
        AI[ai]
    end

    subgraph Apps
        API[api]
        WEB[web]
        TAURI[tauri]
        MOBILE[mobile]
    end

    TSCONFIG --> UTILS & ENV & I18N & UI & LOGGER & DB & AUTH & AI
    UTILS --> AUTH & AI & API
    ENV --> AUTH & API & WEB & TAURI
    DB --> AUTH & API
    LOGGER --> API
    AI --> API
    AUTH --> API & WEB & TAURI
    I18N --> WEB & TAURI & MOBILE
    UI --> WEB & TAURI
```

> All packages depend on `tsconfig`. Apps use `api` as a devDependency for tRPC type inference.