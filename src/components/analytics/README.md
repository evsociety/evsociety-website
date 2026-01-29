# GA4 Analytics Components

This directory contains components and utilities for Google Analytics 4 tracking across the EVSociety.org website.

## Core Components

### GoogleAnalytics.tsx
Injects the GA4 gtag.js script into the application.

- Uses Next.js `next/script` with `afterInteractive` strategy
- Configures GA4 with `send_page_view: false` to prevent duplicate page views
- Measurement ID: `G-1VQPB8G6T1`

**Usage:** Already integrated in `src/app/layout.tsx` - no additional setup needed.

### RouteAnalytics.tsx
Tracks page views on route changes in Next.js App Router.

- Monitors `usePathname()` and `useSearchParams()`
- Sends `page_view` events with page path and title
- Prevents duplicate tracking on initial mount

**Usage:** Already integrated in `src/app/layout.tsx` - no additional setup needed.

### TrackedButton.tsx
Wrapper component for tracking button clicks.

**Props:**
- `eventName` (string): GA4 event name (e.g., 'cta_click')
- `eventParams` (object): Event parameters
- All standard button props

**Example:**
```tsx
import TrackedButton from '@/components/analytics/TrackedButton';

<TrackedButton
  eventName="cta_click"
  eventParams={{ cta_id: 'join_now', page: '/about' }}
  className="btn-primary"
>
  Join Now
</TrackedButton>
```

### TrackedLink.tsx
Wrapper component for tracking link clicks with automatic type detection.

**Props:**
- `href` (string): Link destination
- `linkId` (string): Stable identifier for the link
- `eventParams` (object, optional): Additional event parameters
- `useNextLink` (boolean, optional): Use Next.js Link component (default: true)
- All standard anchor props

**Automatic Detection:**
- Internal links → `link_click` event
- External links → `outbound_click` event
- File downloads (.pdf, .doc, etc.) → `file_download` event

**Example:**
```tsx
import TrackedLink from '@/components/analytics/TrackedLink';

<TrackedLink
  href="/programs/evto"
  linkId="evto_program"
  className="text-primary"
>
  View EVTO Program
</TrackedLink>

<TrackedLink
  href="/documents/syllabus.pdf"
  linkId="evto_syllabus"
  className="text-primary"
>
  Download Syllabus
</TrackedLink>
```

## Utility Functions

### trackEvent(name, params)
Generic event tracking function.

**Parameters:**
- `name` (string): Event name (use lowercase with underscores)
- `params` (object, optional): Event parameters

**Example:**
```tsx
import { trackEvent } from '@/utils/analytics/ga4';

trackEvent('nav_click', {
  nav_item: 'programs',
  nav_location: 'header',
  destination_path: '/programs'
});
```

### trackPageView(path)
Tracks a page view event (automatically called by RouteAnalytics).

**Parameters:**
- `path` (string): Page path to track

**Example:**
```tsx
import { trackPageView } from '@/utils/analytics/ga4';

trackPageView('/programs');
```

## Event Naming Conventions

**Rules:**
1. Use lowercase letters only
2. Separate words with underscores
3. Be descriptive but concise
4. Avoid abbreviations unless widely understood

**Standard Events:**
- `page_view` - Page/route views
- `nav_click` - Navigation menu clicks
- `cta_click` - Call-to-action button clicks
- `button_click` - Generic button clicks
- `link_click` - Internal link clicks
- `outbound_click` - External link clicks
- `file_download` - File/PDF downloads
- `search_open` - Search modal opened
- `accordion_toggle` - Accordion expand/collapse
- `tab_select` - Tab selection
- `candidate_open` - Candidate profile viewed
- `project_open` - Project profile viewed

## Common Event Parameters

### Navigation Events
```typescript
{
  nav_item: string,          // e.g., 'programs', 'about'
  nav_location: string,      // 'header' | 'footer' | 'mobile_drawer'
  destination_path: string   // e.g., '/programs'
}
```

### CTA Events
```typescript
{
  cta_id: string,           // e.g., 'hero_join', 'view_details'
  page: string,             // Current page path
  section: string           // e.g., 'hero', 'featured_program'
}
```

### Link Events
```typescript
{
  link_id: string,          // Stable identifier
  link_url: string,         // Full URL
  link_type: string,        // 'internal' | 'outbound' | 'download'
  file_ext: string,         // For downloads: 'pdf', 'docx', etc.
  file_name: string         // For downloads (no PII)
}
```

## Debug Mode

Enable debug mode to see all tracked events in the browser console.

**Setup:**
1. Create `.env.local` in project root:
```bash
NEXT_PUBLIC_GA_DEBUG=true
```

2. Restart dev server:
```bash
npm run dev
```

3. Open browser console and navigate the site
4. You'll see logs like:
```
[GA4 Debug] page_view: { page_path: '/programs', page_title: 'Programs | EV Society™' }
[GA4 Debug] nav_click: { nav_item: 'programs', nav_location: 'header', destination_path: '/programs' }
```

**Important:** Set to `false` or remove for production.

## Privacy & PII

**DO NOT track:**
- User names
- Email addresses
- Phone numbers
- IP addresses
- Any personally identifiable information

**Safe to track:**
- Page paths
- Button/link identifiers
- Section names
- Generic user actions
- File names (without user data)

## Verification

### GA4 Realtime Dashboard
1. Open [Google Analytics](https://analytics.google.com/)
2. Navigate to Realtime report
3. Perform actions on the site
4. Events should appear within 30 seconds

### Browser Console (Debug Mode)
1. Enable debug mode (see above)
2. Open browser DevTools console
3. Navigate and interact with the site
4. Check console logs for event tracking

## Event Schema Reference

See `src/data/analytics/events.ts` for complete TypeScript interfaces and examples for all tracked events.
