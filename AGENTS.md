# Repository Guidelines

## Project Structure & Module Organization
- `apps/` hosts the runnable products with their frameworks:
  - `api/`: Bun runtime, Hono HTTP server, tRPC API layer (uses `@my-monorepo/logger` and `@my-monorepo/utils`).
  - `web/`: React + TanStack Router/React Query/React Start, built with Vite (uses `ui`, `theme`, `i18n`).
  - `tauri/`: Tauri v2 desktop app (Rust core in `apps/tauri/src-tauri`) with a React + Vite frontend (uses `ui`, `theme`, `i18n`).
  - `mobile/`: Expo (React Native) with Expo Router (uses `i18n`).
- `packages/` contains shared libraries and their roles:
  - `tsconfig/`: shared TS configs (`base`, `hono`, `react-app`, `react-library`).
  - `utils/`: cross-app helpers for crypto/formatting/validation, plus shared libs (zod, validator, date-fns, etc.).
  - `i18n/`: i18next setup, locale exports, and React hooks.
  - `ui/`: shared UI components and styles (shadcn/ui, Radix, Tailwind, CVA utilities).
  - `theme/`: theme provider + helpers for light/dark/system.
  - `logger/`: pino-based logger with context helpers.
- `docs/README.md` documents the dependency graph and how apps consume shared packages.

## Build, Test, and Development Commands
- `bun install` installs dependencies (Bun is the package manager/runtime).
- `bun run dev:api|dev:web|dev:tauri|dev:expo` runs a single app via Turborepo.
- `bun run build:web`, `bun run build:tauri`, `bun run build:ui` build key targets.
- `bun run test` runs all Vitest suites in the workspace; `bun run test:coverage` enables coverage.
- `bun run check-types` runs TypeScript checks; `bun run lint` runs `oxlint` plus `manypkg check`.
- `bun run format` / `bun run format:check` apply or verify formatting.
- `bun run precommit` is the full gate (format check, lint, types, tests).

## Coding Style & Naming Conventions
- Indentation is tabs in TypeScript/TSX (see existing source files); keep double quotes and let `oxfmt` enforce details.
- Use `oxlint` for linting; avoid manual reformatting—run `bun run format` instead.
- Workspace packages are imported as `@my-monorepo/<name>` (e.g., `@my-monorepo/ui`).

## Testing Guidelines
- Tests use Vitest and typically live alongside code as `*.test.ts` (for example, `apps/web/src/app.test.ts`).
- Prefer focused unit tests for shared packages; app tests can cover integration of `api`, `i18n`, and `theme`.
- Use `bun run test` for full runs or `vitest run` inside a package for targeted runs.

## Commit & Pull Request Guidelines
- Commit messages follow Conventional Commits observed in history (`feat: ...`, `fix: ...`).
- PRs should include a short summary, testing notes, and screenshots for UI-facing changes.
- Link relevant issues when applicable and call out any follow-up work.

## Security & Configuration Tips
- `.env` files are part of Turborepo global dependencies; keep secrets out of git and document required variables in PRs.
