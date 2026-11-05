import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import RouteAnalytics from "@/components/analytics/RouteAnalytics";
import { CONTACT, OG_IMAGE, ORGANISATION_DESCRIPTOR, SITE_DESCRIPTION, SITE_URL } from "@/config/site";

const inter = Inter({ subsets: ["latin"] });

const siteDescription = SITE_DESCRIPTION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `EV Society™ | ${ORGANISATION_DESCRIPTOR}`,
    template: "%s | EV Society™",
  },
  description: siteDescription,
  applicationName: "EV Society™",
  keywords: [
    "EV Society",
    ORGANISATION_DESCRIPTOR,
    "eVTOL",
    "electric vertical take-off and landing",
    "electric vertical",
    "advanced air mobility",
    "electric aviation",
    "air taxi",
    "urban air mobility",
    "eVTOL safety",
    "eVTOL standards and certification",
    "Electric Vertical research",
    "Electric Vertical training",
    "battery safety",
    "vertiport charging infrastructure",
    "electric propulsion",
    "BMS",
    "power electronics",
    "aerospace research",
    "defence research",
    "space research",
    "space innovation",
    "model rocketry",
    "CanSat",
    "sustainability",
  ],
  // No site-wide canonical, og:title or og:url here: pages that inherited them were all
  // pointing search engines and social previews at the home page. Each page sets its own.
  openGraph: {
    type: "website",
    siteName: "EV Society™",
    images: [OG_IMAGE],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    images: [OG_IMAGE.url],
  },
  icons: {
    icon: [{ url: "/icon.png" }],
    apple: [{ url: "/apple-icon.png" }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

// JSON-LD Structured Data
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "EV Society",
  alternateName: ["EV Society™", `EV Society – ${ORGANISATION_DESCRIPTOR}`],
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/brand/evsociety-logo.png`,
    width: 512,
    height: 512,
  },
  description: siteDescription,
  slogan: ORGANISATION_DESCRIPTOR,
  knowsAbout: [
    "Electric vertical take-off and landing (eVTOL) aircraft",
    "Advanced air mobility",
    "Aerospace",
    "Defence",
    "Space",
    "Electric propulsion",
    "Battery safety",
    "Vertiport and charging infrastructure",
    "eVTOL standards, testing and certification",
    "Electric Vertical skills and certification",
  ],
  email: CONTACT.email,
  telephone: CONTACT.telephone,
  address: {
    "@type": "PostalAddress",
    addressLocality: CONTACT.locality,
    addressRegion: CONTACT.region,
    postalCode: CONTACT.postalCode,
    addressCountry: CONTACT.country,
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "general enquiries",
    email: CONTACT.email,
    telephone: CONTACT.telephone,
    areaServed: "IN",
    availableLanguage: ["English"],
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "EV Society™",
  alternateName: `EV Society | ${ORGANISATION_DESCRIPTOR}`,
  url: SITE_URL,
  description: siteDescription,
  inLanguage: "en",
  publisher: { "@id": `${SITE_URL}/#organization` },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Plain script tags so the structured data is in the server HTML for crawlers that don't run JavaScript */}
        <script
          id="organization-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          id="website-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <ClientLayout>
          {children}
        </ClientLayout>
        <GoogleAnalytics />
        <Suspense fallback={null}>
          <RouteAnalytics />
        </Suspense>
      </body>
    </html>
  );
}
