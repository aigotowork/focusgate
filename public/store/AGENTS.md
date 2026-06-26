# Store Asset Guidance

This directory contains Chrome Web Store visual source assets and exported store images.

- Files ending in `.source.svg` are editable source templates, not final upload assets.
- Final Chrome Web Store uploads should be exported PNG or JPG files with dimensions documented in `project-docs/store/chrome-web-store-visual-plan.md`.
- Promotional PNGs are generated from source SVGs with `npm run store:assets`; do not hand-edit the generated PNG files.
- Keep visual text in Chinese unless a task explicitly creates a localized non-Chinese store set.
- Keep source SVGs maintainable: name key groups, keep dimensions explicit, and avoid embedding personal or environment-specific data.
- Do not place real browser screenshots here until they have been reviewed for private data.
- Do not edit app code or manifest files from this directory.
