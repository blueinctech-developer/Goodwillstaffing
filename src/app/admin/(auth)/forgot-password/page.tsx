import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/components/admin/admin.module.css";
import { ForgotPasswordForm } from "@/components/admin/Forms";

// Reads the session (or a token) at request time; navigations may block.
export const instant = false;

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className={styles.h1}>Reset your password</h1>
      <p className={styles.muted} style={{ marginTop: 0 }}>
        Enter your admin email and we&apos;ll send you a link to choose a new password.
      </p>
      <ForgotPasswordForm />
      <p className={styles.authFoot}>
        <Link href="/admin/login/">Back to sign in</Link>
      </p>
    </>
  );
}
