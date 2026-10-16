import { LANGUAGES } from "../choices";
import type { FormDefinition } from "../types";

// Gravity Forms #2 — employer staffing request.
export const requestStaffing: FormDefinition = {
  id: "request-staffing",
  legacyId: "2",
  title: "Request Staffing",
  pages: ["/request-staffing/", "/healthcare-staffing-solutions-across-canada/"],
  notify: "staffing",
  submitText: "Submit",
  // The real confirmation lives in the Gravity Forms settings (not exported).
  successMessage:
    "Thanks for reaching out. A member of our staffing team will contact you shortly to discuss your needs.",
  fields: [
    {
      type: "text",
      name: "fullName",
      label: "Provide your Full name",
      placeholder: "Please enter First name and Last name",
      required: true,
      autoComplete: "name",
      legacy: "input_22",
    },
    {
      // A plain text field in Gravity Forms; validated as an email here.
      type: "email",
      name: "email",
      label: "Email Address",
      placeholder: "Please enter your company email address",
      required: true,
      autoComplete: "email",
      legacy: "input_16",
    },
    { type: "tel", name: "phone", label: "Phone", required: true, autoComplete: "tel", legacy: "input_23" },
    {
      type: "radio",
      name: "language",
      label: "Your preferred Language",
      choices: LANGUAGES,
      columns: 3,
      required: true,
      legacy: "input_25",
    },
    {
      type: "text",
      name: "company",
      label: "Company or Institution name",
      placeholder: "Name of your company/business",
      required: true,
      autoComplete: "organization",
      legacy: "input_18",
    },
    {
      type: "text",
      name: "industry",
      label: "Industry",
      placeholder: "Which industry do you serve",
      legacy: "input_19",
    },
    { type: "textarea", name: "message", label: "How can we partner with you?", rows: 10, legacy: "input_20" },
  ],
};
