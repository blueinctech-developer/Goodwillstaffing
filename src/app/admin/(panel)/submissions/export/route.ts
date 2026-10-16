import { NextResponse, type NextRequest } from "next/server";
import { getForm } from "@/forms";
import { fieldLabel, labelledValues } from "@/forms/format";
import { exportSubmissions, formatDateTime, parseFilters } from "@/lib/admin/submissions";
import { getCurrentAdmin } from "@/lib/auth/admin";

// CSV export of the submissions matching the list filters. With one form
// selected the columns follow that form's fields; across forms, every label
// seen becomes a column.

function csvCell(value: string): string {
  // Neutralise spreadsheet formulas, then quote.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  if (!(await getCurrentAdmin())) return NextResponse.redirect(new URL("/admin/login/", request.url));

  const filters = parseFilters(Object.fromEntries(request.nextUrl.searchParams));
  const rows = await exportSubmissions(filters);

  const columns: string[] = [];
  const seen = new Set<string>();
  const records = rows.map((row) => {
    const definition = getForm(row.formId);
    const record = new Map<string, string>();
    for (const v of labelledValues(definition, row.data)) {
      record.set(v.label, v.value);
      if (!seen.has(v.label)) {
        seen.add(v.label);
        columns.push(v.label);
      }
    }
    const files = row.files.map((f) => `${fieldLabel(definition, f.field)}: ${f.name}`).join("; ");
    return { row, record, files };
  });

  const header = ["Received", "Form", "Status", ...columns, "Files", "Notes", "Source", "Id"];
  const lines = [header.map(csvCell).join(",")];
  for (const { row, record, files } of records) {
    lines.push(
      [
        formatDateTime(row.createdAt),
        row.formTitle,
        row.status,
        ...columns.map((c) => record.get(c) ?? ""),
        files,
        row.notes ?? "",
        row.source === "legacy_import" ? `import ${row.legacyEntryId ?? ""}` : "web",
        row.id,
      ]
        .map(csvCell)
        .join(","),
    );
  }

  const name = `${filters.form || "submissions"}-${new Date().toISOString().slice(0, 10)}.csv`;
  // BOM so Excel reads UTF-8 (accents in names, French answers).
  return new NextResponse(`﻿${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}
