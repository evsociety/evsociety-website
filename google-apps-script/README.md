# Competition platform: Google Apps Script setup

`competition-platform.js` is the backend for the competition team platform. It runs inside the
**existing** Apps Script project bound to the "EVSociety Registrations" spreadsheet, next to the
current registration script, and stores everything in new tabs of that same spreadsheet.
It never edits the existing registrations tab.

Nothing here is live until you do the steps below. The website degrades gracefully until then:
Register Team says "opening soon" and the directories show their empty states.

## Urgent: deploy the admin fix first (5 minutes)

The admin fix does not depend on the competition platform and should go live first:

1. Extensions → Apps Script → open `Code.gs` → replace its contents with
   `docs/unified-google-apps-script.js`.
2. Project Settings → Script Properties → add `ADMIN_OAUTH_CLIENT_ID` = the website's
   `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
3. **Grant the new permission:** back in the editor, choose `getSheet` in the function list and
   click Run (it only reads the sheet). Approve the prompt, which now includes "Connect to an
   external service". The token check needs it; without it, every admin request is refused.
4. Deploy → Manage deployments → edit the existing deployment → *New version* → Deploy.
5. Check: `ADMIN_API_URL=<web app URL> node test_admin_api.js` prints `Access denied`, and
   signing in at `/admin/registrations` still loads registrations.

Every **active** deployment runs the version it is pinned to. Check Deploy → Manage deployments:
older active deployments keep serving old code at their own URLs, so update them to the new
version or archive them. (Done on 6 Nov 2026 for the deployment the websites use; five older
active deployments were still on versions 5–12.)

Until the platform file is added, the router line in `doPost` is reached only by signed
competition requests, which fail harmlessly. Public registration and the admin page work as before.

## One-time setup (about 15 minutes)

1. **Generate two secrets** (any random strings of 32+ characters), for example in a terminal:
   `openssl rand -hex 32` (run it twice). Call them API secret and session secret.
2. **Open the script editor**: open the spreadsheet → Extensions → Apps Script.
3. **Add the platform file**: click + next to Files → Script → name it `competition-platform`,
   then paste the whole contents of `google-apps-script/competition-platform.js`.
4. **Update the existing script file** (`Code.gs`): replace its contents with
   `docs/unified-google-apps-script.js` from this repository. That version
   - routes signed competition requests to the new file (one line in `doPost`),
   - **fixes the admin endpoint**: it now asks Google to verify the admin's sign-in token, where it
     previously accepted any text of five or more characters and so exposed every registrant's
     name, email and phone,
   - stores visitor input that starts with `=`, `+`, `-` or `@` as text, not as a formula.
5. **Script Properties** (Project Settings → Script Properties → Add):

   | Property | Value |
   | --- | --- |
   | `ADMIN_OAUTH_CLIENT_ID` | the website's `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (ends in `.apps.googleusercontent.com`). Required by the admin page; without it every admin request is refused |
   | `EVSC_API_SECRET` | the API secret from step 1 |
   | `EVSC_SITE_URL` | `https://www.evsociety.org` |
   | `EVSC_REVALIDATE_URLS` | `https://www.evsociety.org/api/competitions/revalidate` (comma-separate several sites if needed) |
   | `EVSC_REVIEWERS` | optional: extra reviewer emails, comma-separated. The script owner is always a reviewer. |
   | `EVSC_ADMIN_NOTIFY_EMAIL` | optional: where deletion requests are sent (default `evsociety.org@gmail.com`) |

6. **Run setup once**: in the editor choose `evsCompetitionSetup` in the function list → Run →
   accept the permissions (Sheets, Drive, Mail, external requests, triggers). The execution log
   lists what it created: the nine tabs, a private Drive folder for uploads, the review trigger,
   the menu, and the seeded IN-SPACe competition and award rows. Running it again is safe.
7. **Deploy a new version**: Deploy → Manage deployments → edit (pencil) the existing deployment →
   Version: *New version* → Deploy. The URL stays the same, so existing registration keeps working.
8. **Vercel environment variables** (Production, and Preview if wanted), then redeploy the site:

   | Variable | Value |
   | --- | --- |
   | `COMPETITION_API_URL` | the web app URL (same as `NEXT_PUBLIC_REGISTRATION_API_URL`) |
   | `COMPETITION_API_SECRET` | the API secret (same as `EVSC_API_SECRET`) |
   | `COMPETITION_SESSION_SECRET` | the session secret |

   Never give these a `NEXT_PUBLIC_` prefix.

## Check it works

- **Admin fix:** run `ADMIN_API_URL=<web app URL> node test_admin_api.js`. It must print
  `Access denied. Invalid token.`. Then sign in at `/admin/registrations` with the admin Google
  account; registrations should load. Admin sign-ins now last about an hour (Google's token
  lifetime), after which the page asks you to sign in again.
- In the spreadsheet: **EV Society Competitions → Check setup** (menu appears after reloading).
- On the website: register a test team with your own email, then review it as described in
  `docs/competition-platform/ADMIN-GUIDE.md`. Delete the test team afterwards with
  **EV Society Competitions → Delete selected team permanently…**.

## Notes

- **Reviewer identity.** Approval edits are honoured only when Google can identify the editor
  as a reviewer. That is always true for the account that owns the script. Other Gmail accounts
  usually cannot be identified by Google; make review decisions while signed in as the owner
  account (or use accounts in the same Google Workspace domain).
- **Email quota.** Consumer Gmail accounts can send about 100 emails a day from Apps Script
  (sign-in codes, member consent requests, decisions). Google Workspace accounts get 1,500.
- **Do not rename** the platform tabs or their header cells; adding your own columns is fine.
- The code is tested locally against an imitation of the Google services (`npm test`); the
  first real run in your spreadsheet is still the final check.
