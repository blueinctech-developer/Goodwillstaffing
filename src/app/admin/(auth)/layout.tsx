import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import styles from "@/components/admin/admin.module.css";
import { hasDatabase } from "@/lib/env";

/** Read the environment at request time, not when the build ran. */
async function DatabaseNotice() {
  await connection();
  if (hasDatabase()) return null;
  return (
    <p className={styles.notice}>
      The admin needs a database. Set <code>DATABASE_URL</code> in <code>.env.local</code>, then run{" "}
      <code>npm run db:migrate</code> and <code>npm run admin:create</code> (see README).
    </p>
  );
}

// Signed-out pages: sign in, forgot password, reset password, accept invite.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.authWrap}>
      <div className={styles.authCard}>
        <Suspense>
          <DatabaseNotice />
        </Suspense>
        <Suspense fallback={<p className={styles.muted}>Loading…</p>}>{children}</Suspense>
      </div>
    </div>
  );
}
