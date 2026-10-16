import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import styles from "./layout.module.css";

// Chrome for every public page. Moving it into this route group keeps every
// public URL unchanged while /admin renders its own layout.
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <Header />
      <main id="core-layout-main" className={styles.main}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
