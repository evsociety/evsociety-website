import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({ subsets: ["latin"] });

const siteDescription = "EV Society™ is a non-profit educational and technical community advancing electric mobility through research, safety, standards, skills, and collaboration across industry, academia, startups, and the public.";

export const metadata: Metadata = {
  metadataBase: new URL("https://evsociety.org"),
  title: {
    default: "EV Society™ | Innovation. Sustainability. Mobility.",
    template: "%s | EV Society™",
  },
  description: siteDescription,
  applicationName: "EV Society™",
  keywords: [
    "EV Society",
    "electric mobility",
    "electric vehicles",
    "EV safety",
    "battery safety",
    "charging infrastructure",
    "EV standards",
    "EV research",
    "EV training",
    "BMS",
    "power electronics",
    "EV policy",
    "sustainability",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "EV Society™",
    title: "EV Society™ | Innovation. Sustainability. Mobility.",
    description: siteDescription,
    url: "https://evsociety.org",
    images: [
      {
        url: "/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: "EV Society™ - Innovation. Sustainability. Mobility.",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "EV Society™ | Innovation. Sustainability. Mobility.",
    description: siteDescription,
    images: ["/brand/og-image.png"],
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
  name: "EV Society™",
  url: "https://evsociety.org",
  logo: "https://evsociety.org/brand/evsociety-logo.png",
  description: siteDescription,
  sameAs: [],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "EV Society™",
  url: "https://evsociety.org",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <Script
          id="organization-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <Script
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
      </body>
    </html>
  );
}
