# Prototype verification

Verified on 28 August 2026 against the local running application.

- 14 automated tests cover deterministic scoring, exclusion rules, nearby locations, color families, private explanations, draft behavior, matching notification deduplication, claim ownership, duplicate claims, role checks, review decisions, competing claims, storage logs, verified return notifications, linked lost reports, and form validation.
- Strict TypeScript and type-aware lint pass.
- Production Worker/client build succeeds.
- Installed dependency audit: zero known vulnerabilities after compatible framework patches.
- Browser checks: keyword search; found filter; list view; private item details; required-field errors; claim submission; security evidence review; approval; private storage update; confirmed handover; student return notification.
- Mobile browser checks: required report fields; sample photo upload and preview; draft save; reload and draft recovery including photo; final review; successful report publication; empty draft list after publication.
- Authentication checks: synthetic local registration; wrong password rejection; correct password sign-in; account and role switching.
- Combined category/color/location filters produce the expected results; a nonmatching color produces the empty state.
- Layout checks at 390px, 768px, and 1440px: document scroll width equals viewport width. Mobile navigation and form interactions work. The initial desktop layout was visually inspected.

The browser test records exist only in the local browser used for testing. Seed source data is unchanged. Supabase, actual school enrollment, real document verification, email delivery, cross-device synchronization, and real-device PWA installation are outside this local prototype and were not tested.
