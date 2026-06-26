# Repository Guidelines

## Project Structure & Module Organization

This repository is a Manifest V3 Chrome/Edge extension for **GoodNight Guard**, a bedtime website blocker with React UI surfaces and testable shared rules.

- `prd.md` is the product source of truth. Read it before changing scope or behavior.
- `DESIGN.md` defines the Nightfall UI visual system, copy tone, and interaction rules.
- `src/shared/` contains schedule, domain, storage, and event logic.
- `src/background/` contains MV3 service worker wiring.
- `src/popup/`, `src/options/`, and `src/block/` are independent React entry points.
- `tests/` contains Vitest unit tests and Playwright smoke tests.

Keep static extension assets in `public/`. Build output goes to ignored `dist/`.

## Build, Test, and Development Commands

Canonical commands are defined in `package.json`:

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: run the extension UI locally on a non-default port.
- `npm run typecheck`: run TypeScript checks.
- `npm test`: run Vitest unit tests for shared rules.
- `npm run test:e2e`: run Playwright smoke tests for popup, options, and block pages.
- `npm run build`: produce the browser extension bundle.
- `npm run lint`: alias for type checking.

Do not invent local-only commands without documenting them.

## Coding Style & Naming Conventions

Use TypeScript, React, Tailwind classes aligned with `DESIGN.md`, and Lucide icons for controls. Name components in `PascalCase`, hooks as `useSomething`, utilities in `camelCase` or `kebab-case`, and extension folders by browser role.

## Testing Guidelines

Add tests with every behavioral change. Prioritize rule evaluation, schedule calculations, unlock expiry, storage migration, and UI flows. Use behavior names such as `blocksRestrictedSiteAfterBedtime`. Keep browser-agnostic logic in `src/shared/` so Vitest can cover it directly.

## Commit & Pull Request Guidelines

Use short, imperative commit messages such as `Add bedtime schedule model` or `Implement block page unlock flow`. Pull requests should include the problem, solution, verification commands, screenshots for UI changes, and links to relevant sections of `prd.md`, `DESIGN.md`, or `docs/architecture.md`.

## Agent-Specific Instructions

Keep agent-facing guidance in English and user-facing product copy in Chinese unless a task says otherwise. Preserve the calm, dark-first, low-stimulation product direction from `DESIGN.md`. Record ambiguity or design friction in documentation or issue notes instead of burying it in code comments.
