import "server-only";
import type { FieldValue, FormDefinition, FormValues, SalesforceConfig } from "./types";

// Server-side replacement for the original browser POST to Salesforce
// Web-to-Lead. Field names and values mirror the old multiPageForm exactly.
// Only runs when SALESFORCE_FORWARD=1 so local testing never creates leads.

export type SalesforceOutcome = "skipped" | "sent" | "failed";

function appendValue(params: URLSearchParams, key: string, value: FieldValue | undefined) {
  if (value == null || value === "" || value === false) return;
  if (value === true) params.append(key, "1"); // checkbox fields post "1"
  else if (typeof value === "string") params.append(key, value);
  // Multi-select picklists post one entry per selected value.
  else if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
  else params.append(key, Object.values(value).filter(Boolean).join(" "));
}

export function buildSalesforcePayload(config: SalesforceConfig, values: FormValues) {
  const params = new URLSearchParams();
  params.append("oid", config.oid);
  params.append("retURL", config.retURL);
  for (const [field, sfName] of Object.entries(config.mapping)) appendValue(params, sfName, values[field]);
  for (const [key, value] of Object.entries(config.hidden)) params.append(key, value);
  return params;
}

export async function forwardToSalesforce(definition: FormDefinition, values: FormValues): Promise<SalesforceOutcome> {
  const config = definition.salesforce;
  if (!config) return "skipped";

  const body = buildSalesforcePayload(config, values);
  if (process.env.SALESFORCE_FORWARD !== "1") {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[forms] Salesforce forward skipped for ${definition.id} (set SALESFORCE_FORWARD=1)`, [
        ...body.keys(),
      ]);
    }
    return "skipped";
  }

  try {
    const res = await fetch(config.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body,
      // Web-to-Lead answers with a redirect to retURL; we don't need to follow it.
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (res.status >= 400) {
      console.error(`[forms] Salesforce Web-to-Lead returned ${res.status} for ${definition.id}`);
      return "failed";
    }
    return "sent";
  } catch (error) {
    console.error(`[forms] Salesforce Web-to-Lead request failed for ${definition.id}`, error);
    return "failed";
  }
}
