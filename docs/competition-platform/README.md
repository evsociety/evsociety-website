# EV Society Competition Platform

Team registration, secure profile editing, review in Google Sheets, verified participants,
verified winners and Innovation Award documents, built for the IN-SPACe Model Rocketry/CAN-7USAT
India Student Competition and reusable for future competitions.

- Setup and go-live: [`google-apps-script/README.md`](../../google-apps-script/README.md)
- Reviewing teams in the spreadsheet: [ADMIN-GUIDE.md](ADMIN-GUIDE.md)
- Adding a competition: [ADDING-A-COMPETITION.md](ADDING-A-COMPETITION.md)
- Winners pages, team profiles, sharing, analytics and search: [WINNERS-PLATFORM.md](WINNERS-PLATFORM.md)

## 1. Existing system: findings (Phase 1 audit)

| Area | Finding | Consequence for the platform |
| --- | --- | --- |
| Framework | Next.js 15.1 App Router, React 19, TypeScript, Tailwind v4, lucide-react; deployed on Vercel (five projects from this repo) | Built with the same stack, no new runtime dependencies |
| Design system | Navy `#0B1930` heroes, sky-blue primary `#0369A1` with `#7DD3FC` on navy, Inter, rounded-2xl cards, `container-custom`, `Breadcrumbs`, `InPageNav`, `SectionHeading` | Reused the tokens and patterns; no new colours or fonts |
| Registration | `/register` posts from the browser to a Google Apps Script web app (`no-cors`) bound to the "EVSociety Registrations" spreadsheet | Extended the **same** Apps Script project and spreadsheet; `/register` untouched |
| Google Drive | Not used by the existing site | Uploads go to one private Drive folder created by the same script |
| Authentication | No user accounts. Admin page uses Google Sign-In in the browser only; the Apps Script accepts **any token of five or more characters** | Team leaders sign in with an emailed one-time code; the platform's own API is signed server-to-server. The existing admin weakness is reported in section 8 |
| File uploads, PDF viewer | None; PDFs are linked directly | Upload pipeline and an accessible PDF viewer were added |
| Data | Static JSON in `src/data`; no database; no tests | Google Sheets remains the operating backend; tests added (Vitest) |

## 2. Architecture

```
Browser ──► Next.js pages (cached public data, ISR 60 s)
   │            │
   │            └─► /api/competitions/media/…   approved photos/logos only
   ▼
/api/competitions/[id]/…  (same-origin checks, signed leader session, validation, rate limits)
   │
   └─► HMAC-signed, single-use request ──► Apps Script (existing project, new file)
                                               ├─ new tabs in the existing spreadsheet
                                               ├─ private Drive folder for uploads
                                               ├─ MailApp: sign-in codes, consent requests, decisions
                                               └─ review trigger ──► /api/competitions/revalidate
```

- **One backend, one spreadsheet.** `google-apps-script/competition-platform.js` is added to the
  existing Apps Script project. One line in the existing `doPost` routes signed requests to it.
- **Website server is the only caller.** Requests carry an HMAC-SHA256 signature, a timestamp
  and a single-use nonce; the shared secret is server-only (`COMPETITION_API_SECRET`). The public
  web-app URL cannot be used to read or change competition data.
- **Public data** is projected by Apps Script from approved, consented records only, re-sanitised
  field by field on the website (`src/lib/competitions/publicModel.ts`), cached for 60 seconds and
  refreshed immediately by the review trigger's signed webhook. Only the sanitised projection is
  cached. If Google is unavailable, the last good snapshot is served; with none, a friendly
  "temporarily unavailable" page appears instead of a false "no teams".
- **Local development and tests run the real Apps Script code** against an imitation of the
  Google services (`src/lib/competitions/backend/appsScriptHarness.ts`); `next dev` uses it
  automatically and stores data in `.data/competition-dev` (gitignored).
- **Data-access abstraction.** Pages and routes call `callBackend(action, params)`; moving to a
  database later means implementing the same actions elsewhere.

## 3. Data model (tabs in the existing spreadsheet)

| Tab | Purpose |
| --- | --- |
| Competitions | Years, registration open/closed, visibility and limits, editable without a deploy |
| Teams | One row per team; status, decisions, consent, slug, revision, version for concurrency |
| Team_Categories | One row per team per category: participation, winner, achievement |
| Members | Leader and members (leader is a member with Role `Leader`), permissions, consent |
| Mentors | Up to the configured limit (four for IN-SPACe) |
| Files | Metadata of every upload; the files are in the private Drive folder |
| Awards | Award documents and their publication status |
| Change_Requests | Pending revisions of approved profiles, with a readable summary |
| Audit_Log | Every decision, submission, consent change, upload and deletion |

IDs are immutable (`EVS-7K4QH2` teams, `MBR-…`, `TCA-…`, `FIL-…`, `CHG-…`); rows are found by ID and
columns by header name, never by position, so sorting or adding columns is safe.

## 4. Security and privacy

- **Leader authentication:** 6-digit emailed code (10-minute expiry, five attempts, rate-limited
  per email and IP in Apps Script), then an httpOnly, signed, 4-hour session cookie. Every team
  action is re-authorised in Apps Script against the team's leader email.
- **No guessable edit URLs:** editing requires the session; team IDs alone grant nothing.
- **Review decisions are signed** by the trigger with a secret that never leaves Apps Script. A
  value typed or pasted without the trigger, or by an unidentified or unlisted editor, is treated
  as not approved, and the cell is restored with an explanatory note.
- **Individual consent:** members choose, via their own emailed link, whether their photo,
  LinkedIn, email and phone are shown, or to be hidden entirely. Under-18s are hidden until an
  administrator records guardian consent. Resumes are private and are never served publicly.
- **Uploads:** type checked from the bytes (JPEG/PNG/WebP/PDF), size-limited, photos resized in
  the browser, stored privately; public images are served only while referenced by an approved,
  consented profile, with five-minute cache lifetimes.
- **Spreadsheet formula injection** is blocked (leading `= + - @` stored as text) and user columns
  are plain-text formatted.
- **Other protections:** same-origin checks on every state-changing request, JSON-only bodies,
  input whitelisting, duplicate detection (same leader and year; same team name, college and
  year), idempotent submissions, optimistic concurrency (`CONFLICT` when a profile changed
  elsewhere), safe external links (`noopener noreferrer nofollow`), no-referrer on consent pages.
- **Withdrawal and deletion:** a leader can withdraw the profile (immediate) or request deletion
  (immediate withdrawal + email to EV Society); administrators delete via the sheet menu.

## 5. Routes

| Route | Page |
| --- | --- |
| `/programs/inspace-model-rocketry-cansat` | Existing page, unchanged except a new "Teams & winners" section with the four journeys |
| `…/register` | Register Team (4 steps: Competition, Team, Members & Mentors, Review & Submit) |
| `…/manage` | Manage Team Profile (email code sign-in, team list, same editor) |
| `…/participants` | Participating Teams (year, category, search; registered-teams view when enabled) |
| `…/winners` | Winners by year (newest first, latest with results open) with two category tabs, plus the Innovation Awards section (`#awards`) |
| `…/teams/[team-slug]` | Team profile |
| `…/consent/[token]` | A member's own publication choices (noindex) |

The sub-pages are one set of dynamic routes, `src/app/programs/[programSlug]/…`, that serve every
competition in `src/config/competitions`. The existing static program pages take precedence.

## 6. Acceptance tests

Automated (`npm test`, 63 tests): `tests/competitions/backend.test.ts` runs the real Apps Script;
`website.test.ts` covers validation, sanitising, sessions, uploads and signing;
`components.test.tsx` renders the public components; `tests/admin/existingAppsScript.test.ts`
loads the existing script and the platform file together and covers the admin token fix.

| # | Case | Where verified |
| --- | --- | --- |
| 1, 4, 11 | 2026 registration, Model Rocketry only, rows in the spreadsheet | backend test; browser (local) |
| 2 | A different team registers for 2027 once opened | backend test |
| 3 | CTA always "Register Team" | component + website tests |
| 5, 6, 7 | CAN-7USAT only; both categories → one team, two associations | backend test; browser |
| 8, 9, 10 | Several members, four mentors (fifth refused), photos and resumes | backend test; browser uploads |
| 12 | Rejected submission not public, leader emailed, editing locked | backend test |
| 13, 14, 16 | Approval shows only approved, consented information | backend test; browser |
| 15 | Registered but unverified team never labelled a participant | backend + website tests |
| 17, 18, 19 | Non-winner not in winners; winner in both; one category won | backend test; browser |
| 20, 21 | Initials avatar fallback; missing links hidden | component tests; browser |
| 22–25 | Edit of a published profile stays pending, approval publishes it without a deploy | backend test; browser (local) |
| 26 | Contact details follow individual consent | backend test; browser consent page |
| 27 | Resumes never served anonymously | backend test; HTTP 404 check |
| 28, 29 | PDFs view/download when published; no broken links otherwise | backend + component tests; browser |
| 30 | Drone competition configured without new registration/directory code | backend, website and component tests |

## 7. Local development

```bash
npm run dev            # uses the local backend automatically (no Google access needed)
npm test               # 63 tests
npm run competitions:dev-admin -- list          # play the reviewer against local data
npm run competitions:dev-admin -- approve EVS-XXXXXX
npm run competitions:dev-admin -- participant EVS-XXXXXX model-rocketry
npm run competitions:dev-admin -- mail          # sign-in codes and consent links
```

Locally, emails are printed in the dev server's terminal instead of being sent.

## 8. Unresolved items and recommendations

1. **Existing admin endpoint exposed registrations: fixed in code, not yet deployed.** The
   existing Apps Script accepted any admin "token" of five or more characters, and its URL is
   public, so anyone could list every registrant's name, email and phone. `verifyAdminToken` in
   `docs/unified-google-apps-script.js` now has Google verify the sign-in token and requires
   EV Society's OAuth client ID, a verified email equal to the admin address, and an unexpired
   token. It fails closed until the `ADMIN_OAUTH_CLIENT_ID` Script Property is set. The admin page
   asks for a new sign-in when Google's one-hour token expires. Registration input that looks like
   a formula is stored as text. `test_admin_api.js` no longer contains the URL, although it remains
   in git history and in the public `NEXT_PUBLIC_*` variables. Once the fix is deployed, the URL
   is harmless. Tests: `tests/admin/existingAppsScript.test.ts`.
2. **Go-live steps** in `google-apps-script/README.md` (paste script, router line, Script
   Properties, run setup, new deployment version, three Vercel variables).
3. **Award PDFs** were not supplied; both cards show "not published yet" until set in the Awards tab.
4. **Legal review:** consent wording, the privacy notice for student data (India's DPDP Act 2023,
   including verifiable guardian consent for under-18s), retention period and a grievance contact
   should be confirmed by EV Society's adviser. The `/policies` page does not yet describe this
   processing.
5. **Email quota:** a consumer Gmail owner can send about 100 emails a day; a Google Workspace
   account raises this to 1,500.
6. **Reviewer accounts:** Google identifies editors reliably only for the script owner (or the same
   Workspace domain). Other Gmail reviewers' edits will be refused; review as the owner account.
7. **Bot protection:** sign-in codes are rate-limited per email and IP; adding a CAPTCHA (for
   example Cloudflare Turnstile) would further protect the email quota.
8. **Not verified against real Google services:** Apps Script code is tested against an imitation;
   the first setup run in the real spreadsheet is the final check (run it with a test team first).
9. Leader email change and leader transfer are done by an administrator in the sheet.
