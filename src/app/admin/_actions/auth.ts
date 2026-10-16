"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { invalid } from "@/lib/admin/action";
import type { ActionState } from "@/lib/admin/types";
import { newPasswordSchema } from "@/lib/auth/password";
import { loginWithPassword, redeemToken, requestPasswordReset } from "@/lib/auth/service";
import { destroySession } from "@/lib/auth/session";
import { hasDatabase } from "@/lib/env";
import { logger } from "@/lib/security/logger";
import { getRequestContext } from "@/lib/security/request";

// Sign-in, sign-out, forgot password and set-password (reset or invitation).
// Server Actions get Next's Origin check, so these are CSRF-safe.

const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email({ error: "Enter a valid email address" }));
const UNAVAILABLE: ActionState = {
  status: "error",
  message: "The admin database isn't configured yet (DATABASE_URL).",
};
const UNEXPECTED: ActionState = { status: "error", message: "Something went wrong. Please try again." };

const loginSchema = z.object({
  email,
  password: z.string().min(1, { error: "Enter your password" }).max(128),
  next: z.string().max(300).optional(),
});

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!hasDatabase()) return UNAVAILABLE;
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);
  let destination: string;
  try {
    const result = await loginWithPassword({ ...parsed.data, ctx: await getRequestContext() });
    if (!result.ok) return { status: "error", message: result.error };
    destination = result.redirectTo;
  } catch (err) {
    logger.error("Login failed", { err });
    return UNEXPECTED;
  }
  redirect(destination);
}

export async function logout(): Promise<void> {
  try {
    if (hasDatabase()) await destroySession();
  } catch (err) {
    logger.error("Logout failed", { err });
  }
  redirect("/admin/login/");
}

export async function forgotPassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!hasDatabase()) return UNAVAILABLE;
  const parsed = z.object({ email }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);
  try {
    const result = await requestPasswordReset({ email: parsed.data.email, ctx: await getRequestContext() });
    if (!result.ok) return { status: "error", message: result.error };
  } catch (err) {
    logger.error("Forgot password failed", { err });
    return UNEXPECTED;
  }
  return {
    status: "ok",
    message: "If that email belongs to an admin, a link to set a new password is on its way. It expires in an hour.",
  };
}

const setPasswordSchema = z
  .object({ token: z.string().min(32).max(128), password: newPasswordSchema, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], error: "Passwords don't match" });

export async function setPassword(
  purpose: "invite" | "reset",
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!hasDatabase()) return UNAVAILABLE;
  if (purpose !== "invite" && purpose !== "reset") return UNEXPECTED;
  const parsed = setPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);
  let destination: string;
  try {
    const result = await redeemToken({
      purpose,
      token: parsed.data.token,
      password: parsed.data.password,
      ctx: await getRequestContext(),
    });
    if (!result.ok) return { status: "error", message: result.error };
    destination = result.redirectTo;
  } catch (err) {
    logger.error("Set password failed", { purpose, err });
    return UNEXPECTED;
  }
  redirect(destination);
}
