import "server-only";
import { and, count, desc, eq, inArray, sql, type SQL } from "drizzle-orm";
import { getDb } from "@/db";
import { submissions, type SubmissionStatus } from "@/db/schema";

// Queries behind /admin/submissions. Dates in filters are calendar days in
// Goodwill's time zone (Ottawa), matching how the admin displays them.

export const TIME_ZONE = "America/Toronto";
export const PAGE_SIZE = 50;

export const STATUS_VIEWS = ["inbox", "new", "read", "archived", "spam", "all"] as const;
export type StatusView = (typeof STATUS_VIEWS)[number];

export type SubmissionFilters = {
  form: string;
  view: StatusView;
  from: string;
  to: string;
  q: string;
  page: number;
};

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

type Params = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export function parseFilters(params: Params): SubmissionFilters {
  const view = one(params.view) as StatusView;
  const page = Number.parseInt(one(params.page), 10);
  return {
    form: one(params.form).slice(0, 80),
    view: STATUS_VIEWS.includes(view) ? view : "inbox",
    from: DAY_RE.test(one(params.from)) ? one(params.from) : "",
    to: DAY_RE.test(one(params.to)) ? one(params.to) : "",
    q: one(params.q).trim().slice(0, 200),
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

/** Query string for a filter set (omitting defaults), for links and CSV export. */
export function filterQuery(filters: Partial<SubmissionFilters>): string {
  const params = new URLSearchParams();
  if (filters.form) params.set("form", filters.form);
  if (filters.view && filters.view !== "inbox") params.set("view", filters.view);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.q) params.set("q", filters.q);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  const s = params.toString();
  return s ? `?${s}` : "";
}

function where(filters: SubmissionFilters): SQL | undefined {
  const conditions: SQL[] = [];
  if (filters.form) conditions.push(eq(submissions.formId, filters.form));
  if (filters.view === "inbox") conditions.push(inArray(submissions.status, ["new", "read"]));
  else if (filters.view !== "all") conditions.push(eq(submissions.status, filters.view));
  if (filters.from) {
    conditions.push(sql`${submissions.createdAt} >= (${filters.from}::date)::timestamp at time zone ${TIME_ZONE}`);
  }
  if (filters.to) {
    conditions.push(sql`${submissions.createdAt} < ((${filters.to}::date) + 1)::timestamp at time zone ${TIME_ZONE}`);
  }
  if (filters.q) {
    const pattern = `%${filters.q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    conditions.push(
      sql`(${submissions.data}::text ilike ${pattern} or coalesce(${submissions.notes}, '') ilike ${pattern})`,
    );
  }
  return conditions.length ? and(...conditions) : undefined;
}

const listColumns = {
  id: submissions.id,
  formId: submissions.formId,
  formTitle: submissions.formTitle,
  status: submissions.status,
  data: submissions.data,
  files: submissions.files,
  source: submissions.source,
  createdAt: submissions.createdAt,
};

export async function listSubmissions(filters: SubmissionFilters) {
  const db = getDb();
  const condition = where(filters);
  const [rows, [{ total }]] = await Promise.all([
    db
      .select(listColumns)
      .from(submissions)
      .where(condition)
      .orderBy(desc(submissions.createdAt))
      .limit(PAGE_SIZE)
      .offset((filters.page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(submissions).where(condition),
  ]);
  return { rows, total };
}

/** Every matching row for CSV export (capped so one export can't exhaust memory). */
export async function exportSubmissions(filters: SubmissionFilters, limit = 20_000) {
  return getDb().select().from(submissions).where(where(filters)).orderBy(desc(submissions.createdAt)).limit(limit);
}

export async function getSubmission(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [row] = await getDb().select().from(submissions).where(eq(submissions.id, id)).limit(1);
  return row ?? null;
}

export async function countsByForm() {
  return getDb()
    .select({
      formId: submissions.formId,
      formTitle: sql<string>`max(${submissions.formTitle})`,
      new: sql<number>`count(*) filter (where ${submissions.status} = 'new')`.mapWith(Number),
      total: count(),
    })
    .from(submissions)
    .groupBy(submissions.formId);
}

export async function recentSubmissions(limit = 8) {
  return getDb()
    .select(listColumns)
    .from(submissions)
    .where(inArray(submissions.status, ["new", "read"]))
    .orderBy(desc(submissions.createdAt))
    .limit(limit);
}

export async function setStatus(ids: string[], status: SubmissionStatus) {
  if (ids.length === 0) return;
  await getDb()
    .update(submissions)
    .set({ status, ...(status === "read" ? { readAt: new Date() } : {}) })
    .where(inArray(submissions.id, ids));
}

/** A short line identifying a submission in lists: name, then email, then first value. */
export function submissionSummary(data: Record<string, unknown>): string {
  const pick = (v: unknown): string => {
    if (typeof v === "string") return v;
    if (v && typeof v === "object" && !Array.isArray(v))
      return Object.values(v)
        .filter((x) => typeof x === "string" && x)
        .join(" ");
    return "";
  };
  const keys = Object.keys(data);
  const nameKey = keys.find((k) => /name/i.test(k) && pick(data[k]));
  const emailKey = keys.find((k) => /e-?mail/i.test(k) && pick(data[k]));
  const name = nameKey ? pick(data[nameKey]) : "";
  const email = emailKey ? pick(data[emailKey]) : "";
  const line = [name, email].filter(Boolean).join(" · ");
  if (line) return line.slice(0, 140);
  const first = Object.values(data).map(pick).find(Boolean);
  return (first ?? "").slice(0, 140);
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}
