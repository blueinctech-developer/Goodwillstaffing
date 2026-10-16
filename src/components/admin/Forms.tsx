"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { forgotPassword, login, setPassword } from "@/app/admin/_actions/auth";
import { inviteAdmin } from "@/app/admin/_actions/admins";
import { deleteCategory, saveCategory } from "@/app/admin/_actions/categories";
import { createPage } from "@/app/admin/_actions/pages";
import { saveNotes, updateStatus } from "@/app/admin/_actions/submissions";
import { IDLE } from "@/lib/admin/types";
import type { Category } from "@/lib/content";
import styles from "./admin.module.css";
import { ActionButton, ActionMessage, FieldError, StatusBadge, SubmitButton, cx } from "./ui";

// Small client forms for the admin, each bound to one Server Action.

// ------------------------------------------------------------- auth

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(login, IDLE);
  return (
    <form action={action}>
      <ActionMessage state={state} />
      {next && <input type="hidden" name="next" value={next} />}
      <label className={styles.field}>
        <span className={styles.label}>Email</span>
        <input className={styles.input} type="email" name="email" autoComplete="username" required autoFocus />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>Password</span>
        <input className={styles.input} type="password" name="password" autoComplete="current-password" required />
      </label>
      <SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(forgotPassword, IDLE);
  if (state.status === "ok") return <ActionMessage state={state} />;
  return (
    <form action={action}>
      <ActionMessage state={state} />
      <label className={styles.field}>
        <span className={styles.label}>Email</span>
        <input className={styles.input} type="email" name="email" autoComplete="username" required autoFocus />
      </label>
      <SubmitButton pendingLabel="Sending…">Email me a link</SubmitButton>
    </form>
  );
}

export function SetPasswordForm({ purpose, token }: { purpose: "invite" | "reset"; token: string }) {
  const [state, action] = useActionState(setPassword.bind(null, purpose), IDLE);
  return (
    <form action={action}>
      <ActionMessage state={state} />
      <input type="hidden" name="token" value={token} />
      <label className={styles.field}>
        <span className={styles.label}>New password</span>
        <input
          className={styles.input}
          type="password"
          name="password"
          autoComplete="new-password"
          minLength={12}
          required
          autoFocus
        />
        <span className={styles.hint}>At least 12 characters. A short sentence works well.</span>
        <FieldError state={state} name="password" />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>Confirm password</span>
        <input className={styles.input} type="password" name="confirm" autoComplete="new-password" required />
        <FieldError state={state} name="confirm" />
      </label>
      <SubmitButton>{purpose === "invite" ? "Set password and sign in" : "Save and sign in"}</SubmitButton>
    </form>
  );
}

// ------------------------------------------------------------- submissions

export type SubmissionRow = {
  id: string;
  formTitle: string;
  status: string;
  summary: string;
  date: string;
  files: number;
  legacy: boolean;
};

const BULK = [
  { status: "read", label: "Mark read" },
  { status: "new", label: "Mark unread" },
  { status: "archived", label: "Archive" },
  { status: "spam", label: "Spam" },
] as const;

/** Submissions table with row selection and bulk status changes. */
export function SubmissionsTable({ rows, showForm }: { rows: SubmissionRow[]; showForm: boolean }) {
  const [state, action] = useActionState(updateStatus, IDLE);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <form
      action={(fd) => {
        action(fd);
        setSelected(new Set());
      }}
    >
      <ActionMessage state={state} />
      <div className={styles.bulkBar}>
        <span className={styles.muted}>
          {selected.size ? `${selected.size} selected` : "Select rows for bulk actions"}
        </span>
        {BULK.map((b) => (
          <button
            key={b.status}
            type="submit"
            name="status"
            value={b.status}
            className={cx(styles.button, styles.secondary, styles.sm)}
            disabled={selected.size === 0}
          >
            {b.label}
          </button>
        ))}
      </div>
      {[...selected].map((id) => (
        <input key={id} type="hidden" name="ids" value={id} />
      ))}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: "2rem" }}>
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={allSelected}
                  onChange={() => setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)))}
                />
              </th>
              <th>Received</th>
              {showForm && <th>Form</th>}
              <th>From</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={r.status === "new" ? styles.unread : undefined}>
                <td>
                  <input
                    type="checkbox"
                    aria-label="Select"
                    checked={selected.has(r.id)}
                    onChange={() => toggle(r.id)}
                  />
                </td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <Link href={`/admin/submissions/${r.id}/`}>{r.date}</Link>
                </td>
                {showForm && <td>{r.formTitle}</td>}
                <td>
                  {r.summary || <span className={styles.muted}>(no name)</span>}
                  {r.files > 0 && (
                    <span className={styles.muted}>
                      {" "}
                      · {r.files} file{r.files === 1 ? "" : "s"}
                    </span>
                  )}
                  {r.legacy && <span className={styles.muted}> · imported</span>}
                </td>
                <td>
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </form>
  );
}

export function NotesForm({ id, notes }: { id: string; notes: string }) {
  const [state, action] = useActionState(saveNotes, IDLE);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <label className={styles.field}>
        <span className={styles.label}>Internal notes</span>
        <textarea className={styles.textarea} name="notes" defaultValue={notes} maxLength={10_000} rows={5} />
        <span className={styles.hint}>Only visible in the admin.</span>
      </label>
      <div className={styles.actions}>
        <SubmitButton small>Save notes</SubmitButton>
        {state.status !== "idle" && (
          <span className={state.status === "ok" ? styles.muted : styles.fieldError}>{state.message}</span>
        )}
      </div>
    </form>
  );
}

// ------------------------------------------------------------- categories

export function CategoryForm({ category }: { category?: Category }) {
  const [state, action] = useActionState(saveCategory.bind(null, category?.slug ?? null), IDLE);
  return (
    <form action={action} className={styles.inline} style={{ alignItems: "flex-start" }}>
      <label className={styles.field}>
        <span className={styles.label}>Name</span>
        <input className={styles.input} name="name" defaultValue={category?.name} required maxLength={100} />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>Slug</span>
        <input
          className={styles.input}
          name="slug"
          defaultValue={category?.slug}
          maxLength={100}
          placeholder="from the name"
        />
        <FieldError state={state} name="slug" />
      </label>
      <label className={styles.field} style={{ flex: 1, minWidth: "14rem" }}>
        <span className={styles.label}>Description</span>
        <input className={styles.input} name="description" defaultValue={category?.description} maxLength={1000} />
      </label>
      <div className={styles.field}>
        <span className={styles.label}>&nbsp;</span>
        <SubmitButton small>{category ? "Save" : "Add category"}</SubmitButton>
      </div>
      {state.status === "error" && !state.errors?.slug && <p className={styles.fieldError}>{state.message}</p>}
      {state.status === "ok" && !category && <p className={styles.muted}>{state.message}</p>}
    </form>
  );
}

export function DeleteCategoryButton({ slug, name }: { slug: string; name: string }) {
  return (
    <ActionButton
      action={deleteCategory}
      fields={{ slug }}
      variant="danger"
      confirm={`Delete the "${name}" category? Posts keep their content but lose this category, and /category/${slug}/ stops working.`}
    >
      Delete
    </ActionButton>
  );
}

// ------------------------------------------------------------- admins & pages

export function InviteForm() {
  const [state, action] = useActionState(inviteAdmin, IDLE);
  return (
    <form action={action}>
      <ActionMessage state={state} />
      <div className={styles.inline}>
        <label className={styles.field}>
          <span className={styles.label}>Name</span>
          <input className={styles.input} name="name" required maxLength={100} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Email</span>
          <input className={styles.input} type="email" name="email" required maxLength={254} />
          <FieldError state={state} name="email" />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Role</span>
          <select className={styles.select} name="role" defaultValue="editor">
            <option value="editor">Editor (content and submissions)</option>
            <option value="owner">Owner (also manages admins)</option>
          </select>
        </label>
        <SubmitButton pendingLabel="Inviting…">Send invitation</SubmitButton>
      </div>
    </form>
  );
}

export function NewPageForm() {
  const [state, action] = useActionState(createPage, IDLE);
  return (
    <form action={action}>
      <ActionMessage state={state} />
      <div className={styles.inline}>
        <label className={styles.field}>
          <span className={styles.label}>Title</span>
          <input className={styles.input} name="title" required maxLength={300} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Address (optional)</span>
          <input className={styles.input} name="slug" maxLength={100} placeholder="from the title" />
          <FieldError state={state} name="slug" />
        </label>
        <SubmitButton pendingLabel="Creating…">Create draft page</SubmitButton>
      </div>
    </form>
  );
}
