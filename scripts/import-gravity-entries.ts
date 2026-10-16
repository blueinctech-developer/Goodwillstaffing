// Imports Gravity Forms entry exports (Forms > Import/Export > Export Entries,
// CSV) into the submissions table, so the old WordPress entries show up in
// /admin/submissions next to new ones (source = legacy_import).
//
//   npm run gf:import                                   # every .csv in the default folder
//   npm run gf:import -- "D:\exports" --dry-run         # report the mapping only
//   npm run gf:import -- file.csv --form contact        # force the target form
//   npm run gf:import -- --status new                   # import as unread (default: read)
//
// Expected input: one CSV per form, as Gravity Forms exports it:
//   - header row of field labels; multi-input fields as "Name (First)",
//     "Address (City)", and checkbox fields either as one column or one
//     column per choice ("Specialty (ICU)")
//   - Gravity meta columns such as "Entry Id", "Entry Date", "Date Updated",
//     "Source Url", "User Agent", "User IP", "Created By (User Id)"
//   - file names like "contact-us-2026-10-14.csv" (form title + export date)
// The form is detected from the file name (form title, slug or Gravity id),
// else from how many headers match a form's field labels. Values are stored by
// our field names when a label matches, else under the raw column label.
// "Entry Id" is required: it makes the import idempotent (re-running skips
// entries already imported). File-upload columns keep their WordPress URLs;
// download anything you need before the old site is switched off.

import { createHmac } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { FORMS, getForm } from "../src/forms";
import type { Field, FormDefinition } from "../src/forms/types";
import { connect, schema } from "./lib/db";

const DEFAULT_DIR = "C:\\Users\\DELL\\goodwill-export\\gf-entries";
const TIME_ZONE = "America/Toronto";

const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 ? args[i + 1] : undefined;
};
const dryRun = args.includes("--dry-run");
const forcedForm = flag("form");
const importStatus = flag("status") === "new" ? "new" : "read";
const target = path.resolve(
  args.find((a, i) => !a.startsWith("--") && !["--form", "--status"].includes(args[i - 1] ?? "")) ?? DEFAULT_DIR,
);

// Gravity meta columns: kept in meta.legacy (IP is hashed, never stored raw).
const META_COLUMNS = new Set(
  [
    "entry id",
    "entry date",
    "date updated",
    "source url",
    "transaction id",
    "payment amount",
    "payment date",
    "payment status",
    "post id",
    "user agent",
    "user ip",
    "created by (user id)",
    "created by",
    "status",
    "is starred",
    "is read",
    "is fulfilled",
    "payment method",
    "currency",
    "transaction type",
    "entry status",
  ].map((s) => s.toLowerCase()),
);

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const slug = (s: string) => norm(s).replace(/ /g, "-");

const ADDRESS_SUBS: Record<string, string> = {
  "street address": "street",
  "address line 2": "line2",
  city: "city",
  "state province": "province",
  "state province region": "province",
  province: "province",
  "zip postal code": "postal",
  "postal code": "postal",
  country: "country",
};

type InputField = Exclude<Field, { type: "section" | "html" }>;
const inputFields = (d: FormDefinition) =>
  d.fields.filter((f): f is InputField => f.type !== "section" && f.type !== "html");

/** "Name (First)" -> ["Name", "First"]. */
function splitHeader(header: string): [string, string | null] {
  const m = /^(.*?)\s*\(([^()]*)\)\s*$/.exec(header);
  return m ? [m[1], m[2]] : [header, null];
}

function detectForm(file: string, headers: string[]): FormDefinition | undefined {
  if (forcedForm) return getForm(forcedForm);
  const base = path.basename(file, path.extname(file)).replace(/-?\d{4}-\d{2}-\d{2}.*$/, "");
  const baseSlug = slug(base);
  const byName = FORMS.find(
    (f) =>
      baseSlug === f.id ||
      baseSlug === slug(f.title) ||
      baseSlug.startsWith(`${slug(f.title)}-`) ||
      new RegExp(`(^|-)(form-)?${f.legacyId}$`).test(baseSlug),
  );
  if (byName) return byName;

  // Fall back to the form whose labels best match the headers.
  const heads = new Set(headers.map((h) => norm(splitHeader(h)[0])));
  let best: { form: FormDefinition; score: number } | undefined;
  for (const form of FORMS) {
    const score = inputFields(form).filter((f) => heads.has(norm(f.label))).length;
    if (score >= 2 && (!best || score > best.score)) best = { form, score };
  }
  return best?.form;
}

function normalizeDate(value: string): string {
  const v = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(v);
  if (us) return `${us[3]}-${us[1].padStart(2, "0")}-${us[2].padStart(2, "0")}`;
  return v;
}

/** Gravity exports entry dates in the site's time zone; convert to a UTC Date. */
function siteTimeToDate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/.exec(value.trim());
  if (!m) {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : new Date(parsed);
  }
  const asUtc = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] ?? 0));
  // Offset of the site zone at that moment (handles daylight saving).
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(asUtc));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const zoned = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return new Date(asUtc - (zoned - asUtc));
}

function hashIp(ip: string): string | null {
  const secret = process.env.SESSION_SECRET;
  if (!ip || !secret) return null;
  return createHmac("sha256", Buffer.from(secret, "base64")).update(`ip|${ip}`).digest("hex").slice(0, 32);
}

type Mapped = { data: Record<string, unknown>; legacy: Record<string, string>; unmatched: Set<string> };

function mapRow(form: FormDefinition, headers: string[], row: string[]): Mapped {
  const byLabel = new Map(inputFields(form).map((f) => [norm(f.label), f]));
  const data: Record<string, unknown> = {};
  const legacy: Record<string, string> = {};
  const unmatched = new Set<string>();

  headers.forEach((header, i) => {
    const raw = (row[i] ?? "").trim();
    if (META_COLUMNS.has(header.trim().toLowerCase())) {
      if (raw) legacy[header.trim()] = raw;
      return;
    }
    if (!raw) return;
    const [base, sub] = splitHeader(header);
    const field = byLabel.get(norm(header)) ?? byLabel.get(norm(base));
    if (!field) {
      unmatched.add(header);
      data[header.trim()] = raw;
      return;
    }
    switch (field.type) {
      case "name": {
        const part = sub && /last/i.test(sub) ? "last" : "first";
        data[field.name] = { ...(data[field.name] as object), [part]: raw };
        break;
      }
      case "address": {
        const part = (sub && ADDRESS_SUBS[norm(sub)]) ?? "street";
        data[field.name] = { ...(data[field.name] as object), [part]: raw };
        break;
      }
      case "checkbox": {
        const list = (data[field.name] as string[] | undefined) ?? [];
        if (sub) list.push(raw);
        else {
          // One column: pick the known choices it contains, else split on commas.
          const known = field.choices.filter((c) => raw.includes(c.value)).map((c) => c.value);
          list.push(...(known.length ? known : raw.split(/\s*,\s*/)));
        }
        data[field.name] = [...new Set(list)];
        break;
      }
      case "consent":
        data[field.name] = true;
        break;
      case "date":
        data[field.name] = normalizeDate(raw);
        break;
      case "file":
        // Old WordPress URLs (one or several, comma separated).
        data[field.name] = raw;
        break;
      default:
        data[field.name] = raw;
    }
  });
  return { data, legacy, unmatched };
}

function csvFiles(): string[] {
  if (!fs.existsSync(target)) {
    console.error(
      `Not found: ${target}\nExport entries from Gravity Forms as CSV and put them there (or pass a path).`,
    );
    process.exit(1);
  }
  if (fs.statSync(target).isFile()) return [target];
  return fs
    .readdirSync(target)
    .filter((f) => f.toLowerCase().endsWith(".csv"))
    .map((f) => path.join(target, f));
}

async function main() {
  const files = csvFiles();
  if (files.length === 0) {
    console.log(`No .csv files in ${target}.`);
    return;
  }
  const conn = dryRun ? null : connect();
  let total = 0;
  try {
    for (const file of files) {
      const rows = parse(fs.readFileSync(file), {
        bom: true,
        relax_column_count: true,
        skip_empty_lines: true,
      }) as string[][];
      const [headers, ...entries] = rows;
      if (!headers?.length) {
        console.warn(`${path.basename(file)}: empty, skipped`);
        continue;
      }
      const form = detectForm(file, headers);
      if (!form) {
        console.warn(
          `${path.basename(file)}: couldn't tell which form this is; re-run with --form <id> (${FORMS.map((f) => f.id).join(", ")})`,
        );
        continue;
      }
      const idCol = headers.findIndex((h) => h.trim().toLowerCase() === "entry id");
      if (idCol === -1) {
        console.warn(`${path.basename(file)}: no "Entry Id" column, skipped (needed to import idempotently)`);
        continue;
      }

      let inserted = 0;
      let skipped = 0;
      const unmatched = new Set<string>();
      for (const row of entries) {
        const entryId = (row[idCol] ?? "").trim();
        if (!entryId) continue;
        const { data, legacy, unmatched: u } = mapRow(form, headers, row);
        u.forEach((h) => unmatched.add(h));
        const status = (legacy.Status ?? legacy["Entry Status"] ?? "").toLowerCase();
        if (status === "trash") {
          skipped++;
          continue;
        }

        const created = siteTimeToDate(legacy["Entry Date"] ?? "") ?? new Date();
        let pagePath: string | null = null;
        try {
          pagePath = legacy["Source Url"] ? new URL(legacy["Source Url"]).pathname : null;
        } catch {
          pagePath = null;
        }
        const ipHash = hashIp(legacy["User IP"] ?? "");
        const userAgent = legacy["User Agent"] ?? null;
        delete legacy["User IP"];
        delete legacy["User Agent"];

        if (!conn) {
          inserted++;
          continue;
        }
        const result = await conn.db
          .insert(schema.submissions)
          .values({
            formId: form.id,
            formTitle: form.title,
            status: status === "spam" ? "spam" : importStatus,
            data,
            meta: { ipHash, userAgent, pagePath, legacy },
            source: "legacy_import",
            legacyEntryId: `gf:${form.legacyId}:${entryId}`,
            createdAt: created,
            readAt: importStatus === "read" ? new Date() : null,
          })
          .onConflictDoNothing({ target: schema.submissions.legacyEntryId })
          .returning({ id: schema.submissions.id });
        if (result.length) inserted++;
        else skipped++;
      }
      total += inserted;
      console.log(
        `${path.basename(file)} -> ${form.id}: ${inserted} ${dryRun ? "would be imported" : "imported"}, ${skipped} skipped (already imported or trashed)`,
      );
      if (unmatched.size) console.log(`  columns kept under their own label: ${[...unmatched].join(" | ")}`);
    }
  } finally {
    await conn?.close();
  }
  console.log(`Done: ${total} entries ${dryRun ? "would be imported (dry run)" : "imported"}.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
