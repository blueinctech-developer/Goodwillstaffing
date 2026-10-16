import { isInputField, type InputField } from "./logic";
import type { AddressValue, FormDefinition, NameValue } from "./types";

// Human-readable submission values for the notification email, the admin
// detail view and CSV export. Pure, so it runs anywhere.

const ADDRESS_ORDER = ["street", "line2", "city", "province", "postal", "country"] as const;

/** Render one stored value as text. Unknown shapes (legacy imports) fall back to JSON. */
export function formatValue(value: unknown, field?: InputField): string {
  if (value == null || value === "") return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string" || typeof value === "number") {
    const text = String(value);
    if (field && "choices" in field) return field.choices.find((c) => c.value === text)?.label ?? text;
    return text;
  }
  if (Array.isArray(value))
    return value
      .map((v) => formatValue(v, field))
      .filter(Boolean)
      .join(", ");
  if (typeof value === "object") {
    if (field?.type === "name") {
      const name = value as NameValue;
      return [name.first, name.last].filter(Boolean).join(" ");
    }
    if (field?.type === "address" || ADDRESS_ORDER.some((k) => k in value)) {
      const address = value as AddressValue;
      return ADDRESS_ORDER.map((k) => address[k])
        .filter(Boolean)
        .join(", ");
    }
    return JSON.stringify(value);
  }
  return String(value);
}

export type LabelledValue = { name: string; label: string; value: string };

/**
 * The submission's values in form order with labels resolved from the
 * definition; keys the definition doesn't know (renamed fields, legacy CSV
 * columns) are appended with the key as the label.
 */
export function labelledValues(definition: FormDefinition | undefined, data: Record<string, unknown>): LabelledValue[] {
  const out: LabelledValue[] = [];
  const seen = new Set<string>();
  for (const field of definition?.fields ?? []) {
    if (!isInputField(field) || field.type === "file") continue;
    seen.add(field.name);
    if (!(field.name in data)) continue;
    out.push({ name: field.name, label: field.label, value: formatValue(data[field.name], field) });
  }
  for (const [key, value] of Object.entries(data)) {
    if (!seen.has(key)) out.push({ name: key, label: key, value: formatValue(value) });
  }
  return out;
}

/** Label of a file field, for listing stored uploads. */
export function fieldLabel(definition: FormDefinition | undefined, name: string): string {
  return definition?.fields.find((f) => f.name === name)?.label ?? name;
}
