# AGENTS

`AGENTS.md` is the canonical repository guide for coding agents. If another AI
tool supports repository instructions, it should defer to this file instead of
creating a parallel rule set.

## Architecture

- Frontshore is a React 19, TypeScript 6, Vite 8 single-page app for
  Streamshore rooms, auth, room creation, profiles, admin, and live room
  sessions.
- Runtime dependencies are Mantine 9, React Router 7, TanStack Query 5,
  Phoenix channels, Zod, and Mantine Form. Vite enables the React Compiler.
- `src/main.tsx`: imports Mantine/global styles and mounts the React app. Do
  not add other top-level `src/*.tsx` entrypoints.
- `src/app`: app composition only. Keep providers, routing, route guards,
  auth context, and Mantine theme setup here.
- `src/pages`: lazy-loaded route entrypoints. Route pages default-export their
  component so `src/app/routes/AppRoutes.tsx` can import them with
  `React.lazy`.
- `src/features`: feature-local UI, hooks, reducers, tests, and stories.
  Room-session socket state lives here rather than in page files.
- `src/components`: shared layout, navigation, metadata, and presentational
  building blocks. Shared components should stay dependency-light and should
  not import from feature or page folders.
- `src/lib`: API client functions, Streamshore types, auth/storage utilities,
  and pure helpers.
- `src/config`: environment-derived app configuration. Prefer `appConfig`
  instead of reading `import.meta.env` throughout the app.
- `src/styles/globals.css`: minimal global CSS imported once by `src/main.tsx`.
  Most component styling is done with Mantine props and component-local styles.
- `tests`: Playwright browser and accessibility checks. Browser checks use
  Vite preview fixtures from `tests/fixtures/browserChecks.ts`.

## Guardrails

- Use the `@/*` alias for imports from `src`.
- Keep route registration centralized in `src/app/routes/AppRoutes.tsx`. Add
  route guards with `ProtectedRoute` or `GuestOnlyRoute` when auth behavior is
  part of the route contract.
- When adding a reserved top-level route, also update the create-room reserved
  slug list in `src/pages/rooms/CreateRoomPage.tsx` if room names should not be
  allowed to collide with it.
- Use `PageMetadata` for document title/description updates and `PageHero` for
  the shared page heading layout when it fits the page.
- Pages may use app-owned cross-cutting hooks such as `useAuth`, but should not
  import provider setup, router internals, or other page modules.
- Shared components should stay dependency-light and should not reach into
  feature or page folders.
- Reuse an existing module before adding a new one. If code has only one
  consumer, keep it local instead of extracting it into a shared abstraction.
- Prefer colocated tests and stories next to the page, component, or feature
  they support.
- Prefer Mantine components, style props, and theme tokens for UI. Keep custom
  one-off styles local to the component and avoid broad global selectors.
- This project does not use `@compiled/react`; do not add Compiled styling
  patterns unless the styling stack is intentionally migrated.
- Avoid adding new raw `.css` files. Keep globals in `src/styles/globals.css`;
  if scaffolded code creates local CSS, adapt it to the current Mantine-first
  conventions before committing.
- Use TanStack Query for server state. API calls should live in
  `src/lib/api/streamshore.ts` and use the shared `apiRequest` wrapper from
  `src/lib/api/client.ts`.
- Keep Phoenix channel wiring inside room-session hooks and keep socket state
  transitions in pure reducer utilities with reducer tests.
- React Compiler is enabled, so do not add `useMemo` or `useCallback` by
  default. Use memoization when identity is part of behavior, such as context
  values, or when a measured hot path needs it.
- Follow the linted import style: type-only imports use `import type`, and
  imports are grouped in the order enforced by `eslint.config.js`.

## Validation

- `yarn check` runs typecheck, ESLint, Prettier check, and Knip.
- `yarn test` runs Vitest; `yarn test:coverage` also enforces coverage
  thresholds.
- `yarn playwright:test` runs Playwright against `yarn browser-checks:serve`,
  which builds and previews the app with fixture-backed browser-check APIs.
- `yarn ci:verify` is the main CI gate: check, coverage, build, Storybook
  build, bundle size, and Playwright.
- `yarn perf:lighthouse` runs Lighthouse CI locally.
- Route changes should update `src/app/routes/AppRoutes.tsx`.
- Reusable UI changes should update or add a colocated Storybook story.
- Behavioral changes should include a Vitest test. Critical route flows and
  accessibility-sensitive changes should update Playwright coverage when
  applicable.
- Before finishing, run the narrowest useful validation first, then `yarn ci:verify`.

## Scaffolding

- `yarn generate:page <name>` creates a page folder with a component, test, and
  local stylesheet.
- `yarn generate:feature <name> [ComponentName]` creates a feature folder with a
  component, story, test, and stylesheet.
- The scaffolder currently emits starter CSS and an older page shell import, so
  treat generated files as a starting point and update them to match the
  current Mantine/`RootLayout` conventions before committing.
