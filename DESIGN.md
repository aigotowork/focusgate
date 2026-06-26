# FocusGate / 守界 Design System

This document is the visual source of truth for FocusGate / 守界. The current system is **Gate Daylight UI**: light-first, restrained, and calm enough for bedtime, work-focus, and digital-withdrawal boundaries. The default sleep rule group may still use “晚安守护” copy, but global product chrome must use FocusGate / 守界.

## Brand Identity

- Global product name: `FocusGate / 守界`.
- Main slogan: `该专注时，守住你的注意力边界。`
- Legacy names `专注边界` and `Focus Boundary` may appear only in migration notes.
- The default sleep rule group remains `晚安守护`.
- Use the gate-lock mark from `src/shared/brand.ts` and `public/icon.svg` for product chrome, manifest icons, welcome page, popup header, and subtle block/handoff branding.

## Principles

1. **Light-first calm**
   - First-party extension pages use a refined light theme by default.
   - Avoid saturated decoration, large gradients, and high-stimulation motion.
2. **Clear boundaries**
   - A block page must immediately show which rule group is active, which site was blocked, and what the safer next action is.
   - Do not hardcode sleep-only copy outside the default sleep template.
3. **Intentional friction**
   - Helpful actions such as closing the page or opening a handoff workflow should be visually dominant.
   - Temporary unlock remains slower and visually quieter, with countdown, confirmation text, limits, and optional reason capture.
4. **Trustworthy customization**
   - Per-group titles, descriptions, tones, primary actions, and static custom HTML are supported.
   - Stored HTML must stay sandboxed and separate from unlock controls.

## Color System

Use a soft neutral base with controlled FocusGate accents:

| Role | Color | Usage |
| --- | --- | --- |
| Page background | `#f7f7fb`, `stone-50` | Main app canvas and welcome surface |
| Surface | `white/90`, `#fffdf8` | Panels, cards, iframes, form controls |
| Border | `slate-200`, `slate-300` | Component separation |
| Primary text | `slate-950` | Titles and key values |
| Body text | `slate-700`, `slate-600` | Form labels and body copy |
| Muted text | `slate-500` | Helper text and metadata |
| Gate Indigo | `#6366f1`, `indigo-600` | Main buttons, selected states, brand mark |
| Focus Violet | `#8b5cf6` | Brand gradients and secondary emphasis |
| Success | `emerald-700` | Allowed or positive states |
| Warning | `amber-700` | Upcoming boundary or focus warning |
| Danger | `rose-700` | Blocking, delete, and unlock-risk states |

Use soft tinted backgrounds such as `indigo-50`, `violet-50`, `emerald-50`, or `rose-50` for emphasis. Do not let large app regions become monochrome purple, dark blue, beige, or brown.

## Typography and Layout

- Font stack: `Inter`, Apple system fonts, `PingFang SC`, `Microsoft YaHei`, sans-serif.
- Keep letter spacing normal. Do not scale type with viewport width.
- Use `text-2xl` to `text-5xl` only for page-level headings and block-page titles.
- Cards and controls should use `rounded-lg` or `rounded-xl`; avoid nesting cards inside cards.
- Prefer subtle borders and the shared `shadow-soft` token over heavy shadows.

## Components

- **Buttons:** Primary buttons use `bg-indigo-600 text-white`; secondary buttons use white surfaces, slate text, and slate borders. Destructive actions use rose tinting.
- **Fields:** Use the shared `.field` class for inputs, selects, and textareas. It provides light surface, slate text, and an accessible indigo focus ring.
- **Panels:** Use white or near-white surfaces with `border-slate-200` and `shadow-soft`.
- **Segmented choices:** Selected items use `border-indigo-300 bg-indigo-50 text-indigo-950`; unselected items use white surfaces and slate text.
- **Brand mark:** Use the gate-lock mark for global product chrome and the welcome page. Do not use moon or shield icons as the product identity.
- **Icons:** Use Lucide icons for controls and section identity. Icons should clarify actions, not decorate large empty areas.

## Block Page Tones

Rule groups choose a tone through `RuleGroup.blockPage.tone`:

- `sleep`: indigo calm, suitable for bedtime boundaries.
- `focus`: sky/amber clarity, suitable for work or study time.
- `calm`: emerald restraint, suitable for general moderation.
- `strict`: rose emphasis, suitable for high-risk sites.

Each tone changes accents and default benefit/cost copy, but all built-in pages remain light-first and low-stimulation. Custom block HTML and handoff HTML render inside sandboxed iframes and may bring their own styling.

## Motion and Accessibility

- Use simple color transitions for hover and focus states.
- Avoid animation that flashes, bounces, or increases stimulation.
- Maintain readable contrast for slate text on warm light backgrounds.
- Ensure focus states are visible on buttons, fields, segmented controls, and destructive actions.

## Implementation Notes

- The shared base lives in `src/styles/global.css`; Tailwind extension tokens live in `tailwind.config.js`.
- Brand constants and the shared mark live in `src/shared/brand.ts`; React brand components live in `src/shared/brand-ui.tsx`.
- Runtime UI lives in `src/welcome/`, `src/popup/`, `src/options/`, `src/block/`, and `src/handoff/`.
- `welcome.html` is the branded home surface and first-install entry point.
- Default block-page templates and HTML sandbox helpers live in `src/shared/block-page.ts`.
- Historical UI sketches are archived under `project-docs/archive/` and are not implementation guidance.
