# Competition winners platform

The winners pages, shareable team profiles and recognition cards for the IN-SPACe Model
Rocketry/CAN-7USAT competition. They are built on the competition platform described in
`README.md`. This document covers the audit, what was built, analytics, search and how to verify
it, plus what still needs approval before anything goes live.

This repository is public. Student names, contact details and unapproved photographs never go
into it. Team data waiting for review lives in `.data/` (git-ignored) and in the spreadsheet.

## 1. Status

| Area | State |
| --- | --- |
| Code | Complete locally. Not committed or deployed |
| Live site | Shows the pages in their "awaiting verification" state, because the competition backend is not yet configured in production (`NOT_CONFIGURED`) |
| First winning team | Prepared as a local import file (`.data/competition-imports/`). Not in the live spreadsheet |
| Winner claim | **Unverified.** Needs checking against IN-SPACe's official result before Winner Verified is set |
| Group photograph | **Permission not yet confirmed.** Stays private until a reviewer sets Team Photo Approved |

## 2. Audit of the existing implementation (before this work)

| Finding | Effect | Change |
| --- | --- | --- |
| One winners page with category tabs on a single URL | Model Rocketry and CAN-7USAT could not rank, be shared or be linked separately | Each category has its own page and canonical URL. The landing page links to both |
| Team photographs had no stored size | Layout shift while loading, and no way to keep the original proportions | Width and height are stored with every upload and import |
| Team photo needed only the team's consent | No EV Society check before a group photo of students went public | New signed **Team Photo Approved** decision. A changed photo resets it |
| No field for the organiser's team ID | Team ID shown nowhere, and URLs based on year only | **Team Code** field (registration form, sheet, pages). New addresses use it, e.g. `team-name-rocketry-001` |
| No link to the official result | Winner claims could not show their source | **Official Result Reference** per category (https only), shown with the verified date |
| CSS `uppercase` on labels | "IN-SPACe" was displayed as "IN-SPACE" | Removed wherever the organiser's name appears |
| Only the generic site share image | Shared links showed no team or category | Category and team pages generate their own Open Graph / X images |
| `openGraph` set without `images` on the winners, participants and register pages | Next.js replaces, not merges, `openGraph`, so those pages had no `og:image` at all | Default site image added |
| No competition analytics events | Nothing measured beyond page views | 12 events (section 6) |
| Sitemap lacked category pages | — | Added. Team pages are listed only once published |
| `Team Photo Consent` was always saved as `No` (bug in the first release of the platform) | Team photos submitted through the form could never be published | Fixed in `competition-platform.js`. Never live, so no data affected |
| Competition view events were sent before GA4 had loaded (bug in this work, found in testing) | Most view events on a full page load would have been dropped | `TrackView` waits for gtag, then sends once |

Also noted, not changed:

- GA4 loads on every host, including `localhost`, so local development sends events to the
  production property. Filter by hostname, or define an internal-traffic filter (section 6).
- `npm run lint` (bare `eslint`) also lints the generated `.next/` folder and reports errors
  there. `npx eslint src tests scripts` is clean.

## 3. Pages

All under `/programs/inspace-model-rocketry-cansat/`:

| Path | Content |
| --- | --- |
| `winners` | Landing page: one card per category with its verified winners, plus the innovation awards |
| `winners/model-rocketry` | Category page: hero with the approved group photo, featured team, members, mentors, recognition, sharing. Year sections when several years exist |
| `winners/can-7usat` | Same template; shows "Winner details awaiting verification and publication." until a winner is verified |
| `teams/<slug>` | Shareable team profile: about, verified standing, members, mentors, innovation recognition, share controls |
| `teams/<slug>/recognition-card` | 1200×630 PNG download |
| `…/opengraph-image`, `…/twitter-image` | Social previews for the category and team pages |

A team page exists only after Registration Status = Approved, Profile Approved, Publication
Approved, the team's publication consent and Participation Verified. Otherwise it returns 404.

### Wording rules

All titles, descriptions, captions and cards come from `src/lib/competitions/recognition.ts`:

- "Winners" only when **Winner Verified** and **Participation Verified** are both Yes.
- An Achievement (e.g. "First place") appears only when a reviewer has entered it.
- A missing college, leader, mentor, rank or link is left out, never filled in.
- IN-SPACe is named as the organiser; EV Society is the publisher of the recognition.

## 4. Publishing a winning team

### Team registered through the website

Follow `ADMIN-GUIDE.md`, then set Winner Verified, Achievement and Official Result Reference.

### Team supplied by EV Society (leader has not registered)

1. Put the team's details in a JSON file under `.data/competition-imports/` (see
   `scripts/competition-import-team.mjs` for the fields). Leave unknown fields empty.
2. Check it locally: `npm run competitions:import -- .data/competition-imports/<file>.json`
3. Import into the live spreadsheet (needs `COMPETITION_API_URL` and `COMPETITION_API_SECRET` in
   the environment): `npm run competitions:import -- <file> --production`
   The import is create-only. Running it twice, or with another name for the same team code,
   changes nothing.
4. Review in the sheet like any team: Registration Status, Profile Approved, Publication Approved,
   Participation Verified. Then:
   - **Winner Verified** only after checking IN-SPACe's official result,
   - **Official Result Reference**: the https link to that result,
   - **Team Photo Approved** only once permission to publish the photograph is confirmed.

The import stores two files: the web copy of the photograph (public after approval) and the
original as supplied (`team-photo-original`, private, never served).

## 5. Sharing

| Control | Behaviour |
| --- | --- |
| Share on LinkedIn | `linkedin.com/sharing/share-offsite/?url=…`. LinkedIn takes the title and image from the page's Open Graph tags; it does not accept pre-filled text, hence the caption button |
| Share on WhatsApp | `wa.me/?text=` with the caption and link |
| Share… | The device's share sheet, shown only where the browser supports it |
| Copy profile link / Copy caption | Clipboard, with a visible confirmation |
| Download recognition card | 1200×630 PNG: team name, team code, verified standing, approved photo (scaled to fit, never cropped) |

After a team is published or changed, LinkedIn may keep an old preview for up to seven days.
Refresh it with the [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/).

## 6. Analytics (GA4)

Reuses the existing tag (`G-1VQPB8G6T1`, `send_page_view: false`, page views from
`RouteAnalytics`). No second initialisation. Events are defined in `src/data/analytics/events.ts`.

| Event | When | Parameters |
| --- | --- | --- |
| `competition_page_view` | Competition page opened | `competition_id` |
| `winners_page_view` | Winners landing opened | `competition_id` |
| `winner_category_view` | Category page opened | `competition_id`, `competition_year`, `category`, `content_type` |
| `competition_year_select` | Year changed on a category page | `competition_id`, `competition_year`, `category` |
| `team_profile_view` | Published team page opened | `competition_id`, `competition_year`, `category`, `team_slug`, `content_type` |
| `team_share_click` | LinkedIn, WhatsApp, share sheet or copy caption | + `share_platform` |
| `share_link_copy` | Profile link copied | + `share_platform: copy_link` |
| `recognition_card_download` | Card downloaded | + `content_type: recognition_card` |
| `award_pdf_view` / `award_pdf_download` | Award document opened / downloaded | `competition_id`, `competition_year`, `category`, `content_type: award_pdf` |
| `team_registration_start` | Draft created, after the leader verifies their email | `competition_id`, `competition_year`, `category` |
| `team_registration_submit` | Only after the server confirms the submission | `competition_id`, `competition_year`, `category` |

Never sent: names, emails, phone numbers, resume content, internal team or member IDs.
`team_slug` is the public URL of an already published team.

### Register the custom dimensions (once)

GA4 → Admin → Custom definitions → Create custom dimension (scope: Event) for `competition_id`,
`competition_year`, `category`, `team_slug`, `share_platform` and `content_type`. Parameters are
collected without this, but they cannot be used in reports until registered, and registration
is not retroactive.

### Check with DebugView

1. Connect Tag Assistant (tagassistant.google.com) to `https://www.evsociety.org`, or turn on
   the Google Analytics Debugger Chrome extension.
2. GA4 → Admin → DebugView. Open a category page, a team page, and click each share control.
3. Each action should appear once, with the parameters above and nothing else.

### Exploration (lightweight dashboard)

GA4 → Explore → Free form:

- **Discovery:** rows Page path; values Views, Active users; filter path contains
  `/programs/inspace-model-rocketry-cansat`. Add Device category and Session source / medium as
  breakdowns.
- **Team engagement:** rows `team_slug`; columns Event name; values Event count. Filter event
  name to `team_profile_view`, `team_share_click`, `share_link_copy`,
  `recognition_card_download`.
- **Registration funnel:** Funnel exploration, steps `team_registration_start` →
  `team_registration_submit`, breakdown `competition_year`.
- Exclude local testing: filter Hostname exactly matches `www.evsociety.org`.

A share click shows intent, not that a post was published. GA4 cannot see mentions in AI
answers. Use Search Console and referral sources (e.g. `chatgpt.com`, `perplexity.ai` as
session source) for what is observable.

## 7. Search and AI-search discoverability

- Titles, descriptions and canonical URLs are rendered on the server (visible with JavaScript
  off). Category and team titles name the team, team code, category and year.
- Structured data (JSON-LD), matching the visible page:
  - category page: `WebPage`, `BreadcrumbList`, and an `ItemList` of verified winners when any
    exist;
  - team page: `WebPage` about an `Organization` (the team, with the team code as `identifier`
    and members as `Person` with name only), `ImageObject` for the approved photo, and
    `BreadcrumbList`.
- There is no special markup for AI Overviews or chat search. The pages help them the standard
  way: plain factual sections (About the team, Verified achievement, Team members, Mentors,
  Innovation recognition), the organiser named, the official result linked, and the verification
  date shown.
- Sitemap: winners landing and both category pages always, team pages once published.
  A decision in the sheet tells the website to refresh: pages and share images update within
  about a minute, the sitemap within an hour.

### Search Console checklist (after go-live)

1. URL Inspection → `…/winners/model-rocketry`, `…/winners/can-7usat` and the team page →
   *Test live URL*. Check that it is indexable, that the canonical is itself, and that the
   rendered HTML contains the team name.
2. Sitemaps → resubmit `https://www.evsociety.org/sitemap.xml`; confirm the new URLs are
   discovered.
3. [Rich Results Test](https://search.google.com/test/rich-results) and the
   [Schema Markup Validator](https://validator.schema.org/) on each page: no errors. (These types
   do not produce rich results; the test confirms the markup parses.)
4. Request indexing for the three pages.
5. After 2–4 weeks: Performance → filter Page contains `/winners/` or `/teams/` → impressions,
   clicks, CTR, position and the queries that lead there. Pages → check they are indexed.
6. Preview the share cards: LinkedIn Post Inspector, and a WhatsApp message to yourself.

## 8. Mobile, accessibility and performance

**Mobile:** at 320, 360, 375, 390, 414, 430, 768 and 1024 px plus desktop, these pages were
checked for horizontal overflow, clipped headings and tap targets under 24 px: the competition
page, winners landing, both category pages, the team page and the home page. Two fixes resulted:

- a 320 px heading overflow ("Rocketry/CAN-7USAT" could not wrap; it now breaks after the
  slash);
- a 22 px team link, now 28 px.

**Accessibility (manual review):**
- The photograph has the supplied alt text. Its controls sit below it, never over people.
- The full-size view is a native `<dialog>` with a labelled 44 px close button.
- Share links announce that they open in a new tab.
- Heading order is preserved, motion respects `prefers-reduced-motion`, and the organiser's
  name keeps its casing.
- An automated audit (axe or Lighthouse) has **not** been run yet.

**Performance (built in, not yet measured):**
- Photographs are served through `next/image` as responsive WebP, with stored width and height
  (no layout shift).
- The hero photo is loaded with priority; others are lazy-loaded.
- Media is cached for 5 minutes, and pages are static with a 60-second revalidation.
- Client JavaScript is limited to the share controls, the lightbox and the year switcher.
- LCP, INP and CLS have **not** been measured. After go-live, run PageSpeed Insights on the
  category and team pages (mobile). Field data appears in Search Console → Core Web Vitals once
  there is enough traffic.

## 9. Test results (6 Nov 2026, local)

`npm test`: 77 tests passed, including `tests/competitions/winners.test.ts`. `tsc`: clean.
`npm run build`: succeeded. `npx eslint src tests scripts`: no errors.

| # | Required test | Result |
| --- | --- | --- |
| 1 | Team name with exact spelling | Pass (import data → sheet → page, title, card) |
| 2 | All eight members, in order | Pass (import test checks order and display order; page shows eight) |
| 3 | No unsupported college or mentor | Pass (empty fields stay empty; no college or mentor section is rendered) |
| 4 | The supplied photograph is used | Pass (1132×754, uncropped; original preserved privately) |
| 5 | No stock or AI imagery | Pass (cards without an approved photo use plain line art only) |
| 6 | Official result verification respected | Pass (unit tests: winner wording only when verified; https-only result link) |
| 7 | CAN-7USAT page with no winners | Pass (production build) |
| 8 | Independent canonical URLs | Pass (production build) |
| 9 | Stable team URLs | Pass (address fixed at first publication; from team code on import) |
| 10 | Social previews show the right team | Pass locally (team card image; `og:image` on www.evsociety.org) |
| 11 | LinkedIn and WhatsApp links | Pass (URLs checked; open in a new tab) |
| 12 | Recognition card download | Pass (PNG 1200×630, attachment, file name) |
| 13 | Events fire once per action | Pass (production build, after the TrackView fix) |
| 14 | No personal data to GA4 | Pass (captured event parameters checked) |
| 15 | Sitemap includes approved pages | Pass (team listed only when published) |
| 16 | Structured data matches visible content | Pass |
| 17 | Metadata rendered on the server | Pass (fetched without JavaScript) |
| 18 | No mobile overflow | Pass after two fixes (section 8) |
| 19 | Sheet approvals still work | Pass (backend suite: signed decisions, revisions, consent) |
| 20 | Reusable for future competitions | Pass (drone competition test) |

Not yet exercised end to end: award PDF events (no award is published), the year switcher
(only one year exists), and anything against the real Google services.

## 10. Going live (each step needs approval)

1. Google: add `competition-platform.js` and the updated `Code.gs`. Set the Script Properties,
   run `evsCompetitionSetup`, deploy a new version and move **every** active deployment to it
   (`google-apps-script/README.md`).
2. Vercel: `COMPETITION_API_URL`, `COMPETITION_API_SECRET`, `COMPETITION_SESSION_SECRET`, then
   redeploy.
3. Import the team with `--production`.
4. Confirm the result against IN-SPACe's official source and confirm photo permission, then make
   the reviewer decisions in the sheet.
5. Run the Search Console checklist (section 7).

## 11. Files changed in this update

New:
- Pages and images: `src/app/programs/[programSlug]/winners/[categorySlug]/` (page, Open Graph
  and X images), `winners/winnersData.ts`, `teams/[teamSlug]/opengraph-image.tsx`,
  `twitter-image.tsx`, `recognition-card/route.tsx`
- Components: `GroupPhoto`, `ShareControls`, `TeamShowcase`, `TrackView`, `YearSwitcher`,
  `JsonLd` (in `src/components/competitions/`)
- Logic: `src/lib/competitions/recognition.ts`, `imageSize.ts`, `server/recognitionCard.tsx`
- `scripts/competition-import-team.mjs`, `tests/competitions/winners.test.ts`, this document

Changed:
- Backend: `google-apps-script/competition-platform.js`. New columns, the team import, photo
  approval, the result reference, and the photo-consent fix
- Pages: winners landing, team page, participants and register (share image), competition page
  (view event), `src/app/sitemap.ts`
- Components: `AwardPDFCard`, `AwardsSection`, `MemberProfileCard`, `TeamProfileCard`,
  registration form and state, `KeepCanSatTogether`
- Config and model: `src/config/competitions/*`, `src/data/analytics/events.ts`,
  `src/lib/competitions/{model,publicModel,validation}.ts`, `server/{localBackend,teamService}.ts`,
  `src/app/globals.css`, `package.json` (import script)
- Tests: `backend`, `components`, `website`, `droneCompetition`
- Docs: this file, `README.md`, `ADMIN-GUIDE.md`, `google-apps-script/README.md`

Removed: `src/components/competitions/WinnersDirectory.tsx` (replaced by the category pages).
