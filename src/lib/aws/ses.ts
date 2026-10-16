import "server-only";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { awsCredentials, hasSes, isProduction, sesConfig } from "@/lib/env";
import { logger } from "@/lib/security/logger";

export type Email = { subject: string; text: string; html: string };
export type EmailResult = { status: "sent" | "skipped" | "failed"; error?: string };

const globalForSes = globalThis as unknown as { __gwSes?: SESv2Client };

function ses(): SESv2Client {
  if (!globalForSes.__gwSes) {
    globalForSes.__gwSes = new SESv2Client({ region: sesConfig().region, credentials: awsCredentials() });
  }
  return globalForSes.__gwSes;
}

/**
 * Send one email through SES. Never throws: callers record the outcome.
 * Without SES configured the email is skipped; in development its text is
 * printed so invite and reset links can still be followed locally.
 */
export async function sendEmail(to: string[], email: Email, opts: { replyTo?: string } = {}): Promise<EmailResult> {
  if (to.length === 0) return { status: "skipped", error: "No recipients configured" };
  if (!hasSes()) {
    if (!isProduction) console.info(`[email] SES not configured; would send "${email.subject}"\n${email.text}`);
    return { status: "skipped", error: "SES not configured" };
  }
  try {
    await ses().send(
      new SendEmailCommand({
        FromEmailAddress: sesConfig().from,
        Destination: { ToAddresses: to },
        ReplyToAddresses: opts.replyTo ? [opts.replyTo] : undefined,
        Content: {
          Simple: {
            Subject: { Data: email.subject, Charset: "UTF-8" },
            Body: { Text: { Data: email.text, Charset: "UTF-8" }, Html: { Data: email.html, Charset: "UTF-8" } },
          },
        },
      }),
    );
    return { status: "sent" };
  } catch (err) {
    logger.error("SES send failed", { err });
    return { status: "failed", error: err instanceof Error ? err.name : "Unknown error" };
  }
}

export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

/** Wrap a body in a plain, client-safe email layout. */
export function emailLayout(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f0edf5;font-family:Arial,Helvetica,sans-serif;color:#0a0a0a">
<div style="max-width:640px;margin:0 auto;padding:24px">
<div style="background:#fff;border-radius:12px;padding:24px">
<h1 style="margin:0 0 16px;font-size:20px;color:#124e3b">${escapeHtml(title)}</h1>
${bodyHtml}
</div>
<p style="font-size:12px;color:#757478;margin:16px 0 0">Goodwill Staffing &amp; Recruitment</p>
</div></body></html>`;
}

export function emailButton(href: string, label: string): string {
  return `<p style="margin:24px 0"><a href="${escapeHtml(href)}" style="display:inline-block;background:#008055;color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:12px">${escapeHtml(label)}</a></p>`;
}
