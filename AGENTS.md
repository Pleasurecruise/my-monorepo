# Repository Guidelines

## Project Structure & Module Organization
- `apps/` hosts the runnable products with their frameworks:
  - `api/`: Node.js runtime, Hono HTTP server (`@hono/node-server`), tRPC API layer (uses `@my-monorepo/ai`, `@my-monorepo/logger` and `@my-monorepo/utils`). Dev server via `tsx watch`.
  - `web/`: React + TanStack Router/React Query/React Start, built with Vite (uses `ui`, `theme`, `i18n`).
  - `tauri/`: Tauri v2 desktop app (Rust core in `apps/tauri/src-tauri`) with a React + Vite frontend (uses `ui`, `theme`, `i18n`).
  - `mobile/`: Expo (React Native) with Expo Router (uses `i18n`).
- `packages/` contains shared libraries and their roles:
  - `tsconfig/`: shared TS configs (`base`, `hono`, `react-app`, `react-library`).
  - `utils/`: cross-app helpers for crypto/formatting/validation, plus shared libs (zod, validator, date-fns, superjson, etc.).
  - `i18n/`: i18next setup, locale exports, and React hooks.
  - `ui/`: shared UI components and styles (shadcn/ui, Radix, Tailwind, CVA utilities).
  - `theme/`: theme provider + helpers for light/dark/system.
  - `logger/`: pino-based logger with context helpers.
  - `ai/`: AI SDK wrapper (ai-sdk + OpenAI-compatible provider) with resumable streaming support.
  - `memory/`: Redis-backed memory/context store for AI streams.
- `docs/README.md` documents the dependency graph and how apps consume shared packages.

## Build, Test, and Development Commands
- `pnpm install` installs dependencies (pnpm is the package manager).
- `pnpm run dev:api|dev:web|dev:tauri|dev:expo` runs a single app via Turborepo.
- `pnpm run build:web`, `pnpm run build:tauri`, `pnpm run build:ui` build key targets.
- `pnpm run test` runs all Vitest suites in the workspace; `pnpm run test:coverage` enables coverage.
- `pnpm run check-types` runs TypeScript checks; `pnpm run lint` runs `oxlint` plus `manypkg check`.
- `pnpm run format` / `pnpm run format:check` apply or verify formatting.
- `pnpm run precommit` is the full gate (format check, lint, types, tests).

## Coding Style & Naming Conventions
- Indentation is tabs in TypeScript/TSX (see existing source files); keep double quotes and let `oxfmt` enforce details.
- Use `oxlint` for linting; avoid manual reformatting—run `pnpm run format` instead.
- Workspace packages are imported as `@my-monorepo/<name>` (e.g., `@my-monorepo/ui`).
- Internal workspace dependencies use the `workspace:*` protocol in `package.json`.

## Testing Guidelines
- Tests use Vitest and typically live alongside code as `*.test.ts` (for example, `apps/web/src/app.test.ts`).
- Prefer focused unit tests for shared packages; app tests can cover integration of `api`, `i18n`, and `theme`.
- Use `pnpm run test` for full runs or `vitest run` inside a package for targeted runs.

## Commit & Pull Request Guidelines
- Commit messages follow Conventional Commits observed in history (`feat: ...`, `fix: ...`).
- PRs should include a short summary, testing notes, and screenshots for UI-facing changes.
- Link relevant issues when applicable and call out any follow-up work.

## Security & Configuration Tips
- `.env` files are part of Turborepo global dependencies; keep secrets out of git and document required variables in PRs.
- Required env variables are documented in `.env.example` at the repo root.