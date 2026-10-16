"use client";

import { startTransition, useActionState, useEffect, useId, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import buttonStyles from "@/components/ui/Button.module.css";
import { requestUpload, submitForm } from "@/forms/actions";
import { DATE_PARTS, isInputField, parseFormData, partName, resolveSteps, visibleFields } from "@/forms/logic";
import type {
  AddressField,
  AddressPart,
  CheckboxField,
  ConsentField,
  DateField,
  Field,
  FileField,
  FormDefinition,
  FormErrors,
  FormState,
  UploadRef,
  FormValues,
  NameField,
  NamePart,
  RadioField,
} from "@/forms/types";
import { HONEYPOT_FIELD, formatBytes, validateSubmission } from "@/forms/validate";
import styles from "./Form.module.css";

const INITIAL_STATE: FormState = { status: "idle" };

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const NAME_LABELS: Record<NamePart, string> = { first: "First name", last: "Last name" };
const NAME_AUTOCOMPLETE: Record<NamePart, string> = { first: "given-name", last: "family-name" };

const ADDRESS_LABELS: Record<AddressPart, string> = {
  street: "Street address",
  line2: "Address line 2",
  city: "City",
  province: "Province / State / Region",
  postal: "Postal / ZIP code",
  country: "Country",
};
const ADDRESS_AUTOCOMPLETE: Record<AddressPart, string> = {
  street: "address-line1",
  line2: "address-line2",
  city: "address-level2",
  province: "address-level1",
  postal: "postal-code",
  country: "country",
};

function cx(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/** "address.city" -> "address" */
function fieldNameOf(inputName: string) {
  const dot = inputName.indexOf(".");
  return dot === -1 ? inputName : inputName.slice(0, dot);
}

type Ids = { input: string; desc: string; error: string };

// ------------------------------------------------------------- direct uploads

type UploadProgress = { loaded: number; total: number };

/** PUT one file to its presigned S3 URL, reporting bytes sent. */
function putFile(url: string, file: File, contentType: string, onProgress: (loaded: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (event) => onProgress(event.loaded);
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });
}

/**
 * Upload every chosen file straight to S3 and swap each File in the FormData
 * for a JSON reference, so large videos never travel through the Server
 * Action (Vercel caps request bodies at 4.5 MB). When S3 isn't configured the
 * server answers "disabled" and the File is posted with the form as before.
 */
async function uploadFiles(
  definition: FormDefinition,
  data: FormData,
  onProgress: (progress: UploadProgress) => void,
): Promise<{ ok: true; data: FormData } | { ok: false; errors: FormErrors }> {
  const fileFields = new Set(definition.fields.filter((f) => f.type === "file").map((f) => f.name));
  const pending = [...data.entries()].filter(
    (entry): entry is [string, File] => fileFields.has(entry[0]) && typeof entry[1] !== "string" && entry[1].size > 0,
  );
  if (pending.length === 0) return { ok: true, data };

  const total = pending.reduce((sum, [, file]) => sum + file.size, 0);
  const sent = new Map<File, number>();
  const report = () => onProgress({ loaded: [...sent.values()].reduce((a, b) => a + b, 0), total });
  const replaced = new Map<File, string>();
  const errors: FormErrors = {};

  for (const [field, file] of pending) {
    if (errors[field]) continue;
    const ticket = await requestUpload(definition.id, field, { name: file.name, type: file.type, size: file.size }).catch(
      () => ({ status: "error", message: "Upload failed. Please try again." }) as const,
    );
    if (ticket.status === "disabled") return { ok: true, data };
    if (ticket.status === "error") {
      errors[field] = ticket.message;
      continue;
    }
    try {
      await putFile(ticket.url, file, ticket.contentType, (loaded) => {
        sent.set(file, loaded);
        report();
      });
    } catch {
      errors[field] = `"${file.name}" couldn't be uploaded. Please check your connection and try again.`;
      continue;
    }
    sent.set(file, file.size);
    report();
    const ref: UploadRef = { key: ticket.key, name: file.name, size: file.size, type: ticket.contentType };
    replaced.set(file, JSON.stringify(ref));
  }
  if (Object.keys(errors).length) return { ok: false, errors };

  const next = new FormData();
  for (const [name, value] of data.entries()) {
    const ref = typeof value === "string" ? undefined : replaced.get(value);
    if (ref) next.append(name, ref);
    else if (typeof value === "string" || !fileFields.has(name) || value.size > 0) next.append(name, value);
  }
  return { ok: true, data: next };
}

type FieldProps<F extends Field> = {
  field: F;
  ids: Ids;
  describedBy?: string;
  invalid?: boolean;
};

// ------------------------------------------------------------- field parts

function RequiredMark({ required }: { required?: boolean }) {
  if (!required) return null;
  return (
    <span className={styles.required}>
      <span aria-hidden="true">*</span>
      <span className="visually-hidden"> (required)</span>
    </span>
  );
}

function Legend({ field }: { field: Field }) {
  return (
    <legend className={cx(styles.label, field.hideLabel && "visually-hidden")}>
      {field.label}
      <RequiredMark required={field.required} />
    </legend>
  );
}

function SubLabel({ htmlFor, text, visible }: { htmlFor: string; text: string; visible: boolean }) {
  return (
    <label htmlFor={htmlFor} className={visible ? styles.subLabel : "visually-hidden"}>
      {text}
    </label>
  );
}

function ChoiceGroup({ field, ids, describedBy, invalid }: FieldProps<RadioField | CheckboxField>) {
  const columns = field.columns ?? 1;
  return (
    <fieldset className={styles.group} aria-describedby={describedBy}>
      <Legend field={field} />
      <div className={cx(styles.choices, columns === 2 && styles.cols2, columns === 3 && styles.cols3)}>
        {field.choices.map((choice, i) => (
          <label key={choice.value} className={styles.choice} htmlFor={`${ids.input}-${i}`}>
            <input
              id={`${ids.input}-${i}`}
              className={field.type === "radio" ? styles.radio : styles.checkbox}
              type={field.type}
              name={field.name}
              value={choice.value}
              required={field.type === "radio" ? field.required : undefined}
              aria-invalid={invalid || undefined}
            />
            <span>{choice.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function ConsentText({ field }: { field: ConsentField }) {
  const { text, link } = field;
  if (!link) return <>{text}</>;
  const at = text.indexOf(link.text);
  const anchor = (
    <a href={link.href} target="_blank" rel="noopener" className={styles.link}>
      {link.text}
    </a>
  );
  if (at === -1) {
    return (
      <>
        {text} {anchor}
      </>
    );
  }
  return (
    <>
      {text.slice(0, at)}
      {anchor}
      {text.slice(at + link.text.length)}
    </>
  );
}

function Consent({ field, ids, describedBy, invalid }: FieldProps<ConsentField>) {
  return (
    <fieldset className={styles.group} aria-describedby={describedBy}>
      <legend className={cx(styles.label, (field.hideLabel || field.label === field.text) && "visually-hidden")}>
        {field.label}
        <RequiredMark required={field.required} />
      </legend>
      <label className={styles.choice} htmlFor={ids.input}>
        <input
          id={ids.input}
          className={styles.checkbox}
          type="checkbox"
          name={field.name}
          value="1"
          required={field.required}
          aria-invalid={invalid || undefined}
        />
        <span>
          <ConsentText field={field} />
        </span>
      </label>
    </fieldset>
  );
}

function NameInputs({ field, ids, describedBy, invalid }: FieldProps<NameField>) {
  return (
    <fieldset className={styles.group} aria-describedby={describedBy}>
      <Legend field={field} />
      <div className={cx(styles.parts, field.parts.length > 1 && styles.cols2)}>
        {field.parts.map((part) => {
          const id = `${ids.input}-${part}`;
          const placeholder = field.placeholders?.[part];
          return (
            <div key={part} className={styles.part}>
              <input
                id={id}
                className={styles.input}
                type="text"
                name={partName(field.name, part)}
                placeholder={placeholder}
                autoComplete={NAME_AUTOCOMPLETE[part]}
                required={field.required}
                maxLength={500}
                aria-invalid={invalid || undefined}
              />
              <SubLabel htmlFor={id} text={NAME_LABELS[part]} visible={!placeholder} />
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

function AddressInputs({ field, ids, describedBy, invalid }: FieldProps<AddressField>) {
  return (
    <fieldset className={styles.group} aria-describedby={describedBy}>
      <Legend field={field} />
      <div className={cx(styles.parts, styles.cols2)}>
        {field.parts.map((part) => {
          const id = `${ids.input}-${part}`;
          const placeholder = field.placeholders?.[part];
          const full = part === "street" || part === "line2";
          const required = field.required && part !== "line2";
          return (
            <div key={part} className={cx(styles.part, full && styles.spanAll)}>
              {part === "country" ? (
                <select
                  id={id}
                  className={styles.select}
                  name={partName(field.name, part)}
                  autoComplete={ADDRESS_AUTOCOMPLETE[part]}
                  defaultValue={field.defaultCountry ?? ""}
                  required={required}
                  aria-invalid={invalid || undefined}
                >
                  <option value="">Select a country</option>
                  {field.countries?.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={id}
                  className={styles.input}
                  type="text"
                  name={partName(field.name, part)}
                  placeholder={placeholder}
                  autoComplete={ADDRESS_AUTOCOMPLETE[part]}
                  required={required}
                  maxLength={500}
                  aria-invalid={invalid || undefined}
                />
              )}
              <SubLabel htmlFor={id} text={ADDRESS_LABELS[part]} visible={!placeholder} />
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

function DateInputs({ field, ids, describedBy, invalid }: FieldProps<DateField>) {
  if (field.style === "picker") {
    return (
      <>
        <FieldLabel field={field} htmlFor={ids.input} />
        <input
          id={ids.input}
          className={styles.input}
          type="date"
          name={field.name}
          required={field.required}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
        />
      </>
    );
  }
  const min = field.minYear ?? 2020;
  const max = field.maxYear ?? min + 5;
  const options: Record<(typeof DATE_PARTS)[number], { value: string; label: string }[]> = {
    month: MONTHS.map((label, i) => ({ value: String(i + 1), label })),
    day: Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
    year: Array.from({ length: max - min + 1 }, (_, i) => ({ value: String(min + i), label: String(min + i) })),
  };
  return (
    <fieldset className={styles.group} aria-describedby={describedBy}>
      <Legend field={field} />
      <div className={cx(styles.parts, styles.cols3)}>
        {DATE_PARTS.map((part) => {
          const id = `${ids.input}-${part}`;
          const label = part[0].toUpperCase() + part.slice(1);
          return (
            <div key={part} className={styles.part}>
              <select
                id={id}
                className={styles.select}
                name={partName(field.name, part)}
                defaultValue=""
                required={field.required}
                aria-invalid={invalid || undefined}
              >
                <option value="">{label}</option>
                {options[part].map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <SubLabel htmlFor={id} text={label} visible={false} />
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

function fileRules(field: FileField) {
  const rules = [];
  if (field.extensions) rules.push(`Accepted file types: ${field.extensions.join(", ")}.`);
  rules.push(`Max. file size: ${formatBytes(field.maxSize)}.`);
  if (field.multiple && field.maxFiles) rules.push(`Up to ${field.maxFiles} files.`);
  return rules.join(" ");
}

function FileInput({ field, ids, describedBy, invalid }: FieldProps<FileField>) {
  const rulesId = `${ids.input}-rules`;
  return (
    <>
      <FieldLabel field={field} htmlFor={ids.input} />
      <input
        id={ids.input}
        className={styles.file}
        type="file"
        name={field.name}
        multiple={field.multiple}
        accept={field.extensions?.map((e) => `.${e}`).join(",")}
        required={field.required}
        aria-describedby={cx(describedBy, rulesId) || undefined}
        aria-invalid={invalid || undefined}
      />
      <p id={rulesId} className={styles.hint}>
        {fileRules(field)}
      </p>
    </>
  );
}

function FieldLabel({ field, htmlFor }: { field: Field; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className={cx(styles.label, field.hideLabel && "visually-hidden")}>
      {field.label}
      <RequiredMark required={field.required} />
    </label>
  );
}

function Control({ field, ids, describedBy, invalid }: FieldProps<Field>): ReactNode {
  switch (field.type) {
    case "section":
      return <h3 className={styles.section}>{field.label}</h3>;
    case "html":
      return (
        <div className={styles.html}>
          <h4 className={styles.htmlTitle}>{field.label}</h4>
          {field.text && <p>{field.text}</p>}
        </div>
      );
    case "textarea":
      return (
        <>
          <FieldLabel field={field} htmlFor={ids.input} />
          <textarea
            id={ids.input}
            className={styles.textarea}
            name={field.name}
            rows={field.rows ?? 5}
            placeholder={field.placeholder}
            maxLength={field.maxLength ?? 10_000}
            required={field.required}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
          />
        </>
      );
    case "select":
      return (
        <>
          <FieldLabel field={field} htmlFor={ids.input} />
          <select
            id={ids.input}
            className={styles.select}
            name={field.name}
            defaultValue=""
            autoComplete={field.autoComplete}
            required={field.required}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
          >
            <option value="">{field.placeholder || "Select an option"}</option>
            {field.choices.map((choice) => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
              </option>
            ))}
          </select>
        </>
      );
    case "radio":
    case "checkbox":
      return <ChoiceGroup field={field} ids={ids} describedBy={describedBy} invalid={invalid} />;
    case "consent":
      return <Consent field={field} ids={ids} describedBy={describedBy} invalid={invalid} />;
    case "name":
      return <NameInputs field={field} ids={ids} describedBy={describedBy} invalid={invalid} />;
    case "address":
      return <AddressInputs field={field} ids={ids} describedBy={describedBy} invalid={invalid} />;
    case "date":
      return <DateInputs field={field} ids={ids} describedBy={describedBy} invalid={invalid} />;
    case "file":
      return <FileInput field={field} ids={ids} describedBy={describedBy} invalid={invalid} />;
    default:
      return (
        <>
          <FieldLabel field={field} htmlFor={ids.input} />
          <input
            id={ids.input}
            className={styles.input}
            type={field.type}
            name={field.name}
            placeholder={field.placeholder}
            autoComplete={field.autoComplete}
            maxLength={field.maxLength ?? 500}
            inputMode={field.type === "tel" ? "tel" : undefined}
            required={field.required}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
          />
        </>
      );
  }
}

function FieldView({ field, idPrefix, error, visible }: { field: Field; idPrefix: string; error?: string; visible: boolean }) {
  const ids: Ids = {
    input: `${idPrefix}-${field.name}`,
    desc: `${idPrefix}-${field.name}-desc`,
    error: `${idPrefix}-${field.name}-error`,
  };
  const describedBy = cx(field.description && ids.desc, error && ids.error) || undefined;
  return (
    // A disabled fieldset keeps hidden fields out of the submitted FormData
    // while preserving what the visitor typed if the field reappears.
    <fieldset
      className={cx(
        styles.cell,
        field.width === "half" && styles.half,
        field.width === "third" && styles.third,
        error && styles.invalid,
      )}
      disabled={!visible}
      hidden={!visible}
      data-field={field.name}
      data-invalid={error ? "" : undefined}
    >
      <Control field={field} ids={ids} describedBy={describedBy} invalid={Boolean(error)} />
      {field.description && (
        <p id={ids.desc} className={styles.hint}>
          {field.description}
        </p>
      )}
      {error && (
        <p id={ids.error} className={styles.error}>
          {error}
        </p>
      )}
    </fieldset>
  );
}

// ------------------------------------------------------------- form

export function Form({ definition }: { definition: FormDefinition }) {
  const action = useMemo(() => submitForm.bind(null, definition.id), [definition.id]);
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);
  const steps = useMemo(() => resolveSteps(definition), [definition]);
  const idPrefix = useId();
  const formRef = useRef<HTMLFormElement>(null);

  const [values, setValues] = useState<FormValues>({});
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});
  const [focusRequest, setFocusRequest] = useState(0);
  const [handledState, setHandledState] = useState(state);
  const [upload, setUpload] = useState<UploadProgress | null>(null);
  const busy = pending || upload !== null;

  const visible = useMemo(() => visibleFields(definition, values), [definition, values]);
  const multiStep = steps.length > 1;
  const lastStep = step === steps.length - 1;

  const stepOf = (errs: FormErrors) => steps.findIndex((s) => s.fields.some((f) => errs[f.name]));

  const showErrors = (errs: FormErrors) => {
    setErrors(errs);
    const target = stepOf(errs);
    if (target !== -1) setStep(target);
    setFocusRequest((n) => n + 1);
  };

  // Adopt server-side errors once per action result.
  if (state !== handledState) {
    setHandledState(state);
    if (state.status === "error") {
      setErrors(state.errors);
      const target = stepOf(state.errors);
      if (target !== -1) setStep(target);
      setFocusRequest((n) => n + 1);
    }
  }

  useEffect(() => {
    if (!focusRequest) return;
    const form = formRef.current;
    const invalid = form?.querySelector<HTMLElement>(
      "[aria-invalid=true]",
    );
    (invalid ?? form?.querySelector<HTMLElement>("[data-form-alert]"))?.focus();
  }, [focusRequest]);

  const handleChange = (event: FormEvent<HTMLFormElement>) => {
    const target = event.target as HTMLInputElement;
    if (!target.name || target.name === HONEYPOT_FIELD) return;
    const data = new FormData(event.currentTarget);
    setValues(parseFormData(definition, data).values);
    const name = fieldNameOf(target.name);
    // Check uploads straight away so a 300 MB video is rejected before sending.
    if (target.type === "file") {
      const result = validateSubmission(definition, data, new Set([name]));
      setErrors((prev) => {
        const next = { ...prev };
        if (!result.ok && result.errors[name]) next[name] = result.errors[name];
        else delete next[name];
        return next;
      });
    } else if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const goTo = (index: number) => {
    setStep(index);
    formRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (!lastStep) {
      const result = validateSubmission(definition, data, new Set(steps[step].fields.map((f) => f.name)));
      if (!result.ok) return showErrors(result.errors);
      setErrors({});
      return goTo(step + 1);
    }
    const result = validateSubmission(definition, data);
    if (!result.ok) return showErrors(result.errors);
    setErrors({});
    setUpload({ loaded: 0, total: 0 });
    void uploadFiles(definition, data, setUpload)
      .then((prepared) => {
        if (!prepared.ok) return showErrors(prepared.errors);
        startTransition(() => formAction(prepared.data));
      })
      .finally(() => setUpload(null));
  };

  if (state.status === "success") {
    return (
      <div className={styles.success} role="status">
        <svg className={styles.successIcon} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="11" />
          <path d="m7 12.5 3.2 3.2L17 9" />
        </svg>
        <p>{state.message}</p>
      </div>
    );
  }

  const errorCount = Object.keys(errors).length;
  const alert =
    state.status === "error" && (errorCount > 0 || Object.keys(state.errors).length === 0)
      ? state.message
      : errorCount > 0
        ? "Please correct the highlighted fields."
        : null;

  return (
    <form
      ref={formRef}
      className={styles.form}
      onSubmit={handleSubmit}
      onChange={handleChange}
      noValidate
      aria-label={definition.title}
      aria-busy={busy || undefined}
    >
      {definition.description && <p className={styles.intro}>{definition.description}</p>}

      {multiStep && (
        <div className={styles.progress}>
          <p className={styles.progressText} aria-live="polite">
            Step {step + 1} of {steps.length}
            {steps[step].title && <span>: {steps[step].title}</span>}
          </p>
          <div className={styles.progressBar} aria-hidden="true">
            <span style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
          </div>
        </div>
      )}

      {alert && (
        <p className={styles.alert} role="alert" tabIndex={-1} data-form-alert>
          {alert}
        </p>
      )}

      {steps.map((s, index) => (
        <div key={s.title ?? index} className={styles.step} hidden={index !== step}>
          {multiStep && s.title && <h3 className={styles.stepTitle}>{s.title}</h3>}
          {s.description && <p className={styles.intro}>{s.description}</p>}
          <div className={styles.grid}>
            {s.fields.map((field) => (
              <FieldView
                key={field.name}
                field={field}
                idPrefix={idPrefix}
                error={isInputField(field) ? errors[field.name] : undefined}
                visible={visible.has(field.name)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor={`${idPrefix}-${HONEYPOT_FIELD}`}>Leave this field empty</label>
        <input id={`${idPrefix}-${HONEYPOT_FIELD}`} type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
      </div>

      <div className={styles.actions}>
        {multiStep && step > 0 && (
          <button
            type="button"
            className={cx(buttonStyles.button, buttonStyles.secondary)}
            onClick={() => goTo(step - 1)}
            disabled={busy}
          >
            Previous
          </button>
        )}
        <button type="submit" className={cx(buttonStyles.button, buttonStyles.primary, styles.submit)} disabled={busy}>
          {!lastStep
            ? "Next"
            : upload && upload.total > 0
              ? `Uploading… ${Math.min(99, Math.floor((upload.loaded / upload.total) * 100))}%`
              : busy
                ? "Sending…"
                : definition.submitText}
        </button>
      </div>
      {definition.submitNote && <p className={styles.hint}>{definition.submitNote}</p>}
    </form>
  );
}
