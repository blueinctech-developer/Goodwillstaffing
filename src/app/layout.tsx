import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SITE_URL } from "@/lib/site";
import styles from "./layout.module.css";
import "./globals.css";

// Vivian's licensed brand faces, self-hosted exactly as on the current site.
// Weight 600 maps to the "Regular"/"Medium" cuts, matching the original CSS.
const balto = localFont({
  variable: "--font-balto",
  display: "swap",
  src: [
    { path: "../fonts/balto/balto-book.woff2", weight: "400", style: "normal" },
    { path: "../fonts/balto/balto-medium.woff2", weight: "600", style: "normal" },
  ],
});

const spezia = localFont({
  variable: "--font-spezia",
  display: "swap",
  src: [
    { path: "../fonts/spezia/spezia-book.woff", weight: "400", style: "normal" },
    { path: "../fonts/spezia/spezia-regular.woff", weight: "600", style: "normal" },
    { path: "../fonts/spezia/spezia-regular-italic.woff2", weight: "600", style: "italic" },
  ],
});

// Site-wide defaults; each page supplies its own title and social tags via
// `pageMetadata` in src/lib/metadata.ts.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Vivian Health",
  facebook: { appId: "1736870763275572" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${balto.variable} ${spezia.variable}`}>
      <body>
        <div className={styles.shell}>
          <Header />
          <main id="core-layout-main" className={styles.main}>
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
