# Source Guidelines

## Module Boundaries

- `shared/` contains browser-agnostic scheduling, site matching, defaults, and storage helpers. Keep decision logic here so it can be unit tested without extension runtime APIs.
- `background/` contains Manifest V3 runtime wiring only: install hooks, navigation observation, and redirects.
- `popup/`, `options/`, and `block/` are separate React entry points. They may import `shared/`, but should not import from each other.
- `styles/` contains global Tailwind setup and shared CSS primitives.

## Implementation Rules

Use Chinese for user-facing product copy and English for code comments or agent guidance. Follow `DESIGN.md` for Nightfall UI: dark-first surfaces, low-stimulation motion, clear blocking state, and intentional friction for unlock actions.

When changing blocking behavior, update tests in `tests/` first or in the same change. Prioritize deterministic functions in `shared/` over direct browser API tests.
