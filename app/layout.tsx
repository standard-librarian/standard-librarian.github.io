import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { site } from "@/lib/site";
import { CommandPalette } from "@/components/CommandPalette";
import { getSearchItems } from "@/lib/search";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s | ${site.title}`
  },
  description: site.description,
  openGraph: {
    title: site.title,
    description: site.description,
    url: site.url,
    siteName: site.title,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description
  }
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const searchItems = await getSearchItems();

  return (
    <html lang="en">
      <body className={spaceGrotesk.variable}>
        <div className="page">
          <SiteHeader />
          <CommandPalette items={searchItems} />
          <main>{children}</main>
          <SiteFooter />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
