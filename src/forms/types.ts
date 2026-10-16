// Form schema for the forms migrated from goodwillstaffing.ca (Gravity Forms,
// Mailchimp for WP and the Salesforce Web-to-Lead "multiPageForm").
// Definitions are plain serializable data so a Server Component can hand them
// to the client renderer as props.

/** Logical recipient group; mapped to real addresses when SES is wired up. */
export type NotifyKey =
  | "staffing" // employers asking for staff
  | "recruitment" // candidates applying for assignments / talent pool
  | "careers" // people applying to work at Goodwill itself
  | "general" // the main contact form
  | "marketing" // photo/video submissions
  | "housing" // accommodation listings for travelling staff
  | "newsletter"
  | "smartapply"; // SmartApply chatbot (GoodwillBot) conversations

export type Choice = { value: string; label: string };

// ---------------------------------------------------------------- logic

export type ConditionOperator = "is" | "isnot" | "contains" | "notEmpty" | "empty";

export type Condition = {
  /** Name of the field whose value is tested. */
  field: string;
  operator: ConditionOperator;
  value?: string;
};

/** Mirrors Gravity Forms' conditional logic: show/hide when all/any rules match. */
export type ConditionalLogic = {
  action: "show" | "hide";
  match: "all" | "any";
  rules: Condition[];
};

// ---------------------------------------------------------------- fields

type FieldBase = {
  /** Form-data key; also the key in stored submission values. */
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  /** Layout hint on wide screens; everything stacks on mobile. */
  width?: "full" | "half" | "third";
  /** Keep the label for screen readers only (Gravity Forms "hidden_label"). */
  hideLabel?: boolean;
  logic?: ConditionalLogic;
  /** Original input name (e.g. "input_22", "00NHu00001XvWYf") for traceability. */
  legacy?: string;
};

export type TextField = FieldBase & {
  type: "text" | "email" | "tel" | "number" | "url";
  placeholder?: string;
  autoComplete?: string;
  maxLength?: number;
  /** Must equal the value of another field (e.g. "Confirm Email"). */
  mustMatch?: string;
};

export type TextareaField = FieldBase & {
  type: "textarea";
  placeholder?: string;
  rows?: number;
  maxLength?: number;
};

export type SelectField = FieldBase & {
  type: "select";
  choices: Choice[];
  /** Text of the empty first option. */
  placeholder?: string;
  autoComplete?: string;
};

export type RadioField = FieldBase & {
  type: "radio";
  choices: Choice[];
  columns?: 1 | 2 | 3;
};

/** Multiple choice; also used for Salesforce multi-select picklists. */
export type CheckboxField = FieldBase & {
  type: "checkbox";
  choices: Choice[];
  columns?: 1 | 2 | 3;
};

/** A single yes/no checkbox (consent, opt-in, flags). Submits `true` when ticked. */
export type ConsentField = FieldBase & {
  type: "consent";
  /** Text beside the checkbox. */
  text: string;
  link?: { href: string; text: string };
};

export type NamePart = "first" | "last";

export type NameField = FieldBase & {
  type: "name";
  parts: NamePart[];
  placeholders?: Partial<Record<NamePart, string>>;
};

export type AddressPart = "street" | "line2" | "city" | "province" | "postal" | "country";

export type AddressField = FieldBase & {
  type: "address";
  parts: AddressPart[];
  placeholders?: Partial<Record<AddressPart, string>>;
  /** Choices for the country part (ISO code values). */
  countries?: Choice[];
  /** Stored when the country part is not shown. */
  defaultCountry?: string;
};

export type DateField = FieldBase & {
  type: "date";
  /** "dropdown" = Gravity Forms month/day/year selects; "picker" = native date input. */
  style: "dropdown" | "picker";
  /** Year range for the dropdown style (static so pages can prerender). */
  minYear?: number;
  maxYear?: number;
};

export type FileField = FieldBase & {
  type: "file";
  /** Lower-case extensions without dots; omitted = anything not on the deny list. */
  extensions?: string[];
  /** Per-file limit in bytes. */
  maxSize: number;
  multiple?: boolean;
  /** 0/undefined = unlimited when `multiple`. */
  maxFiles?: number;
};

/** Non-input content: a section heading or a short block of text. */
export type ContentField = FieldBase & {
  type: "section" | "html";
  /** Optional body text shown under the heading. */
  text?: string;
};

export type Field =
  | TextField
  | TextareaField
  | SelectField
  | RadioField
  | CheckboxField
  | ConsentField
  | NameField
  | AddressField
  | DateField
  | FileField
  | ContentField;

export type FieldType = Field["type"];

// ---------------------------------------------------------------- form

export type FormStep = {
  title: string;
  description?: string;
  /** Names of the fields on this step, in order. */
  fields: string[];
};

export type SalesforceConfig = {
  /** Web-to-Lead endpoint (the original form's action). */
  endpoint: string;
  oid: string;
  retURL: string;
  /** Our field name -> Salesforce field name (standard or custom 00N... id). */
  mapping: Record<string, string>;
  /** Extra hidden inputs sent as-is (e.g. lead_source). */
  hidden: Record<string, string>;
};

export type FormDefinition = {
  /** Stable slug used in URLs, storage and the admin. */
  id: string;
  /** Original id: Gravity Forms number, "mc4wp:<post id>" or "salesforce:<element id>". */
  legacyId: string;
  title: string;
  description?: string;
  /** Pages where the original form appeared. */
  pages: string[];
  fields: Field[];
  /** Multi-step layout; single page when omitted. */
  steps?: FormStep[];
  submitText: string;
  /** Small print shown under the submit button. */
  submitNote?: string;
  successMessage: string;
  notify: NotifyKey;
  /** Subject of the staff notification email; defaults to "New <title> submission". */
  notifySubject?: string;
  salesforce?: SalesforceConfig;
};

// ---------------------------------------------------------------- values

export type NameValue = Partial<Record<NamePart, string>>;
export type AddressValue = Partial<Record<AddressPart, string>>;

/** Parsed value of one field. Files are carried separately. */
export type FieldValue = string | string[] | boolean | NameValue | AddressValue;

export type FormValues = Record<string, FieldValue>;

/**
 * A file the browser already uploaded straight to S3 (see uploads.ts). It is
 * posted as JSON in place of the File, so large uploads skip the request body.
 */
export type UploadRef = { key: string; name: string; size: number; type: string };
export type FormFile = File | UploadRef;
export type FormFiles = Record<string, FormFile[]>;
export type FormErrors = Record<string, string>;

/** State returned by `submitForm` for React's useActionState. */
export type FormState =
  | { status: "idle" }
  | { status: "error"; message: string; errors: FormErrors }
  | { status: "success"; message: string };
