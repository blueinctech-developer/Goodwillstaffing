import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import styles from "@/components/admin/admin.module.css";

// The admin has its own chrome (no public Header/Footer) and is never indexed.
// Every admin route reads the session cookie at request time, so navigations
// are allowed to block, and this boundary keeps those request-time reads out
// of the (empty) static shell.
export const instant = false;

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Goodwill admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.root}>
      <Suspense fallback={<p style={{ padding: "2rem" }}>Loading…</p>}>{children}</Suspense>
    </div>
  );
}
