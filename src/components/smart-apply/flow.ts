import {
  RESUME_EXTENSIONS,
  RESUME_MAX_SIZE,
  SMART_APPLY_CONTACT,
  SMART_APPLY_INTENT,
  SMART_APPLY_JOB_TYPES,
  SMART_APPLY_PROVINCES,
  SMART_APPLY_ROLES,
  SMART_APPLY_URGENCY,
  SMART_APPLY_YES_NO,
} from "@/forms/definitions/smart-apply";
import type { Choice } from "@/forms/types";
import { EMAIL_RE, validPhone } from "@/forms/validate";

// The SmartApply conversation as data: a small state machine the chat walks
// through. Wording, order and branching are copied from the live GoodwillBot
// conversation (docs/smart-apply-spec.md). `field` names match the
// `smart-apply` form definition, which receives every answer at the end.

/** Answers collected so far, keyed by form field name. The résumé is held separately. */
export type Answers = Partial<Record<string, string | string[]>>;

export type StepId =
  | "intro"
  | "name"
  | "greet"
  | "intent"
  | "roles"
  | "locations"
  | "jobTypes"
  | "travel"
  | "background"
  | "experience"
  | "certified"
  | "wantsGuidance"
  | "noCertificationNote"
  | "startDate"
  | "resume"
  | "jobContactMethod"
  | "hireIntro"
  | "roleToFill"
  | "orgLocations"
  | "urgency"
  | "hireContactMethod"
  | "email"
  | "phone"
  | "endJob"
  | "endGuidance"
  | "endNoCertification"
  | "endHire";

/** Static text, or text built from earlier answers. `%name%` is substituted either way. */
type Text = string | ((answers: Answers) => string);
type Next = StepId | ((answers: Answers) => StepId);

type StepBase = { id: StepId };

/** The bot says something and moves straight on. */
export type MessageStep = StepBase & { kind: "message"; text: Text; next: Next };

export type TextStep = StepBase & {
  kind: "text";
  prompt: Text;
  field: string;
  input: "text" | "email" | "tel";
  placeholder: string;
  autoComplete?: string;
  /** Returns the bot's re-ask when the answer is not acceptable. */
  validate?: (value: string) => string | undefined;
  next: Next;
};

export type SingleStep = StepBase & { kind: "single"; prompt: Text; field: string; options: Choice[]; next: Next };

export type MultiStep = StepBase & { kind: "multi"; prompt: Text; field: string; options: Choice[]; next: Next };

export type FileStep = StepBase & {
  kind: "file";
  prompt: Text;
  field: string;
  extensions: string[];
  maxSize: number;
  next: Next;
};

/** Conversation over: submit, then show `text` (if any) and the home button. */
export type EndStep = StepBase & { kind: "end"; text?: Text };

export type Step = MessageStep | TextStep | SingleStep | MultiStep | FileStep | EndStep;
export type InputStep = TextStep | SingleStep | MultiStep | FileStep;

const job = SMART_APPLY_INTENT.job;

/** Words typed at a text prompt that clear the conversation, as on the live bot. */
export const RESET_WORDS = new Set(["reset"]);

const contactNext = (answers: Answers): StepId => (answers.contactMethod === SMART_APPLY_CONTACT.phone ? "phone" : "email");

function endFor(answers: Answers): StepId {
  if (answers.intent !== job) return "endHire";
  if (answers.certified === "YES") return "endJob";
  return answers.wantsGuidance === "YES" ? "endGuidance" : "endNoCertification";
}

const STEPS: Step[] = [
  {
    id: "intro",
    kind: "message",
    text:
      "Hello there! I'm GoodwillBot, here to connect you with exciting healthcare opportunities across Canada. " +
      "Complete the walkthrough steps, and I'll forward them to our human recruiters to match you with available " +
      'opportunities. If you\'d like to clear your responses and start fresh at any time, simply type "reset" and ' +
      "press Enter. Let's get started!",
    next: "name",
  },
  {
    id: "name",
    kind: "text",
    prompt: "First, can I get your name, please?",
    field: "name",
    input: "text",
    placeholder: "Type your name",
    autoComplete: "name",
    next: "greet",
  },
  { id: "greet", kind: "message", text: "Thank you, %name%! It's great to meet you. 😊", next: "intent" },
  {
    id: "intent",
    kind: "single",
    prompt:
      "Are you here to explore healthcare job opportunities, or are you looking to hire healthcare professionals?",
    field: "intent",
    options: [
      { value: SMART_APPLY_INTENT.job, label: SMART_APPLY_INTENT.job },
      { value: SMART_APPLY_INTENT.hire, label: SMART_APPLY_INTENT.hire },
    ],
    next: (a) => (a.intent === job ? "roles" : "hireIntro"),
  },

  // Branch A: looking for a job.
  {
    id: "roles",
    kind: "multi",
    prompt: "Great! What type of healthcare role are you interested in?",
    field: "roles",
    options: SMART_APPLY_ROLES,
    next: "locations",
  },
  {
    id: "locations",
    kind: "multi",
    prompt: "Thanks! Could you share where you'd like to work?",
    field: "locations",
    options: SMART_APPLY_PROVINCES,
    next: "jobTypes",
  },
  {
    id: "jobTypes",
    kind: "multi",
    prompt: "Got it. Are you looking for",
    field: "jobTypes",
    options: SMART_APPLY_JOB_TYPES,
    next: "travel",
  },
  {
    id: "travel",
    kind: "single",
    prompt: "Are you open to travel opportunities?",
    field: "travel",
    options: SMART_APPLY_YES_NO,
    next: "background",
  },
  { id: "background", kind: "message", text: "Could you tell me a bit about your professional background?", next: "experience" },
  {
    id: "experience",
    kind: "text",
    prompt: "How many years of experience do you have?",
    field: "experience",
    input: "text",
    placeholder: "e.g. 5 years",
    next: "certified",
  },
  {
    id: "certified",
    kind: "single",
    prompt: "Thank you! Do you currently hold the necessary certifications or licenses for this role in Canada?",
    field: "certified",
    options: SMART_APPLY_YES_NO,
    next: (a) => (a.certified === "YES" ? "startDate" : "wantsGuidance"),
  },
  {
    id: "wantsGuidance",
    kind: "single",
    prompt: "Okay, we require a minimum certification. Would you like guidance on how to get certified?",
    field: "wantsGuidance",
    options: SMART_APPLY_YES_NO,
    next: (a) => (a.wantsGuidance === "YES" ? "jobContactMethod" : "noCertificationNote"),
  },
  {
    id: "noCertificationNote",
    kind: "message",
    text:
      "Thank you, %name%! 😊 I've gathered all your details. Please note that certification is a requirement to " +
      "proceed with your application. Our recruiter will reach out soon to guide you through the next steps.",
    next: "jobContactMethod",
  },
  {
    id: "startDate",
    kind: "text",
    prompt: "When would you be available to start?",
    field: "startDate",
    input: "text",
    placeholder: "e.g. Immediately, or 1 March",
    next: "resume",
  },
  {
    id: "resume",
    kind: "file",
    prompt: "Upload your Resume/CV",
    field: "resume",
    extensions: RESUME_EXTENSIONS,
    maxSize: RESUME_MAX_SIZE,
    next: "jobContactMethod",
  },
  {
    id: "jobContactMethod",
    kind: "single",
    prompt: "Almost done! What's the best way for our recruiter to reach you?",
    field: "contactMethod",
    // The live bot shows these in capitals; the stored values are shared with branch B.
    options: [
      { value: SMART_APPLY_CONTACT.email, label: "EMAIL" },
      { value: SMART_APPLY_CONTACT.phone, label: "PHONE" },
    ],
    next: contactNext,
  },

  // Branch B: hiring.
  { id: "hireIntro", kind: "message", text: "Fantastic! Let's help you find the perfect candidates", next: "roleToFill" },
  {
    id: "roleToFill",
    kind: "text",
    prompt: "What type of role are you looking to fill?",
    field: "roleToFill",
    input: "text",
    placeholder: "e.g. Registered Nurse",
    next: "orgLocations",
  },
  {
    id: "orgLocations",
    kind: "multi",
    prompt: "Where is your organization located?",
    field: "orgLocations",
    options: SMART_APPLY_PROVINCES,
    next: "urgency",
  },
  {
    id: "urgency",
    kind: "single",
    prompt: "How soon do you need to fill this role?",
    field: "urgency",
    options: SMART_APPLY_URGENCY,
    next: "hireContactMethod",
  },
  {
    id: "hireContactMethod",
    kind: "single",
    prompt: "Finally, what's the best way for us to follow up with you?",
    field: "contactMethod",
    options: [
      { value: SMART_APPLY_CONTACT.phone, label: "Phone" },
      { value: SMART_APPLY_CONTACT.email, label: "Email" },
    ],
    next: contactNext,
  },

  // Contact details (both branches).
  {
    id: "email",
    kind: "text",
    prompt: "Enter your email",
    field: "email",
    input: "email",
    placeholder: "name@example.com",
    autoComplete: "email",
    validate: (value) =>
      EMAIL_RE.test(value) ? undefined : "Hmm, that doesn't look like a valid email address. Could you check it and enter it again?",
    next: endFor,
  },
  {
    id: "phone",
    kind: "text",
    prompt: "Enter Your Phone Number",
    field: "phone",
    input: "tel",
    placeholder: "e.g. 416 555 0123",
    autoComplete: "tel",
    validate: (value) =>
      validPhone(value) ? undefined : "Hmm, that doesn't look like a valid phone number. Could you check it and enter it again?",
    next: endFor,
  },

  // The live bot ends these two paths without a closing line; one is added so
  // visitors know their details were sent.
  {
    id: "endJob",
    kind: "end",
    text: "Thank you, %name%! 😊 I've passed your details to our recruiters, who will be in touch soon.",
  },
  {
    id: "endGuidance",
    kind: "end",
    text: "Thanks, %name%! 😊 I've collected all the details. Our recruiter will reach out to you soon to discuss your certification needs.",
  },
  { id: "endNoCertification", kind: "end", text: "Thanks! Your details are on their way to our recruiters." },
  {
    id: "endHire",
    kind: "end",
    text: "Thank you! Our team will contact you soon to discuss your staffing needs in more detail. Have a great day!",
  },
];

const BY_ID = new Map(STEPS.map((step) => [step.id, step]));

export const FIRST_STEP: StepId = "intro";

export function getStep(id: StepId): Step {
  const step = BY_ID.get(id);
  if (!step) throw new Error(`SmartApply: unknown step "${id}"`);
  return step;
}

export function nextStep(step: Exclude<Step, EndStep>, answers: Answers): StepId {
  return typeof step.next === "function" ? step.next(answers) : step.next;
}

/** Resolve a step's text and substitute %name%. */
export function render(text: Text, answers: Answers): string {
  const raw = typeof text === "function" ? text(answers) : text;
  const name = typeof answers.name === "string" ? answers.name : "";
  return raw.replaceAll("%name%", name);
}

/** Labels of the chosen options, for the visitor's chat bubble. */
export function labelsFor(options: Choice[], values: string[]): string {
  return values.map((v) => options.find((o) => o.value === v)?.label ?? v).join(", ");
}

/** Every answer field, in the order they are posted to the form. */
export const ANSWER_FIELDS = [
  "name",
  "intent",
  "roles",
  "locations",
  "jobTypes",
  "travel",
  "experience",
  "certified",
  "wantsGuidance",
  "startDate",
  "roleToFill",
  "orgLocations",
  "urgency",
  "contactMethod",
  "email",
  "phone",
] as const;
