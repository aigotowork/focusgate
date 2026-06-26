# Store Launch Resources

This folder contains Chrome Web Store launch copy and reviewer-facing resource drafts for FocusGate / 守界.

Source-of-truth links:

- Product scope: [`../../prd.md`](../../prd.md)
- Current MVP surface summary: [`../../README.md`](../../README.md)
- Visual and copy direction: [`../../DESIGN.md`](../../DESIGN.md)
- Runtime permissions and data model: [`../architecture.md`](../architecture.md)
- Chrome Web Store policy index: <https://developer.chrome.com/docs/webstore/program-policies>
- Chrome Web Store publishing flow: <https://developer.chrome.com/docs/webstore/publish>
- Chrome Web Store image guidance: <https://developer.chrome.com/docs/webstore/images>
- Chrome Web Store privacy policy requirements: <https://developer.chrome.com/docs/webstore/program-policies/privacy>
- Chrome Web Store limited-use policy: <https://developer.chrome.com/docs/webstore/program-policies/limited-use>

Start here:

- [`publishing-checklist.md`](publishing-checklist.md): launch runbook covering build, package, dashboard fields, privacy declarations, upload assets, and reviewer test instructions.
- [`dashboard-fields.md`](dashboard-fields.md): copy-paste values for the Chrome Web Store Developer Dashboard.
- [`automation.md`](automation.md): local and GitHub Actions Chrome Web Store API upload/submission flow.
- [`submission-metadata.md`](submission-metadata.md): final non-secret publisher metadata and listing decisions.
- [`store-listing-draft.md`](store-listing-draft.md): Chinese user-facing Chrome Web Store listing copy.
- [`privacy-policy-draft.md`](privacy-policy-draft.md): Chinese public privacy policy draft mirror. The public GitHub Pages source is `../../docs/privacy/index.html`.
- [`permission-justification-draft.md`](permission-justification-draft.md): Reviewer-facing permission justifications aligned to the current Manifest V3 permissions.
- [`chrome-web-store-visual-plan.md`](chrome-web-store-visual-plan.md): visual positioning, store asset requirements, and screenshot scene plan.
- [`screenshot-capture-runbook.md`](screenshot-capture-runbook.md): deterministic screenshot capture workflow and final screenshot filenames.

Generated assets:

- Source templates live in [`../../public/store`](../../public/store) and end with `.source.svg`.
- Promotional PNGs are generated with `npm run store:assets`.
- Final upload screenshots are generated with `npm run store:screenshots` and named `screenshot-01-...-1280x800.png` through `screenshot-05-...-1280x800.png`.
- Extension upload zips are generated with `npm run package:store` under `artifacts/chrome-web-store/`.

Agent note: keep user-facing store and policy copy in Chinese unless the submission target changes. Keep reviewer notes precise, factual, and tied to implemented behavior. Do not broaden claims beyond the current extension behavior without updating the product and architecture sources of truth.
