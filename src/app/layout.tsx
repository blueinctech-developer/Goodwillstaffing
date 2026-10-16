import type { Metadata, Viewport } from "next";
import { Caveat, DM_Sans } from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

// Goodwill's brand face (the Elementor kit's global typography), self-hosted
// at build time by next/font.
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  display: "swap",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

// Handwritten accent for short notes (the homepage hero annotation).
const caveat = Caveat({
  variable: "--font-script",
  display: "swap",
  subsets: ["latin"],
  weight: ["500"],
});

// Site-wide defaults; each page supplies its own title and social tags via
// `pageMetadata` in src/lib/metadata.ts.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// The public site's header and footer live in app/(site)/layout.tsx so the
// admin (app/admin) can have its own chrome under the same document shell.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-CA" className={`${dmSans.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
