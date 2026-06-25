# Repository Guidelines

## Project Structure & Module Organization

This repository is currently a product/design seed for **GoodNight Guard**, a Chrome/Edge extension that reminds users to sleep and blocks distracting sites after bedtime.

- `prd.md` is the product source of truth. Read it before changing scope or behavior.
- `DESIGN.md` defines the Nightfall UI visual system, copy tone, and interaction rules.
- `ui.example.js` is a React/Tailwind/Lucide reference prototype for popup, block page, and options UI.

When implementation is added, keep extension code under `src/` with boundaries such as `src/background/`, `src/content/`, `src/popup/`, `src/options/`, `src/block/`, and `src/shared/`. Put assets in `public/` or `assets/`, and tests in `tests/` or beside the covered module.

## Build, Test, and Development Commands

No package manifest or build system is checked in yet. When one is introduced, define canonical scripts in `package.json`. Expected commands:

- `npm install` or `pnpm install`: install dependencies.
- `npm run dev`: run the extension UI locally on a non-default port.
- `npm run build`: produce the browser extension bundle.
- `npm test`: run the automated test suite.
- `npm run lint`: run formatting and static checks.

Do not invent local-only commands without documenting them.

## Coding Style & Naming Conventions

Prefer TypeScript unless the project explicitly stays JavaScript-only. Use React components, Tailwind classes aligned with `DESIGN.md`, and Lucide icons for controls. Name components in `PascalCase`, hooks as `useSomething`, utility files in `camelCase` or `kebab-case`, and extension entry folders by browser role, for example `background`, `content`, `popup`, `options`, and `block`.

## Testing Guidelines

Add tests with every behavioral change once a framework exists. Prioritize rule evaluation, schedule calculations, unlock friction, storage migration, and UI flows. Use behavior names such as `blocksRestrictedSiteAfterBedtime` or `BlockPage.unlockCountdown.test.tsx`. For UI work, include at least one browser-level verification path.

## Commit & Pull Request Guidelines

This directory is not currently a Git repository, so no existing commit convention is available. Use short, imperative messages such as `Add bedtime schedule model` or `Implement block page unlock flow`. Pull requests should include the problem, solution, verification commands, screenshots for UI changes, and links to relevant sections of `prd.md` or `DESIGN.md`.

## Agent-Specific Instructions

Keep agent-facing guidance in English and user-facing product copy in Chinese unless a task says otherwise. Preserve the calm, dark-first, low-stimulation product direction from `DESIGN.md`. Record ambiguity or design friction in documentation or issue notes instead of burying it in code comments.
