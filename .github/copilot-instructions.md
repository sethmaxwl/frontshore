# Copilot Instructions

Follow [AGENTS.md](../AGENTS.md) as the canonical repository guide.

- Keep app wiring in `src/app`, route entrypoints in `src/pages`, feature code
  in `src/features`, and shared UI in `src/components`.
- Prefer editing an existing module over adding a new shared abstraction.
- Colocate tests, stories, and styles with the page or feature they support.
- Run `yarn check`, `yarn test`, and the relevant UI checks before wrapping up.
