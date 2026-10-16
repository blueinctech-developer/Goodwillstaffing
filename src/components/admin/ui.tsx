"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { IDLE, type ActionState } from "@/lib/admin/types";
import styles from "./admin.module.css";

export type FormAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/** Submit button that disables itself while its form's action runs. */
export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  variant,
  small,
  name,
  value,
}: {
  children: ReactNode;
  pendingLabel?: string;
  variant?: "secondary" | "danger";
  small?: boolean;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      className={cx(styles.button, variant && styles[variant], small && styles.sm)}
      disabled={pending}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

/** Shows the message of an action result; a returned link is shown copyable. */
export function ActionMessage({ state }: { state: ActionState }) {
  if (state.status === "idle") return null;
  return (
    <div
      className={state.status === "ok" ? styles.success : styles.error}
      role={state.status === "ok" ? "status" : "alert"}
    >
      {state.message}
      {state.status === "ok" && state.data?.link && (
        <p className={styles.mono} style={{ margin: "0.5rem 0 0" }}>
          {state.data.link}
        </p>
      )}
    </div>
  );
}

export function FieldError({ state, name }: { state: ActionState; name: string }) {
  const message = state.status === "error" ? state.errors?.[name] : undefined;
  return message ? <p className={styles.fieldError}>{message}</p> : null;
}

/**
 * A one-button form for row actions (status change, delete, resend). Hidden
 * fields carry the ids; `confirm` asks before submitting.
 */
export function ActionButton({
  action,
  fields,
  children,
  confirm,
  variant = "secondary",
  pendingLabel = "Working…",
}: {
  action: FormAction;
  fields: Record<string, string | string[]>;
  children: ReactNode;
  confirm?: string;
  variant?: "secondary" | "danger" | "primary";
  pendingLabel?: string;
}) {
  const [state, formAction] = useActionState(action, IDLE);
  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (confirm && !window.confirm(confirm)) event.preventDefault();
      }}
      style={{ display: "inline-flex", flexDirection: "column", gap: "0.25rem" }}
    >
      {Object.entries(fields).flatMap(([name, value]) =>
        (Array.isArray(value) ? value : [value]).map((v) => (
          <input key={`${name}:${v}`} type="hidden" name={name} value={v} />
        )),
      )}
      <SubmitButton small variant={variant === "primary" ? undefined : variant} pendingLabel={pendingLabel}>
        {children}
      </SubmitButton>
      {state.status === "error" && <span className={styles.fieldError}>{state.message}</span>}
      {state.status === "ok" && state.data?.link && (
        <span className={cx(styles.small, styles.mono)}>
          {state.message} {state.data.link}
        </span>
      )}
    </form>
  );
}

export type NavItem = { href: string; label: string; count?: number };

export function AdminNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className={styles.nav} aria-label="Admin">
      {items.map((item) => {
        const active =
          item.href === "/admin/" ? pathname === "/admin/" || pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className={styles.navLink} aria-current={active ? "page" : undefined}>
            {item.label}
            {item.count ? <span className={styles.navCount}>{item.count}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={styles.badge} data-tone={status}>
      {status}
    </span>
  );
}
