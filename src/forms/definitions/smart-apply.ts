import { choices } from "../choices";
import type { ConditionalLogic, FormDefinition } from "../types";

// SmartApply: the "GoodwillBot" conversation from goodwillstaffing.ca (WPBot
// "ChatBot Conversational Forms", conversation CF68c9c06a5e697). It is never
// rendered as a form: src/components/smart-apply/SmartApplyChat.tsx asks the
// questions one at a time (see flow.ts) and posts every answer here at the
// end. Branch-only fields use conditional logic, so validation only requires
// the answers on the path the visitor actually took.

// Values are the exact chip labels from the live conversation.
export const SMART_APPLY_INTENT = {
  job: "I'm looking for a job.",
  hire: "I'm hiring healthcare staff.",
} as const;

export const SMART_APPLY_CONTACT = { email: "Email", phone: "Phone" } as const;

export const SMART_APPLY_YES_NO = choices(["YES", "NO"]);

export const SMART_APPLY_ROLES = choices([
  "Registered Nurse (RN)",
  "Licensed Practical Nurse (LPN)",
  "Registered Practical Nurse (RPN)",
  "Nurse Practitioner (NP)",
  "Allied Health Professional",
  "Physiotherapist",
  "Occupational Therapist",
  "Speech-Language Pathologist",
  "Social Worker",
  "Medical Office Assistant (MOA)",
  "Personal Support Worker (PSW)",
  "Health Care Aide (HCA)",
  "Respiratory Therapist",
  "Radiologic Technologist",
  "Medical Laboratory Technologist",
  "Dietitian",
  "Paramedic",
  "Pharmacist",
  "Physician Assistant (PA)",
  "Chiropractor",
  "Recreational Therapist",
  "Public Health Nurse",
  "Community Health Worker",
  "Home Care Nurse",
  "Clinical Nurse Specialist (CNS)",
  "Mental Health Nurse",
  "School Nurse",
  "Naturopathic Doctor",
]);

/** In the live bot's order (provinces, then territories). */
export const SMART_APPLY_PROVINCES = choices([
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Nova Scotia",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
  "Northwest Territories",
  "Nunavut",
  "Yukon",
]);

export const SMART_APPLY_JOB_TYPES = choices(["Fulltime Staff Positions", "Per Diem/PRN", "Local contracts"]);

export const SMART_APPLY_URGENCY = choices(["Immediately", "Within the next month", "Flexible timeline"]);

export const RESUME_EXTENSIONS = ["pdf", "doc", "docx"];
export const RESUME_MAX_SIZE = 5 * 1024 * 1024;

const show = (match: ConditionalLogic["match"], ...rules: ConditionalLogic["rules"]): ConditionalLogic => ({
  action: "show",
  match,
  rules,
});
const jobSeeker = { field: "intent", operator: "is", value: SMART_APPLY_INTENT.job } as const;
const employer = { field: "intent", operator: "is", value: SMART_APPLY_INTENT.hire } as const;

export const smartApply: FormDefinition = {
  id: "smart-apply",
  legacyId: "wpbot:CF68c9c06a5e697",
  title: "SmartApply",
  description: "GoodwillBot conversation from /ai-recruiter/ (job seekers and employers).",
  pages: ["/ai-recruiter/"],
  notify: "smartapply",
  notifySubject: "Notification: New Smart Apply Submission",
  submitText: "Send",
  successMessage: "Thank you! Our recruiters will be in touch soon.",
  fields: [
    { type: "text", name: "name", label: "Name", required: true, autoComplete: "name" },
    {
      type: "radio",
      name: "intent",
      label: "Looking for",
      choices: choices([SMART_APPLY_INTENT.job, SMART_APPLY_INTENT.hire]),
      required: true,
    },

    // Branch A: job seekers.
    {
      type: "checkbox",
      name: "roles",
      label: "Roles of interest",
      choices: SMART_APPLY_ROLES,
      required: true,
      logic: show("all", jobSeeker),
    },
    {
      type: "checkbox",
      name: "locations",
      label: "Preferred locations",
      choices: SMART_APPLY_PROVINCES,
      required: true,
      logic: show("all", jobSeeker),
    },
    {
      type: "checkbox",
      name: "jobTypes",
      label: "Looking for",
      choices: SMART_APPLY_JOB_TYPES,
      required: true,
      logic: show("all", jobSeeker),
    },
    {
      type: "radio",
      name: "travel",
      label: "Open to travel",
      choices: SMART_APPLY_YES_NO,
      required: true,
      logic: show("all", jobSeeker),
    },
    {
      type: "text",
      name: "experience",
      label: "Years of experience",
      required: true,
      logic: show("all", jobSeeker),
    },
    {
      type: "radio",
      name: "certified",
      label: "Holds Canadian certification / licence",
      choices: SMART_APPLY_YES_NO,
      required: true,
      logic: show("all", jobSeeker),
    },
    {
      type: "radio",
      name: "wantsGuidance",
      label: "Wants certification guidance",
      choices: SMART_APPLY_YES_NO,
      required: true,
      logic: show("all", jobSeeker, { field: "certified", operator: "is", value: "NO" }),
    },
    {
      type: "text",
      name: "startDate",
      label: "Available to start",
      required: true,
      logic: show("all", jobSeeker, { field: "certified", operator: "is", value: "YES" }),
    },
    {
      type: "file",
      name: "resume",
      label: "Resume/CV",
      description: "Accepted file types: pdf, doc, docx. Max. file size: 5 MB.",
      extensions: RESUME_EXTENSIONS,
      maxSize: RESUME_MAX_SIZE,
      required: true,
      logic: show("all", jobSeeker, { field: "certified", operator: "is", value: "YES" }),
    },

    // Branch B: employers.
    {
      type: "text",
      name: "roleToFill",
      label: "Role to fill",
      required: true,
      logic: show("all", employer),
    },
    {
      type: "checkbox",
      name: "orgLocations",
      label: "Organization location",
      choices: SMART_APPLY_PROVINCES,
      required: true,
      logic: show("all", employer),
    },
    {
      type: "radio",
      name: "urgency",
      label: "How soon",
      choices: SMART_APPLY_URGENCY,
      required: true,
      logic: show("all", employer),
    },

    // Both branches.
    {
      type: "radio",
      name: "contactMethod",
      label: "Preferred contact method",
      choices: choices([SMART_APPLY_CONTACT.email, SMART_APPLY_CONTACT.phone]),
      required: true,
    },
    {
      type: "email",
      name: "email",
      label: "Email",
      required: true,
      autoComplete: "email",
      logic: show("all", { field: "contactMethod", operator: "is", value: SMART_APPLY_CONTACT.email }),
    },
    {
      type: "tel",
      name: "phone",
      label: "Phone",
      required: true,
      autoComplete: "tel",
      logic: show("all", { field: "contactMethod", operator: "is", value: SMART_APPLY_CONTACT.phone }),
    },
  ],
};
