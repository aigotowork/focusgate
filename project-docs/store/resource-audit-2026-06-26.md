# Chrome Web Store Resource Audit

Audit date: 2026-06-26

Scope: launch resources for FocusGate / 守界, including Manifest V3 metadata, Chrome Web Store images, listing copy, privacy and permission materials, reviewer instructions, build/package outputs, and rejection-risk scans.

Official references:

- Chrome Web Store publishing flow: <https://developer.chrome.com/docs/webstore/publish>
- Chrome Web Store image requirements: <https://developer.chrome.com/docs/webstore/images>
- Chrome Web Store privacy fields: <https://developer.chrome.com/docs/webstore/cws-dashboard-privacy>
- Chrome Web Store program policies: <https://developer.chrome.com/docs/webstore/program-policies>

## Verdict

Status: mostly ready, with GitHub Pages activation, trusted tester setup, and Chrome Web Store API credentials still blocking final automated submission.

The core launch package, visual assets, listing copy, privacy page, permission justifications, reviewer notes, screenshot workflow, packaging workflow, Dashboard field guide, and API automation scripts are present. The project should not be submitted yet because GitHub Pages must be enabled, the public URLs must be checked after deployment, trusted tester emails must be configured, and API credentials must be provided before automation can run.

## Resource Inventory

| Area | Status | Evidence |
| --- | --- | --- |
| Manifest V3 | Pass | `public/manifest.json` and `dist/manifest.json` use `manifest_version: 3`. |
| Manifest metadata | Pass | Name, short name, version, description, icons, action, options page, background worker, and content script are present. |
| Extension icons | Pass | `public/icon-16.png`, `icon-32.png`, `icon-48.png`, and `icon-128.png` match required dimensions. |
| Store screenshots | Pass | Five final PNG screenshots exist at `1280x800` under `public/store/`. |
| Small promo image | Pass | `public/store/promo-tile-440x280.png` exists and is `440x280`. |
| Marquee promo image | Pass | `public/store/marquee-1400x560.png` exists and is `1400x560`; optional but ready. |
| Listing copy | Pass | `project-docs/store/store-listing-draft.md` is complete for a Chinese listing. Listing name is `守界 - FocusGate`. |
| Privacy policy | Pass after Pages deploy | Public source lives at `docs/privacy/index.html`; target URL is `https://aigotowork.github.io/focusgate/privacy/`. |
| Permission justifications | Pass with review risk | `project-docs/store/permission-justification-draft.md` covers every manifest permission. `<all_urls>` remains broad and must be justified exactly as written. |
| Submission metadata | Pass | `project-docs/store/submission-metadata.md` contains publisher, support, homepage, privacy URL, draft item ID, visibility, and region decisions. |
| Dashboard field guide | Pass | `project-docs/store/dashboard-fields.md` contains copy-paste values for listing, privacy, permissions, distribution, and reviewer instructions. |
| Reviewer instructions | Pass | `project-docs/store/publishing-checklist.md` includes a concrete reviewer test flow. |
| Screenshot runbook | Pass | `project-docs/store/screenshot-capture-runbook.md` plus `scripts/capture-store-screenshots.mjs` can reproduce the five screenshots. |
| Packaging script | Pass | `npm run package:store` creates `artifacts/chrome-web-store/focusgate-0.1.0.zip`. |
| Zip structure | Pass | Zip root contains `manifest.json`; no nested `dist/` wrapper. Store assets and source maps are excluded from the upload zip. |
| API automation | Ready, needs credentials | `scripts/cws-api.mjs` and `.github/workflows/chrome-web-store.yml` support upload, submit, release, status, and deploy percentage commands. Requires `CWS_PUBLISHER_ID` plus service account or OAuth credentials. |

## Verified Dimensions

```text
public/icon-16.png                              16x16
public/icon-32.png                              32x32
public/icon-48.png                              48x48
public/icon-128.png                             128x128
public/store/promo-tile-440x280.png             440x280
public/store/marquee-1400x560.png               1400x560
public/store/screenshot-01-welcome-1280x800.png 1280x800
public/store/screenshot-02-options-1280x800.png 1280x800
public/store/screenshot-03-popup-1280x800.png   1280x800
public/store/screenshot-04-block-1280x800.png   1280x800
public/store/screenshot-05-handoff-1280x800.png 1280x800
```

## Manual Blockers

1. Enable GitHub Pages in repository settings:
   - Source: deploy from a branch.
   - Branch: `main`.
   - Folder: `/docs`.

2. Confirm these public URLs load after GitHub Pages publishes:
   - `https://aigotowork.github.io/focusgate/`
   - `https://aigotowork.github.io/focusgate/support/`
   - `https://aigotowork.github.io/focusgate/privacy/`

3. Add tester emails in the Chrome Web Store trusted tester setup before the first test release.

4. Provide Chrome Web Store API automation credentials:
   - `CWS_PUBLISHER_ID`
   - `CWS_SERVICE_ACCOUNT_JSON` or `CWS_SERVICE_ACCOUNT_FILE`
   - GitHub Actions secrets if CI publishing should be used

## Review Risks

- Broad host access: `host_permissions: ["<all_urls>"]` and HTTP(S) content-script matches are justified by user-defined arbitrary restricted domains and reminder overlays. This is still the highest review-friction item.
- Privacy disclosure: the extension processes domain-level URL/network activity for blocking and stats. The dashboard disclosure must match the local-first privacy policy exactly.
- Data disclosure: do not mark every user-data category as "No" if the dashboard asks whether the extension handles browsing activity. Use the conservative wording in `project-docs/store/dashboard-fields.md`: domain-level browsing activity and user actions are processed locally for extension functionality, not uploaded, sold, or used for ads.
- Remote code: no remote executable code patterns were found. In the dashboard, select that the extension does not execute remote code.
- Listing claims: current copy avoids unsupported claims such as cloud sync, accounts, mobile blocking, uninstall prevention, AI recommendations, or impossible-to-bypass blocking. Keep that discipline during final edits.
- Visuals: screenshots show real UI and no private data. The options screenshot is acceptable, but a future optimization could expose more of the website list or strength settings for clearer conversion.

## Verification Commands Run

```bash
npm run store:assets
npm run typecheck
npm run package:store
npm test
npm run test:e2e
npm run store:screenshots
node scripts/cws-api.mjs
node --check scripts/cws-api.mjs
node scripts/cws-api.mjs submit --publish-type=TRUSTED_TESTERS
proxy curl --globoff 'https://chromewebstore.googleapis.com/$discovery/rest?version=v2'
python3 -m http.server 51937 --directory docs
```

Results:

- `npm run store:assets`: passed.
- `npm run typecheck`: passed.
- `npm run package:store`: passed and generated `artifacts/chrome-web-store/focusgate-0.1.0.zip`.
- `npm test`: 5 files passed, 49 tests passed.
- `npm run test:e2e`: 13 Playwright tests passed.
- `npm run store:screenshots`: passed and regenerated all five store screenshots.
- `node scripts/cws-api.mjs`: prints the local CWS API helper usage. Credential-backed API calls were not run because `CWS_PUBLISHER_ID` and API credentials have not been provided yet.
- `node --check scripts/cws-api.mjs`: passed.
- `node scripts/cws-api.mjs submit --publish-type=TRUSTED_TESTERS`: intentionally fails with the expected API v2 guidance because trusted testers is a Dashboard Distribution setting, not a CWS API `publishType`.
- CWS API v2 discovery check passed. `publishType` supports `PUBLISH_TYPE_UNSPECIFIED`, `DEFAULT_PUBLISH`, and `STAGED_PUBLISH`; upload path is `/upload/v2/{+name}:upload`; publish path is `v2/{+name}:publish`.
- Local GitHub Pages static check passed through `127.0.0.1:51937`: `/`, `/support/`, and `/privacy/` all returned HTTP `200`.

Zip checks:

- Zip root contains `manifest.json`.
- Zip root does not contain a nested `dist/` directory.
- Zip excludes source maps, `store/`, and `*.source.svg`.
- Upload manifest values: `manifest_version: 3`, `name: 守界 - FocusGate`, `short_name: 守界`, `version: 0.1.0`.

## Upload-Ready Files

```text
artifacts/chrome-web-store/focusgate-0.1.0.zip
public/store/screenshot-01-welcome-1280x800.png
public/store/screenshot-02-options-1280x800.png
public/store/screenshot-03-popup-1280x800.png
public/store/screenshot-04-block-1280x800.png
public/store/screenshot-05-handoff-1280x800.png
public/store/promo-tile-440x280.png
public/store/marquee-1400x560.png
```

Do not upload `public/store/*.source.svg`. They are source templates only.
