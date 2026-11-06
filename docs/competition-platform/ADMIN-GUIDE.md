# Reviewing teams in Google Sheets

All reviewing happens in the existing EV Society spreadsheet. Every decision you make in a
review column is checked, signed and logged by the review trigger, and the website updates
within seconds. Make decisions while signed in as the account that owns the script (or a
reviewer listed in `EVSC_REVIEWERS`); edits from anyone else are put back with a note.

## The separate decisions

| Decision | Where | What it means |
| --- | --- | --- |
| **Registration Status** | Teams | Is this a valid team registration? `Pending Review` → `Approved`, `Changes Requested` or `Rejected` |
| **Profile Approved** | Teams | Have you checked the names, photos and links? |
| **Publication Approved** | Teams | May the profile appear on the website? (needs Profile Approved = Yes) |
| **Participation Verified** | Team_Categories (one row per category) | Did the team actually take part in this category? |
| **Winner Verified** | Team_Categories | Officially verified winner in this category (needs Participation Verified = Yes). Check the organiser's official result first |
| **Official Result Reference** | Team_Categories | The `https://` link to the organiser's published result. Shown on the winners pages next to the verification date |
| **Team Photo Approved** | Teams | May the group photograph be shown? Set `Yes` only once permission to publish it is confirmed; it also needs the team's consent (Team Photo Consent = Yes). Resets to `No` when the team uploads a different photo |

**Team Code** (Teams) is the identifier the organiser gave the team, e.g. `Rocketry-001`. It is
shown with the team name and used in new profile addresses. Correct it if the team typed it wrongly.

Approving a registration never makes a team a participant or a winner. A team that entered both
Model Rocketry and CAN-7USAT has two Team_Categories rows, decided independently.

A team appears on **Participating Teams** only when the registration is approved, the profile and
publication are approved, the team consented to publication, and participation is verified in at
least one category. The **Profile Publication Status** column tells you what is actually live.

To list approved teams before participation is verified, set **Show Registered Teams** to `Yes`
in the Competitions tab. They are shown in a separate "Registered teams" view, labelled
"Registration approved", never as participants.

## Reviewing a new registration

1. Teams tab: find the row with Registration Status `Pending Review`. Check Members and Mentors
   (filter by Team ID) and the uploaded files (Files tab → Drive File ID, in the private folder).
2. To ask for changes: write what is needed in **Review Comments**, then set Registration Status
   to `Changes Requested`. The team leader is emailed the comments.
3. To accept: set Registration Status `Approved`, Profile Approved `Yes`, Publication Approved `Yes`.
4. After the competition: in Team_Categories set Participation Verified `Yes` for each category the
   team took part in, and Winner Verified `Yes` plus an **Achievement** (e.g. "First place") for
   verified winners.

If a cell snaps back with a note, read the note: it explains the rule (for example, verify
participation before marking a winner).

## Changes to a published profile

When a team leader edits an approved profile, the public profile does not change. Their edit
becomes a row in **Change_Requests** with a readable **Summary of Changes**. Set **Review Status**
to `Approved` to publish it, `Rejected` to discard it, or `Changes Requested` (with Review
Comments) to send it back. The team leader is emailed either way.

## Privacy rules the system enforces

- Other members' photos, LinkedIn, email and phone are shown only after that member agrees via
  the link emailed to them (Members → Consent Status, Publication Permissions). Members without an
  email are shown by name only. A member can hide themselves completely.
- Anyone marked **Under 18** is not shown at all until you set **Guardian Consent Verified** `Yes`
  after obtaining a parent's or guardian's consent.
- Resumes are never published; they are only in the private Drive folder.
- Mentors are listed only if the team leader confirmed the mentor agreed.
- A team withdrawing consent, or asking for deletion, is removed from the website immediately.

## Deleting data

Select the team's row in the Teams tab, then **EV Society Competitions → Delete selected team
permanently…**. This removes the team, members, mentors, category rows, change requests and file
records, and moves its uploads to the Drive trash. Deletion requests from team leaders arrive
by email and show `Deletion Requested = Yes`.

**Remove unused uploads** in the same menu clears files uploaded but never saved to a profile
(older than seven days).

## Award documents

In the **Awards** tab, put the document in **PDF Reference**: either a path to a file in the
website's `public` folder (for example `/programs/space-innovation/awards/can-7usat-2026.pdf`,
which needs a site deploy) or a Google Drive link to a PDF shared as "Anyone with the link".
Then set **Publication Status** to `Published`. **Award Status** stays `Proposed` until you change
it; nothing changes it automatically. An optional **Thumbnail Reference** (an image path or https
link) shows a preview.

## Years and registration

In the **Competitions** row: **Registration Years** lists the years teams can register for (add
`2027` when it opens; keep `2026` to allow late registrations), **Default Registration Year** is
preselected in the form, **Available Years** are the years shown in the directories, and
**Registration Status** `Closed` stops new registrations while leaving profile management open.

## Audit trail

Every decision, rejected edit, submission, consent change, upload and deletion is in
**Audit_Log** with who, when, before and after. The **Verification Metadata** columns hold the
signatures; do not edit them.
