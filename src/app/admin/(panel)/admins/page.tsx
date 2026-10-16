import { asc, sql } from "drizzle-orm";
import type { Metadata } from "next";
import { changeRole, sendAccessLink, setAdminActive } from "@/app/admin/_actions/admins";
import styles from "@/components/admin/admin.module.css";
import { InviteForm } from "@/components/admin/Forms";
import { ActionButton, StatusBadge } from "@/components/admin/ui";
import { getDb } from "@/db";
import { admins } from "@/db/schema";
import { formatDateTime } from "@/lib/admin/submissions";
import { requireAdminPage } from "@/lib/auth/admin";

// Reads the session (or a token) at request time; navigations may block.
export const instant = false;

export const metadata: Metadata = { title: "Admins" };

export default async function AdminsPage() {
  const me = await requireAdminPage("owner");
  const rows = await getDb()
    .select({
      id: admins.id,
      name: admins.name,
      email: admins.email,
      role: admins.role,
      isActive: admins.isActive,
      hasPassword: sql<boolean>`${admins.passwordHash} is not null`,
      lastLoginAt: admins.lastLoginAt,
    })
    .from(admins)
    .orderBy(asc(admins.name));

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.h1}>Admins</h1>
      </div>
      <div className={styles.card}>
        <h2 className={styles.h2}>Invite an admin</h2>
        <InviteForm />
      </div>
      <div className={styles.tableWrap} style={{ marginTop: "1rem" }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last sign-in</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => {
              const self = a.id === me.id;
              return (
                <tr key={a.id}>
                  <td>
                    <strong>{a.name}</strong>
                    {self && <span className={styles.muted}> (you)</span>}
                    <div className={`${styles.muted} ${styles.small}`}>{a.email}</div>
                  </td>
                  <td>
                    {self ? (
                      a.role
                    ) : (
                      <ActionButton
                        action={changeRole}
                        fields={{ id: a.id, role: a.role === "owner" ? "editor" : "owner" }}
                      >
                        {a.role} → {a.role === "owner" ? "editor" : "owner"}
                      </ActionButton>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={!a.isActive ? "inactive" : a.hasPassword ? "active" : "invited"} />
                  </td>
                  <td className={styles.small}>{a.lastLoginAt ? formatDateTime(a.lastLoginAt) : "Never"}</td>
                  <td>
                    {!self && (
                      <div className={styles.actions}>
                        {a.isActive && (
                          <ActionButton action={sendAccessLink} fields={{ id: a.id }}>
                            {a.hasPassword ? "Send reset link" : "Resend invite"}
                          </ActionButton>
                        )}
                        {a.isActive ? (
                          <ActionButton
                            action={setAdminActive.bind(null, false)}
                            fields={{ id: a.id }}
                            variant="danger"
                            confirm={`Deactivate ${a.name}? They'll be signed out immediately.`}
                          >
                            Deactivate
                          </ActionButton>
                        ) : (
                          <ActionButton action={setAdminActive.bind(null, true)} fields={{ id: a.id }}>
                            Reactivate
                          </ActionButton>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
