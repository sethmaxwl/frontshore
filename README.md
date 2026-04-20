# Frontshore

Frontshore is a React 19 + TypeScript + Vite starter that already includes the tooling most teams add once a project starts growing: type-aware linting, formatting, unit tests, browser tests, Storybook, accessibility checks, coverage gates, bundle budgets, Lighthouse CI, dependency automation, and Git hooks.

## Stack

- React 19
- TypeScript 6
- Vite 8 with the React Compiler
- React Router 7
- Vitest + Testing Library
- Playwright
- Storybook
- ESLint + Prettier
- Knip
- Lighthouse CI
- Size Limit

## Requirements

- Node `v24.15.0` from [.nvmrc](./.nvmrc)
- Corepack-enabled Yarn 4

## Getting Started

```bash
nvm install
corepack enable
yarn install
yarn dev
```

## Useful Scripts

```bash
yarn dev              # Start the Vite dev server
yarn check            # Typecheck, lint, and format-check
yarn test             # Run unit tests
yarn test:coverage    # Run unit tests with coverage thresholds
yarn playwright:install # Install Chromium for browser checks
yarn playwright:test  # Run end-to-end and accessibility browser tests
yarn storybook        # Start Storybook
yarn build-storybook  # Build Storybook
yarn knip             # Find unused files, exports, and dependencies
yarn size             # Build and enforce bundle-size budgets
yarn perf:lighthouse  # Build and run Lighthouse CI locally
yarn ci:verify        # Run the main quality gate used in CI, including Playwright
```

## Automation

- Git hooks:
  - `pre-commit` runs `lint-staged`
  - `pre-push` runs `yarn check && yarn test:coverage && yarn knip`
- GitHub Actions:
  - quality checks, including Playwright browser coverage
  - Lighthouse CI reports
- Dependabot:
  - npm dependency updates
  - GitHub Actions updates
