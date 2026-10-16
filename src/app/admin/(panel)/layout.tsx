import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { logout } from "@/app/admin/_actions/auth";
import styles from "@/components/admin/admin.module.css";
import { AdminNav, type NavItem } from "@/components/admin/ui";
import { countsByForm } from "@/lib/admin/submissions";
import { requireAdminPage } from "@/lib/auth/admin";

// Signed-in admin chrome. requireAdminPage() redirects to /admin/login/ when
// there's no valid session; each page and action checks again for itself.
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdminPage();
  const counts = await countsByForm();
  const unread = counts.reduce((sum, c) => sum + c.new, 0);

  const items: NavItem[] = [
    { href: "/admin/", label: "Dashboard" },
    { href: "/admin/submissions/", label: "Submissions", count: unread },
    { href: "/admin/posts/", label: "Blog posts" },
    { href: "/admin/pages/", label: "Pages" },
    { href: "/admin/categories/", label: "Categories" },
    { href: "/admin/media/", label: "Media" },
    ...(admin.role === "owner" ? [{ href: "/admin/admins/", label: "Admins" }] : []),
  ];

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/admin/" className={styles.brand}>
          <span>
            Goodwill Staffing
            <small>Website admin</small>
          </span>
        </Link>
        <AdminNav items={items} />
        <div className={styles.sidebarFoot}>
          <span>
            {admin.name} · {admin.role}
          </span>
          <a href="/" target="_blank" rel="noopener">
            View site
          </a>
          <form action={logout}>
            <button type="submit" className={styles.linkButton}>
              Sign out
            </button>
          </form>
        </div>
      </aside>
      {/* Pages read the session and data at request time; navigating between
          them shows this fallback at once instead of blocking. */}
      <main className={styles.main}>
        <Suspense fallback={<p className={styles.muted}>Loading…</p>}>{children}</Suspense>
      </main>
    </div>
  );
}
