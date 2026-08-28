# Prototype verification

## Vercel deployment fix — 28 August 2026

- Added a separate static export for Vercel. The build renders the homepage and not-found page into `dist/client`; it verifies the homepage and 14 referenced/required local assets before succeeding.
- A clean `npm ci` succeeds; the updated web dependency audit reports zero known vulnerabilities. The unused root Expo dependency and its deprecated uuid dependency are removed. The separate mobile dependency lockfile is unchanged.
- All 29 automated tests pass, including four regression cases for a valid static export, missing homepage, missing JavaScript bundle, and an error page masquerading as a successful build.
- Root TypeScript, mobile TypeScript, and lint pass after the clean install.
- Both `npm run build` (Cloudflare Worker) and `npm run build:vercel` (static Vercel export) pass. The final static export uses the LouFind manifest and production social image URL, without a localhost metadata origin.
- The existing Vercel project was updated to Node 22.x and the saved setting was read back successfully. Reviewed esbuild and workerd install-script approvals are pinned to their exact locked versions.
- These are build, automated behavior, and configuration checks; no new browser workflow or physical iPhone test is claimed for this deployment change.

## Original prototype checks

Verified on 28 August 2026 against the local running application.

- 25 automated tests cover deterministic scoring, exclusion rules, nearby locations, color families, private explanations, draft behavior, matching notification deduplication, claim ownership, duplicate claims, role checks, review decisions, competing claims, storage logs, verified return notifications, linked lost reports, form validation, offline cache behavior, and phone-preview compatibility.
- Strict TypeScript and type-aware lint pass.
- Production Worker/client build succeeds.
- Installed dependency audit: zero known vulnerabilities after compatible framework patches.
- Browser checks: keyword search; found filter; list view; private item details; required-field errors; claim submission; security evidence review; approval; private storage update; confirmed handover; student return notification.
- Mobile browser checks: required report fields; sample photo upload and preview; draft save; reload and draft recovery including photo; final review; successful report publication; empty draft list after publication.
- Authentication checks: synthetic local registration; wrong password rejection; correct password sign-in; account and role switching.
- Combined category/color/location filters produce the expected results; a nonmatching color produces the empty state.
- Layout checks at 390px, 768px, and 1440px: document scroll width equals viewport width. Mobile navigation and form interactions work. The initial desktop layout was visually inspected.

The browser test records exist only in the local browser used for testing. Seed source data is unchanged. Supabase, actual school enrollment, real document verification, email delivery, cross-device synchronization, and real-device PWA installation are outside this local prototype and were not tested.

## Earlier SLU theme and navigation update — 28 August 2026

The university identity in this earlier check was incorrect and is superseded by the Baguio correction below. The navigation and workflow results still apply.

- Applied the Saint Louis University identity from `https://www.slu.edu/`, SLU Blue `#003DA5`, white surfaces, and larger interface text. The app, sign-in screen, icons, manifest, metadata, and social card share the identity. It is explicitly labeled an unofficial local demo.
- Verified migration in unit tests: original sample email addresses update; existing reports, claims, photos, saved items, custom accounts, and credentials are preserved. The migration is idempotent. New registration accepts only the exact `slu.edu` domain; existing custom accounts remain able to sign in.
- Browser checked on 320px, 390px, 768px, and 1440px layouts; checked horizontal overflow on home, filters, report review, activity, and security surfaces. Main phone navigation targets measure approximately 72 × 61px at 390px width.
- Tested More → My claims and Help, visible activity tabs, account access, direct Report access, required-field validation, lost/found selection, final review and successful found-report publication, search, found filter, list view, and empty results.
- Verified an existing returned claim and previous browser test report remained present, the account showed `jamie@slu.edu`, and sign-in with the updated seeded address succeeded.
- Verified desktop security role switching, claim queue, reports table, and 44px Manage controls. Restored the student home view afterward.
- Navigation moves focus to the main region. Native buttons and labeled pressed/current states are used. Automated Enter events did not activate native buttons in this browser session, so keyboard activation is **not** marked as passed; manual keyboard and screen-reader review is still needed.
- No source upload or deployment was attempted in this update; the local preview remains the deliverable pending publishing approval.

The additional synthetic report `SLU navigation test — blue umbrella` (reference `FC-2026-47CEFA6A`) remains in this browser as evidence of the completed form flow. No existing user records were reset or deleted.

## Corrected to SLU Baguio, Philippines — 28 August 2026

- University links now target `https://www.slu.edu.ph/`. The home screen, navigation, sign-in screen, metadata, and social preview explicitly identify Baguio, Philippines.
- Removed the U.S. university’s color-guide reference. The interface uses chosen deep-blue and white shades with a restrained gold accent; these are not represented as official color specifications.
- Sample emails and new demo registration now use `@slu.edu.ph`. The identity migration handles both previous sample domains (`westbridge.edu.ph` and `slu.edu`) without changing custom accounts, passwords, reports, claims, or saved items.
- All 17 automated tests, strict TypeScript, lint, and the production build passed.
- Browser verification confirmed the Baguio header, preserved previous reports, and the migrated `jamie@slu.edu.ph` sample account.
- Publishing remains pending separate approval; no source upload or deployment was attempted.

## LouFind branding and loading — 28 August 2026

- Preserved the supplied logo as a source asset and optimized it without changing its artwork. Updated desktop/mobile headers, sign-in, page metadata, install manifest, icons, offline page, and social preview to LouFind. The university remains Saint Louis University in Baguio City, Philippines.
- Added a shared responsive startup and App Router loading fallback. Browser checks observed the logo and loading status on both 390 × 844 and 1440 × 1000 screens, followed by the working home screen. The 900ms launch intro does not repeat during ordinary navigation.
- Visually inspected the full loading screen on mobile/desktop, both home layouts, and the sign-in logo at 320px. Home/sign-in/navigation checks at 320px, 390px, 768px, and 1440px found no horizontal overflow.
- Confirmed all 14 existing browser reports, previous workflow test reports, the returned calculator, saved earbuds, and `jamie@slu.edu.ph` remained present. Sign-out/demo sign-in worked. No records were reset or deleted; the legacy storage key and manifest identity are unchanged.
- Confirmed browser title, favicon, Apple icon/title, and removal of the old visible name. The app, manifest, app icon, offline page, and social image all returned HTTP 200. No browser errors were reported after a clean reload.
- All 20 tests, strict TypeScript, lint, and production build pass. Three new worker regression tests cover legacy-cache cleanup, offline page/logo availability, fresh online navigation, and ignoring writes/external requests. Service worker behavior was tested with a mock cache/network harness, not a real offline device.
- Reduced-motion behavior is implemented in CSS. Real-device PWA installation, operating-system splash screens, and screen-reader testing remain unverified. The tested loading screens belong to the responsive web app.
- Captured `outputs/loufind-loading-mobile.png`, `outputs/loufind-loading-desktop.png`, `outputs/loufind-home-mobile.png`, and `outputs/loufind-home-desktop.png`. Local preview only; no source upload or deployment attempted.

## iPhone Expo Go preview — 28 August 2026

- Added a separate Expo SDK 54 companion in `mobile/` for the current iPhone App Store client. It uses React Native WebView to display LouFind, with native safe-area padding, the supplied logo, loading feedback, connection-error recovery, and restricted navigation.
- Moved the Expo setup out of the web package to keep its React dependencies separate. Both package trees audit with zero reported vulnerabilities after compatible development-tool overrides.
- Expo Doctor passes all 18 checks. Both web and mobile TypeScript checks pass. Web lint, the production web build, and iOS Hermes bundle export pass.
- All 25 tests pass. Added checks for cryptographically random UUIDs without `randomUUID`, identical PBKDF2 password hashes with/without SubtleCrypto, LAN host resolution, unsafe URL rejection, and same-origin WebView navigation.
- The web server responds at the Mac's LAN address. The Expo iOS manifest returns LouFind with SDK 54.0.0; its actual iOS development bundle returns HTTP 200 and contains the correct web preview address.
- At the LAN origin and 390px viewport, the browser opened a lost-item report, saved the synthetic `iPhone Wi-Fi preview test` draft, and retained it after reload. No horizontal overflow was found. The original localhost report remained present after returning to desktop home; no browser errors were reported.
- Expo SDK 54's CLI watcher failed with the patched Metro event format. The preview now uses supported CI mode with native watching disabled; it remained running and served the iOS bundle after source changes. Restart the phone command for changes to native files. Web UI HMR remains separate.
- The generated QR is `outputs/loufind-expo-qr.png`; `npm run phone` refreshes it using the current private LAN address. No public tunnel, source upload, cloud build, or deployment was used.
- Actual installation and launch on the user's iPhone 13 / iOS 26.2.1, native photo permissions, gestures, and device network access still require the user to scan the QR. Desktop browser testing and successful iOS bundling are not represented as physical-device verification.
