import { ADDRESS_PARTS, isEmpty, isInputField, parseFormData, visibleFields, type InputField } from "./logic";
import type {
  AddressValue,
  FieldValue,
  FileField,
  FormDefinition,
  FormErrors,
  FormFile,
  FormFiles,
  FormValues,
  NameValue,
} from "./types";

// Validation of a submission against its definition. Pure (no server-only
// imports) so the client can reuse it to check one step before moving on;
// the server action always re-runs it on the full submission.

/** Hidden decoy input. Real visitors never see it; bots that fill it are dropped. */
export const HONEYPOT_FIELD = "_hp_details";

/** Never accepted, even by "any file" uploads (mirrors Gravity Forms' deny list). */
const DENIED_EXTENSIONS = new Set([
  "php", "php3", "php4", "php5", "php6", "phtml", "phar", "asp", "aspx", "cmd", "csh", "bat", "html", "htm",
  "hta", "jar", "exe", "com", "js", "lnk", "htaccess", "ps1", "ps2", "py", "rb", "tmp", "sh", "msi", "dll", "svg",
]);

const TEXT_MAX = 500;
const TEXTAREA_MAX = 10_000;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ValidationResult =
  | { ok: true; spam: boolean; values: FormValues; files: FormFiles }
  | { ok: false; spam: false; errors: FormErrors };

export function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${Math.round(bytes / (1024 * 1024))} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function extensionOf(fileName: string) {
  const dot = fileName.lastIndexOf(".");
  return dot === -1 ? "" : fileName.slice(dot + 1).toLowerCase();
}

export function validPhone(value: string) {
  // International format: optional +, then 7-15 digits with common separators.
  if (!/^\+?[\d\s().\-/]+$/.test(value)) return false;
  const digits = value.replace(/\D/g, "").length;
  return digits >= 7 && digits <= 15;
}

function validDate(value: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}

/** Return the canonical choice value (choices may carry odd whitespace, e.g. Salesforce picklists). */
function pickChoice(field: { choices: { value: string }[] }, value: string) {
  return field.choices.find((c) => c.value.trim() === value.trim())?.value;
}

const REQUIRED = "This field is required.";

/**
 * Check one file's type and size against its field. Shared by form
 * validation and the direct-upload action, which checks before presigning.
 */
export function fileError(field: FileField, file: { name: string; size: number }): string | undefined {
  const ext = extensionOf(file.name);
  if (DENIED_EXTENSIONS.has(ext) || (field.extensions && !field.extensions.includes(ext))) {
    const allowed = field.extensions ? ` Accepted file types: ${field.extensions.join(", ")}.` : "";
    return `"${file.name}" is not an accepted file type.${allowed}`;
  }
  if (file.size > field.maxSize) {
    return `"${file.name}" is larger than the ${formatBytes(field.maxSize)} limit.`;
  }
  return undefined;
}

/** Validate one visible field; returns an error message and/or the cleaned value. */
function checkField(
  field: InputField,
  value: FieldValue,
  files: FormFile[],
  values: FormValues,
): { error?: string; value?: FieldValue } {
  if (field.type === "file") {
    if (files.length === 0) return field.required ? { error: "Please upload a file." } : {};
    if (!field.multiple && files.length > 1) return { error: "Please upload a single file." };
    if (field.multiple && field.maxFiles && files.length > field.maxFiles) {
      return { error: `Please upload no more than ${field.maxFiles} files.` };
    }
    for (const file of files) {
      const error = fileError(field, file);
      if (error) return { error };
    }
    return {};
  }

  if (isEmpty(value)) {
    if (!field.required) return { value: field.type === "checkbox" ? [] : field.type === "consent" ? false : value };
    if (field.type === "consent") return { error: "Please tick this box to continue." };
    if (field.type === "checkbox") return { error: "Please select at least one option." };
    return { error: REQUIRED };
  }

  switch (field.type) {
    case "text":
    case "email":
    case "tel":
    case "number":
    case "url": {
      const text = value as string;
      if (text.length > (field.maxLength ?? TEXT_MAX)) return { error: "This entry is too long." };
      if (field.type === "email" && !EMAIL_RE.test(text)) return { error: "Please enter a valid email address." };
      if (field.type === "tel" && !validPhone(text)) return { error: "Please enter a valid phone number." };
      if (field.type === "number" && !/^-?\d+(\.\d+)?$/.test(text)) return { error: "Please enter a number." };
      if (field.type === "url" && !/^https?:\/\/\S+$/i.test(text)) return { error: "Please enter a valid URL." };
      if (field.mustMatch) {
        const other = values[field.mustMatch];
        if (typeof other === "string" && other.toLowerCase() !== text.toLowerCase()) {
          return { error: "This does not match." };
        }
      }
      return { value: text };
    }
    case "textarea": {
      const text = value as string;
      if (text.length > (field.maxLength ?? TEXTAREA_MAX)) return { error: "This entry is too long." };
      return { value: text };
    }
    case "select":
    case "radio": {
      const choice = pickChoice(field, value as string);
      return choice === undefined ? { error: "Please choose one of the options." } : { value: choice };
    }
    case "checkbox": {
      const picked = [...new Set(value as string[])].map((v) => pickChoice(field, v));
      if (picked.some((v) => v === undefined)) return { error: "Please choose from the options." };
      return { value: picked as string[] };
    }
    case "consent":
      return { value: true };
    case "name": {
      const name = value as NameValue;
      if (Object.values(name).some((v) => v && v.length > TEXT_MAX)) return { error: "This entry is too long." };
      if (field.required && field.parts.some((p) => !name[p])) {
        return { error: field.parts.length > 1 ? "Please enter your first and last name." : REQUIRED };
      }
      return { value: name };
    }
    case "address": {
      const address = value as AddressValue;
      if (Object.values(address).some((v) => v && v.length > TEXT_MAX)) return { error: "This entry is too long." };
      if (field.required) {
        // Address line 2 is always optional, as in Gravity Forms.
        const missing = ADDRESS_PARTS.filter((p) => p !== "line2" && field.parts.includes(p) && !address[p]);
        if (missing.length) return { error: "Please complete the address." };
      }
      if (address.country && field.countries && !field.countries.some((c) => c.value === address.country)) {
        return { error: "Please choose a country from the list." };
      }
      return { value: address };
    }
    case "date": {
      const date = value as string;
      if (!validDate(date)) return { error: "Please enter a valid date." };
      const year = Number(date.slice(0, 4));
      if ((field.minYear && year < field.minYear) || (field.maxYear && year > field.maxYear)) {
        return { error: "Please choose a date within the available years." };
      }
      return { value: date };
    }
  }
}

/**
 * Validate a submission. Fields hidden by conditional logic are skipped and
 * their values dropped. Pass `only` to check a subset (one step of a form).
 */
export function validateSubmission(
  definition: FormDefinition,
  data: FormData,
  only?: ReadonlySet<string>,
): ValidationResult {
  const honeypot = data.get(HONEYPOT_FIELD);
  if (typeof honeypot === "string" && honeypot !== "") {
    return { ok: true, spam: true, values: {}, files: {} };
  }

  const parsed = parseFormData(definition, data);
  const visible = visibleFields(definition, parsed.values);
  const values: FormValues = {};
  const files: FormFiles = {};
  const errors: FormErrors = {};

  for (const field of definition.fields) {
    if (!isInputField(field) || !visible.has(field.name)) continue;
    if (only && !only.has(field.name)) continue;
    const fieldFiles = parsed.files[field.name] ?? [];
    const result = checkField(field, parsed.values[field.name], fieldFiles, parsed.values);
    if (result.error) errors[field.name] = result.error;
    else if (field.type === "file") files[field.name] = fieldFiles;
    else if (result.value !== undefined) values[field.name] = result.value;
  }

  if (Object.keys(errors).length) return { ok: false, spam: false, errors };
  return { ok: true, spam: false, values, files };
}
