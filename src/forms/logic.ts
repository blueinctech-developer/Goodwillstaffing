import type {
  AddressPart,
  Condition,
  ConditionalLogic,
  Field,
  FieldValue,
  FormDefinition,
  FormFile,
  FormFiles,
  FormValues,
  NamePart,
  UploadRef,
} from "./types";

// Pure helpers shared by the client renderer and server validation, so both
// sides agree on how FormData maps to values and which fields are visible.

export const NAME_PARTS: NamePart[] = ["first", "last"];
export const ADDRESS_PARTS: AddressPart[] = ["street", "line2", "city", "province", "postal", "country"];
export const DATE_PARTS = ["month", "day", "year"] as const;

/** Fields that render an input (everything except section/html content). */
export type InputField = Exclude<Field, { type: "section" | "html" }>;

export function isInputField(field: Field): field is InputField {
  return field.type !== "section" && field.type !== "html";
}

/** Name of a composite sub-input, e.g. "name.first" or "startDate.year". */
export function partName(field: string, part: string) {
  return `${field}.${part}`;
}

function str(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function pad(value: string) {
  return value.length === 1 ? `0${value}` : value;
}

/** Read one field's raw value from FormData (no validation). */
export function readField(field: InputField, data: FormData): FieldValue {
  switch (field.type) {
    case "checkbox":
      return data.getAll(field.name).map(str).filter(Boolean);
    case "consent":
      return data.get(field.name) != null;
    case "name":
      return Object.fromEntries(field.parts.map((p) => [p, str(data.get(partName(field.name, p)))]));
    case "address": {
      const value = Object.fromEntries(field.parts.map((p) => [p, str(data.get(partName(field.name, p)))]));
      if (!field.parts.includes("country") && field.defaultCountry) value.country = field.defaultCountry;
      return value;
    }
    case "date": {
      if (field.style === "picker") return str(data.get(field.name));
      const [m, d, y] = DATE_PARTS.map((p) => str(data.get(partName(field.name, p))));
      // Partially filled dropdowns become e.g. "2026--04" so validation can flag them.
      return m || d || y ? `${y}-${pad(m)}-${pad(d)}` : "";
    }
    case "file":
      return "";
    default:
      return str(data.get(field.name));
  }
}

/** Where direct browser uploads land before their submission is stored. */
export const UPLOAD_TMP_PREFIX = "private/tmp/";

/** Parse a posted upload reference; anything malformed is ignored. */
export function parseUploadRef(value: string): UploadRef | null {
  try {
    const ref = JSON.parse(value) as Partial<UploadRef>;
    if (
      typeof ref.key === "string" &&
      ref.key.startsWith(UPLOAD_TMP_PREFIX) &&
      !ref.key.includes("..") &&
      typeof ref.name === "string" &&
      ref.name !== "" &&
      typeof ref.size === "number" &&
      typeof ref.type === "string"
    ) {
      return { key: ref.key, name: ref.name.slice(0, 255), size: ref.size, type: ref.type.slice(0, 100) };
    }
  } catch {
    // not JSON
  }
  return null;
}

export function readFiles(field: InputField, data: FormData): FormFile[] {
  if (field.type !== "file") return [];
  return data.getAll(field.name).flatMap((v): FormFile[] => {
    // Files uploaded straight to S3 arrive as JSON references.
    if (typeof v === "string") {
      const ref = parseUploadRef(v);
      return ref ? [ref] : [];
    }
    // An empty <input type=file> still submits a nameless, zero-byte File.
    return v.size > 0 && v.name !== "" ? [v] : [];
  });
}

/** Parse every input field; hidden-by-logic fields are included (see visibleFields). */
export function parseFormData(definition: FormDefinition, data: FormData) {
  const values: FormValues = {};
  const files: FormFiles = {};
  for (const field of definition.fields) {
    if (!isInputField(field)) continue;
    if (field.type === "file") files[field.name] = readFiles(field, data);
    else values[field.name] = readField(field, data);
  }
  return { values, files };
}

export function isEmpty(value: FieldValue | undefined): boolean {
  if (value == null || value === false || value === "") return true;
  if (value === true) return false;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.values(value).every((v) => !v);
  return false;
}

/** A value as a list of strings for rule matching. */
function asList(value: FieldValue | undefined): string[] {
  if (value == null || value === false) return [];
  if (value === true) return ["1"];
  if (typeof value === "string") return value ? [value] : [];
  if (Array.isArray(value)) return value;
  return [Object.values(value).filter(Boolean).join(" ")];
}

function matches(rule: Condition, value: FieldValue | undefined): boolean {
  const list = asList(value);
  const target = rule.value ?? "";
  switch (rule.operator) {
    case "is":
      return list.includes(target);
    case "isnot":
      return !list.includes(target);
    case "contains":
      return list.some((v) => v.includes(target)) || (target === "" && list.length === 0);
    case "notEmpty":
      return !isEmpty(value);
    case "empty":
      return isEmpty(value);
  }
}

function logicPasses(logic: ConditionalLogic, valueOf: (name: string) => FieldValue | undefined) {
  const results = logic.rules.map((rule) => matches(rule, valueOf(rule.field)));
  const matched = logic.match === "all" ? results.every(Boolean) : results.some(Boolean);
  return logic.action === "show" ? matched : !matched;
}

/**
 * Names of the fields currently shown. Like Gravity Forms, a hidden field
 * counts as empty when other rules test it, so chains collapse correctly.
 */
export function visibleFields(definition: FormDefinition, values: FormValues): Set<string> {
  let visible = new Set(definition.fields.map((f) => f.name));
  // Iterate to a fixed point so rules may reference later fields too.
  for (let i = 0; i <= definition.fields.length; i++) {
    const next = new Set<string>();
    const valueOf = (name: string) => (visible.has(name) ? values[name] : undefined);
    for (const field of definition.fields) {
      if (!field.logic || logicPasses(field.logic, valueOf)) next.add(field.name);
    }
    if (next.size === visible.size && [...next].every((n) => visible.has(n))) return next;
    visible = next;
  }
  return visible;
}

export type ResolvedStep = { title?: string; description?: string; fields: Field[] };

/** The form's steps with fields resolved; a single untitled step when not multi-step. */
export function resolveSteps(definition: FormDefinition): ResolvedStep[] {
  if (!definition.steps?.length) return [{ fields: definition.fields }];
  const byName = new Map(definition.fields.map((f) => [f.name, f]));
  return definition.steps.map((step) => ({
    title: step.title,
    description: step.description,
    fields: step.fields.map((name) => {
      const field = byName.get(name);
      if (!field) throw new Error(`Form "${definition.id}" step "${step.title}" lists unknown field "${name}"`);
      return field;
    }),
  }));
}
