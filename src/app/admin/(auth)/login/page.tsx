import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import styles from "@/components/admin/admin.module.css";
import { LoginForm } from "@/components/admin/Forms";
import { getCurrentAdmin } from "@/lib/auth/admin";
import { safeRedirectPath } from "@/lib/security/request";

// Reads the session (or a token) at request time; navigations may block.
export const instant = false;

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const nextParam = typeof params.next === "string" ? safeRedirectPath(params.next, "") : "";
  const next = nextParam.startsWith("/admin/") ? nextParam : undefined;
  if (await getCurrentAdmin()) redirect(next ?? "/admin/");
  return (
    <>
      <h1 className={styles.h1}>Goodwill admin</h1>
      <p className={styles.muted} style={{ marginTop: 0 }}>
        Sign in to manage submissions and site content.
      </p>
      <LoginForm next={next} />
      <p className={styles.authFoot}>
        <Link href="/admin/forgot-password/">Forgot your password?</Link>
      </p>
    </>
  );
}
