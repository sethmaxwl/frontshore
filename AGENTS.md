# AGENTS

`AGENTS.md` is the canonical repository guide for coding agents. If another AI
tool supports repository instructions, it should defer to this file instead of
creating a parallel rule set.

## Architecture

- `src/app`: top-level wiring only. Keep providers, routing, and other app
  composition here.
- `src/pages`: route entrypoints. Pages compose features and shared UI.
- `src/features`: feature-local UI, stories, tests, and styles.
- `src/components`: shared layout and presentational building blocks.
- `src/styles`: shared tokens and global styles.
- `src/assets`: static assets.

## Guardrails

- Do not add new top-level `src/*.tsx` entrypoints. `src/main.tsx` is the app
  entrypoint and `src/app` owns the application shell.
- Reuse an existing module before adding a new one. If code has only one
  consumer, keep it local instead of extracting it into a shared abstraction.
- Prefer colocated tests, stories, and styles next to the page or feature they
  support.
- When adding CSS styles, prefer `@compiled/react` `css` and `cssMap`. Do
  not introduce deprecated `styled`; keep single-consumer styles local with
  `css()` and use colocated `*.styles.ts` modules when multiple Compiled style
  blocks are reused.
- Do not add new raw `.css` files. Shared tokens, resets, and component styles
  should live in TypeScript modules and use Compiled-backed styling patterns.
- Shared layout styles belong in `src/components/layout` or `src/styles`, not in
  feature-local stylesheets.
- Pages should not import from `src/app` or from other page folders.
- Shared components should stay dependency-light and should not reach into
  feature or page folders.

## Validation

- Route changes should update `src/app/routes/AppRoutes.tsx`.
- Reusable UI changes should update or add a Storybook story.
- Behavioral changes should include a Vitest test. Critical route flows should
  update Playwright coverage when applicable.
- Before finishing, run `yarn check`, `yarn test`, and any relevant UI checks
  such as `yarn build-storybook`, `yarn playwright:test`, or `yarn ci:verify`.

## Scaffolding

- `yarn generate:page <name>` creates a page folder with a component, test, and
  local stylesheet.
- `yarn generate:feature <name> [ComponentName]` creates a feature folder with a
  component, story, test, and stylesheet.
