# my-monorepo

My monorepo used to start everything :-)

## Tech stack

The toolchain used here is sourced from the [VoidZero](https://voidzero.dev/about) ecosystem.

- [pnpm](https://pnpm.io/) - package manager (workspace-native, fast monorepo installs)
- [vite-plus](https://github.com/voidzero-dev/vite-plus) - unified toolchain (`vp` CLI) bundling vite, vitest, rolldown, oxlint, and oxfmt
- [tsgo](https://github.com/microsoft/typescript-go) - compile ts to js
- [turbo](https://turborepo.dev/docs/reference/configuration) - monorepo management
- [typescript](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) - main programming language

## TODO List

- [x] Add ai-sdk package
- [x] Set up CI/CD pipeline
- [x] Add authentication package
- [x] Add database package
- [x] Add ui-native package (React Native Reusables + NativeWind)
- etc.

## References

- [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo)
- [midday](https://github.com/midday-ai/midday)