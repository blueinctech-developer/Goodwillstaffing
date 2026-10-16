"use server";

import { headers } from "next/headers";
import { hashIp } from "@/lib/security/crypto";
import { rateLimit } from "@/lib/security/rate-limit";
import { getForm } from "./index";
import { forwardToSalesforce } from "./salesforce";
import { handleSubmission, recordSubmissionOutcome } from "./sink";
import type { FormState } from "./types";
import { directUploadsEnabled, prepareUpload, verifyUploads } from "./uploads";
import { validateSubmission } from "./validate";

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || undefined;
}

/**
 * Server Action for every site form. Bind the form id and pass to useActionState:
 *   const [state, action, pending] = useActionState(submitForm.bind(null, id), { status: "idle" })
 */
export async function submitForm(formId: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const definition = getForm(formId);
  if (!definition) {
    return { status: "error", message: "This form is no longer available.", errors: {} };
  }

  const result = validateSubmission(definition, formData);
  if (!result.ok) {
    return { status: "error", message: "Please correct the highlighted fields and try again.", errors: result.errors };
  }
  // Bots that filled the honeypot get the normal success message and nothing is stored.
  if (result.spam) return { status: "success", message: definition.successMessage };

  const h = await headers();
  const meta = {
    submittedAt: new Date().toISOString(),
    ip: await clientIp(),
    userAgent: h.get("user-agent") ?? undefined,
    referer: h.get("referer") ?? undefined,
  };

  const limited = await rateLimit("formSubmitByIp", hashIp(meta.ip) ?? "unknown");
  if (!limited.success) {
    return {
      status: "error",
      message: "You've sent several submissions in a short time. Please wait a few minutes and try again.",
      errors: {},
    };
  }

  // Files uploaded straight to S3 are checked against the bucket before anything is stored.
  const uploads = await verifyUploads(definition, result.files).catch((error: unknown) => {
    console.error(`[forms] Could not verify uploads for ${definition.id}`, error instanceof Error ? error.name : error);
    return null;
  });
  if (!uploads) {
    return {
      status: "error",
      message: "Sorry, we couldn't check your files. Please try again in a moment.",
      errors: {},
    };
  }
  if (!uploads.ok) {
    return { status: "error", message: "Please correct the highlighted fields and try again.", errors: uploads.errors };
  }

  let receipt;
  try {
    receipt = await handleSubmission(definition, result.values, uploads.files, meta);
  } catch (error) {
    console.error(
      `[forms] Failed to store ${definition.id} submission`,
      error instanceof Error ? error.message : error,
    );
    return {
      status: "error",
      message: "Sorry, we couldn't send your submission. Please try again in a moment.",
      errors: {},
    };
  }

  // The submission is already stored, so a Salesforce failure is recorded, not shown.
  if (definition.salesforce) {
    const outcome = await forwardToSalesforce(definition, result.values);
    if (receipt.stored) await recordSubmissionOutcome(receipt.id, { salesforce: outcome });
  }

  return { status: "success", message: definition.successMessage };
}

export type UploadRequest = { name: string; type: string; size: number };

export type UploadResponse =
  | { status: "ok"; key: string; url: string; contentType: string }
  /** S3 isn't configured: post the file with the form instead. */
  | { status: "disabled" }
  | { status: "error"; message: string };

/**
 * Presign a direct browser -> S3 upload for one file of a form's file field.
 * The field, type and size are checked against the definition here and again
 * (with the object's real size) when the form is submitted.
 */
export async function requestUpload(formId: string, field: string, file: UploadRequest): Promise<UploadResponse> {
  if (!directUploadsEnabled()) return { status: "disabled" };
  const definition = getForm(formId);
  if (
    !definition ||
    typeof field !== "string" ||
    !file ||
    typeof file.name !== "string" ||
    typeof file.size !== "number"
  ) {
    return { status: "error", message: "This upload is not accepted." };
  }

  const limited = await rateLimit("formUploadByIp", hashIp(await clientIp()) ?? "unknown");
  if (!limited.success)
    return { status: "error", message: "Too many uploads. Please wait a few minutes and try again." };

  try {
    const ticket = await prepareUpload(definition, field, {
      name: file.name.slice(0, 255),
      size: file.size,
      type: typeof file.type === "string" ? file.type.slice(0, 100) : "",
    });
    if ("error" in ticket) return { status: "error", message: ticket.error };
    return { status: "ok", ...ticket };
  } catch (error) {
    console.error(`[forms] Could not presign upload for ${definition.id}`, error instanceof Error ? error.name : error);
    return { status: "error", message: "Uploads are unavailable right now. Please try again in a moment." };
  }
}
