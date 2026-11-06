# Adding a competition

A new competition (drone, robotics, eVTOL design…) needs configuration and content only. The
registration form, team editing, directories, team pages, award cards, API and backend are shared.

1. **Definition.** Copy `src/config/competitions/inspace.ts` to a new file and change the fields:
   `id` and `slug` (URL-safe, the same value), `basePath` = `/programs/<slug>`, names, organiser,
   `categories`, `registrationOptions` (the choices in the form; each maps to category IDs),
   `rules` (mentor limit, optional team size), optional form `fields`, `directories`, `awards`
   (or `null`) and `copy`. `tests/competitions/droneCompetition.ts` is a complete example.
2. **Register it** in `COMPETITIONS` in `src/config/competitions/index.ts`.
3. **Landing page.** Set `landing: 'generic'` to use the built-in landing page at
   `/programs/<slug>`, or `'custom'` and create `src/app/programs/<slug>/page.tsx` (like the
   IN-SPACe page) with `<CompetitionJourneys competition={…} />` for the four journeys.
4. **Spreadsheet row.** In the Competitions tab add a row with Competition ID, Name, Slug and
   Organiser, then set (as a reviewer, so they are signed) Categories (the category IDs,
   comma-separated), Available Years, Registration Years, Default Registration Year, Registration
   Status `Open`, Public Visibility `Public`, Show Registered Teams, and Configuration, e.g.
   `{"maxMentors":2,"maxMembers":4}`. Without this row registration stays closed.
5. Optionally add it to the Programs menu (`src/data/programs/menu.ts`) and add award rows.

That is all: `/programs/<slug>/register`, `/manage`, `/participants`, `/winners` and
`/teams/<team>` work immediately, and the sitemap includes them.

The data model also supports individual entries (`participantType: 'individual'`, stored as a
one-person team with Entry Type `Individual`); the first release exposes team registration only.
