# LouFind

A functional, responsive campus lost-and-found prototype themed for **Saint Louis University in Baguio City, Philippines (slu.edu.ph)**. This is an **unofficial demo**, not an SLU service. The initial screen opens as **Jamie Santos**, a sample student, with reports, matches, claims, and notifications ready to explore.

## User guide

Read the [project overview and user guide (PDF)](output/pdf/LouFind_Project_Overview_and_User_Guide.pdf) for a friendly walkthrough of reporting, matching, claims, security review, iPhone setup, privacy, and troubleshooting.

## Campus theme and navigation

The theme uses the supplied LouFind logo with deep blue `#073779`, white, and gold `#f2b21b`. These interface shades are design choices, not official university color specifications. No university seal is used. Campus locations, pickup workflows, staff names, IDs, and accounts are sample data.

On phones and narrow tablets, the bottom menu provides **Home, Browse, Report, My reports, and More**. More contains matches, notifications, claims, saved items, help, and account/demo role settings; security accounts also get the security dashboard. The **Report** button is available from every screen. Activity tabs wrap into visible buttons on small screens. The layout uses larger text, 44px-or-larger main controls, labeled selected states, visible keyboard focus, and a working skip link.

Existing local data is preserved during the university change. `migrateCampusIdentity` updates only the original sample accounts’ Westbridge or U.S. SLU email addresses; it does not alter reports, claims, photos, saved items, passwords, or custom accounts. The migration is idempotent and covered by tests.

## Loading and app identity

The supplied logo appears in desktop/mobile headers, sign-in, startup, offline help, and installed-app icons. The shared `AppLoading` component also serves the App Router loading fallback. Launch displays the logo for at least 900ms after hydration and waits for local data readiness; ordinary in-app navigation does not replay it. The indicator is indeterminate, exposes a polite loading status, and stops moving when reduced motion is requested. The layout adapts to small screens and device safe areas.

The installed app name is **LouFind**. Existing browser data deliberately keeps its original storage key, and the manifest keeps its `/` identity, so renaming does not create a fresh data store. The production worker replaces older branded offline caches and caches the new offline logo. Installed shortcuts may require reopening or reinstalling before the operating system refreshes their labels/icons; native device installation has not been verified.

## Run locally

### Preview on your iPhone with Expo Go

Install [Expo Go on the iPhone](https://apps.apple.com/ph/app/expo-go/id982107779). With both devices on the same private Wi-Fi, run `npm run dev:lan` in one terminal and `npm run phone` in another. Scan `outputs/loufind-expo-qr.png` with the iPhone Camera and allow Local Network access.

For the first setup, install the separate companion dependencies with `npm --prefix mobile install`. The companion uses App Store-compatible Expo SDK 54 and displays the existing website in a native WebView. Keep the Mac awake and both commands running. Each device has separate local demo data. See [the mobile guide](mobile/README.md) for setup, compatibility, and troubleshooting.

### Website development

Requires Node.js **22.13 or newer** and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by the development server (normally http://localhost:3000).

```sh
npm run test       # Deterministic matching, validation, ownership, and lifecycle tests
npm run typecheck  # Strict TypeScript
npm run lint       # Type-aware linting
npm run build      # Production Cloudflare Worker and client assets
npm run start      # Serve the production Worker locally
```

No Supabase account, credentials, external image host, or API key is required. This delivery implements the brief's **local demo fallback**. It does not connect to a live school or Supabase instance.

## Demo accounts

All sample accounts use **Campus123!**. Open the avatar and choose **Sign out / change account** to see sign-in and registration. The role switcher is available in the desktop sidebar and via **More → Account & demo roles** on mobile.

| Role                        | Email               | School ID  |
| --------------------------- | ------------------- | ---------- |
| Student · Jamie Santos      | jamie@slu.edu.ph    | 2024-01482 |
| Student · Mika Reyes        | mika@slu.edu.ph     | 2023-00836 |
| Faculty/staff · Alex Rivera | alex@slu.edu.ph     | ST-00124   |
| Security · Officer Cruz     | security@slu.edu.ph | SEC-0018   |

Registration accepts fabricated `@slu.edu.ph` emails for testing only; no email is sent and no SLU sign-in is performed. Existing custom demo accounts keep their original email and can still sign in. New demo passwords are stored as salted PBKDF2-SHA256 hashes (100,000 iterations). **This is not production authentication.** The deliberate role switcher and local browser data mean there is no real security boundary. Use test passwords and fabricated evidence only. Registration cannot assign the security role.

## A complete demo flow

1. As Jamie, open **Possible matches**, then the scientific calculator.
2. Select **This might be mine** and supply private marks and proof of ownership. Example: initials JS inside the cover, and an available purchase receipt.
3. Submit the claim. It becomes **Under Review**, and Jamie receives a notification.
4. Switch to **Campus security**. Open the new claim and compare the private report details with the evidence.
5. Enter a review note and confirm verification, then approve the claim. The report becomes **Ready for Pickup**.
6. In **All reports**, manage the calculator. Record its private storage location. Select **Returned** and confirm the physical ID check and handover.
7. Switch back to Jamie. Open notifications and My claims to see the completed return.

You can also reject a claim with a reason; a rejected claimant may submit new evidence. The prototype prevents duplicate active claims, approving an item for two owners, and marking an item returned before a claim is approved.

## Included workflows

- Home with search, report actions, current user's matches, fresh finds, and activity.
- Search by all keywords; filters for report type, category, color, location, status, and inclusive date range; sort and list/grid views.
- Three-step report form with Zod/React Hook Form validation, photo preview, draft autosave, private identifying details, and final review.
- JPG/PNG/WebP uploads up to 8 MB, resized in-browser to a 900px maximum edge and encoded as JPEG to keep device-local storage manageable.
- Item details without reporter identity or exact storage location. Owners and security can see private marks; claim evidence appears only to the claimant/security in their respective views.
- Deterministic, explainable matching; private ownership claims and optional supporting image.
- Notifications for matches, claim submission/review, pickup, and return; read/unread tracking.
- Lost/found reports, claims, saved items, and draft tabs.
- Security claim review, report search and status filters, storage control, recovery rate, and activity log. Statistics are calculated from records, not fixed display numbers.
- Installable PWA manifest and icons; production service worker with an offline information page. The app requires a connection to load its working interface. Your local data remains on the device while offline.
- Responsive sidebar on desktop, bottom navigation on mobile, accessible dialogs, keyboard focus states, and reduced-motion support.

## Architecture

This project uses **React 19, strict TypeScript, Tailwind 4, Lucide, Zod, React Hook Form, and shadcn/Base UI**. Sites scaffolding uses **Vinext**, a Vite-powered implementation of the Next.js App Router API, to create a Cloudflare-compatible Worker. Server components provide the page/layout/metadata; the stateful application uses client components. It is not the stock `next` package.

```text
app/                        Server page, layout, metadata, errors, global theme
components/campus-app.tsx   App composition, hash navigation, demo account dialog
components/campus-shell.tsx Desktop/mobile navigation
components/common.tsx       Shared modal, form field, photo upload, empty state
components/ui/              Only the UI primitives the app uses
features/                   Home, browse, activity, matches, report, claim,
                            notifications, security, auth, help
lib/types.ts                Typed domain models
lib/seed.ts                 Sample profiles, locations, reports and activity
lib/demo-store.tsx           Explicitly device-local persistence and account hashing
lib/schemas.ts              Form validation schemas
lib/services/matching.ts    Pure, deterministic scoring service
lib/services/workflows.ts   Pure report/claim/status transitions and role checks
public/                     Optimized sample photos, PWA assets, social preview
assets/source/              Original generated imagery
scripts/prepare-assets.mjs  Reproducible image optimization and icon rasterization
tests/workflows.test.ts     Automated behavior and authorization checks
```

`Profile`, `ItemReport`, `ItemImage`, `ItemMatch`, `OwnershipClaim`, `Notification`, `CampusLocation`, and `ActivityLog` define the eight requested entities. The demo embeds one photo URL on a report/claim and calculates matches rather than persisting duplicate image/match records. All persisted data lives in one versioned localStorage document (`findit-campus-demo-v1`). Hash URLs support browser back/forward; item links for custom reports work only in the browser that owns those reports.

### Match scoring

| Signal                                            |    Maximum |
| ------------------------------------------------- | ---------: |
| Same category                                     |         30 |
| Similar title/description tokens                  |         25 |
| Same color or color family                        |         15 |
| Same location / nearby campus zone                |     15 / 8 |
| Same or next day / within 7 days / within 30 days | 10 / 6 / 2 |
| Matching brand, otherwise private feature overlap |          5 |

Candidates require opposite report types, different reporters, the same category, some public keyword overlap, a found date on or after the lost date within 30 days, an active status, and a score of at least 65. Scores are deterministic similarity measures, **not ownership probabilities**. Private matching explanations never disclose the underlying marks. No image recognition or AI matching is used.

### Persistence and production limits

- This is an intentionally **single-device prototype**. It does not sync across devices, send email, send push notifications, or verify school enrollment. Contact preferences are recorded but do not trigger external messages.
- Data survives reloads in this browser. Clearing site data or **Reset demo data** deletes its reports, photos, and registered accounts. Browser quota failures are surfaced and changes are not silently marked saved.
- Private fields are hidden from public UI, not cryptographically protected from the device owner. Do not store real identity documents or confidential reports.
- Supabase integration and server-enforced RLS are **not implemented**. A production version needs Supabase Auth, Postgres migrations and RLS, authenticated server endpoints, private storage with signed URLs, upload moderation, secure security-role provisioning, and an audited handover process. Never reuse the client demo role checks as server authorization.
- The university is real; people, sample locations, dates, IDs and reports in the demo are fictional. Sample item photographs are original generated illustrations of the reports, not real recovered possessions.
- Social metadata is site-wide because the records and item routes are local to the browser. Set the trusted `PUBLIC_SITE_URL` for the deployed origin. Do not derive it from untrusted forwarded headers.

## Imagery

The supplied LouFind artwork is preserved in `assets/source/loufind-logo.png` and optimized as `public/brand/loufind-logo.webp`. Compact headers show its symbol through a CSS viewport; full-logo views and app icons retain the whole artwork. The original user file is untouched.

Four sample photographs and the social card were generated with the built-in imagegen tool. Source assets are in `assets/source/`; optimized runtime images are in `public/images/` and `public/og.png`. Photo briefs: folded blue umbrella on pale stone; white earbuds in an open case on warm gray; anonymous face-down student card with a sage lanyard; black scientific calculator on gray. The current social card uses the supplied logo as a reference and identifies LouFind, SLU Lost & Found, Saint Louis University, Baguio City, Philippines, and an unofficial demo. Its prompt is saved in `assets/source/og-prompt.txt`. Sample photographs contain no real personal information. `node scripts/prepare-assets.mjs` recreates the optimized outputs and PNG app icons.
