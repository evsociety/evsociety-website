# EV Society™ Website

A production-quality, mobile-first website for a professional body dedicated to accelerating electric mobility.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Data:** Local JSON files for easy maintenance

## Local Development

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the result.

3. **Build and Test:**
   ```bash
   npm run build
   ```

## How to Add New Content

### 1. Add a New Partner
1. Open `src/data/partners.json`.
2. Add a new entry following the schema:
   ```json
   {
     "id": "p_009",
     "slug": "new-partner-name",
     "type": "company | institute | researcher",
     "name": "Partner Name",
     "shortDescription": "One line summary...",
     "about": "Detailed profile...",
     "logo": "/logos/new-partner.png",
     "location": { "city": "City", "state": "State", "country": "India" },
     "domains": ["Domain 1", "Domain 2"],
     "tags": ["Tag1", "Tag2"],
     "links": {
       "website": "https://...",
       "linkedin": "https://..."
     }
   }
   ```
3. Place the logo image in `public/logos/new-partner.png`.

### 2. Add a New Event
1. Open `src/data/events.json`.
2. Add a new entry. The site automatically sorts them by date.

### 3. Add a New Resource
1. Open `src/data/resources.json`.
2. Add the entry and place any downloadable files in `public/resources/` (if needed).

## Deployment

The simplest way to deploy is using **Vercel**:
1. Push your code to a GitHub repository.
2. Connect the repository to Vercel.
3. Vercel will automatically detect Next.js and deploy.

## Design Philosophy
- **Light Theme:** Prioritizes readability and institutional credibility using a clean white palette (#FFFFFF) with subtle surface grays (#F7F7F8).
- **Mobile First:** All components are designed starting from mobile breakpoints, with optimized touch targets and navigation.
- **Institutional Feel:** Minimal use of accent colors, strong primary typography, and generous negative space to convey professional authority.

## SEO & Accessibility
- **Semantic HTML:** Proper use of `<nav>`, `<main>`, `<section>`, `<footer>`, and heading hierarchy (H1-H4).
- **Metadata:** Comprehensive OpenGraph tags and metadata defined in the root layout.
- **Accessibility:** High contrast ratios, ARIA labels for interactive elements, and keyboard navigation support.
