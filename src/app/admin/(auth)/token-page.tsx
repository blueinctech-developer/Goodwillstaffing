import Link from "next/link";
import styles from "@/components/admin/admin.module.css";
import { SetPasswordForm } from "@/components/admin/Forms";
import { inspectToken } from "@/lib/auth/tokens";
import { hasDatabase } from "@/lib/env";

/** Shared body of the reset-password and accept-invite pages. */
export async function TokenPage({ purpose, token }: { purpose: "invite" | "reset"; token: string }) {
  const account = hasDatabase() && token ? await inspectToken(purpose, token) : null;
  if (!account) {
    return (
      <>
        <h1 className={styles.h1}>Link expired</h1>
        <p className={styles.muted}>
          {purpose === "invite"
            ? "This invitation is invalid or has expired. Ask an owner to send a new one."
            : "This reset link is invalid, already used or expired."}
        </p>
        <p className={styles.authFoot}>
          <Link href={purpose === "invite" ? "/admin/login/" : "/admin/forgot-password/"}>
            {purpose === "invite" ? "Go to sign in" : "Request a new link"}
          </Link>
        </p>
      </>
    );
  }
  return (
    <>
      <h1 className={styles.h1}>{purpose === "invite" ? `Welcome, ${account.name}` : "Choose a new password"}</h1>
      <p className={styles.muted} style={{ marginTop: 0 }}>
        {purpose === "invite" ? "Set a password for " : "For "}
        <strong>{account.email}</strong>
      </p>
      <SetPasswordForm purpose={purpose} token={token} />
    </>
  );
}
