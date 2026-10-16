import "server-only";
import type { z } from "zod";
import { AuthError, requireAdmin, type CurrentAdmin } from "@/lib/auth/admin";
import { ConfigurationError } from "@/lib/env";
import { logger } from "@/lib/security/logger";
import type { ActionState } from "./types";

// Wraps every mutating admin Server Action: authenticate (and authorize) the
// caller from the session cookie, run the body, and turn expected failures
// into an ActionState the form can show. Next.js navigation errors (redirect,
// notFound) are rethrown untouched.

function isNavigationError(err: unknown) {
  const digest = (err as { digest?: unknown })?.digest;
  return (
    typeof digest === "string" && (digest.startsWith("NEXT_REDIRECT") || digest.startsWith("NEXT_HTTP_ERROR_FALLBACK"))
  );
}

export async function adminAction(
  run: (admin: CurrentAdmin) => Promise<ActionState>,
  opts: { role?: "owner" } = {},
): Promise<ActionState> {
  try {
    const admin = await requireAdmin(opts.role);
    return await run(admin);
  } catch (err) {
    if (isNavigationError(err)) throw err;
    if (err instanceof AuthError) return { status: "error", message: err.message };
    if (err instanceof ConfigurationError) return { status: "error", message: err.message };
    logger.error("Admin action failed", { err });
    return { status: "error", message: "Something went wrong. Please try again." };
  }
}

/** First message per field from a zod error, keyed by the dotted path. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    out[key] ??= issue.message;
  }
  return out;
}

export function invalid(error: z.ZodError): ActionState {
  const errors = fieldErrors(error);
  return { status: "error", message: Object.values(errors)[0] ?? "Please check the form.", errors };
}
