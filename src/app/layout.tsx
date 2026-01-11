import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EV Society™ | Innovation. Sustainability. Mobility.",
  description: "EV Society™ is a non-profit educational and technical community advancing electric mobility through research, safety, standards, and collaboration.",
  keywords: "EV, Electric Vehicles, Battery Safety, Charging Infrastructure, EV Standards, EV Research, Professional Society",
  openGraph: {
    title: "EV Society™",
    description: "Professional technical body for Electric Mobility.",
    type: "website",
    locale: "en_US",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
