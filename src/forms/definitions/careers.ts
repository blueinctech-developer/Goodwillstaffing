import { LANGUAGES, choices } from "../choices";
import type { FormDefinition } from "../types";

// Gravity Forms #8 — applying to work at Goodwill (CV + cover letter).
export const careers: FormDefinition = {
  id: "careers",
  legacyId: "8",
  title: "Job Application",
  pages: ["/careers/"],
  notify: "careers",
  submitText: "Submit",
  successMessage:
    "Thank you for your application. Our team will review your CV and contact you if your experience is a match.",
  fields: [
    {
      type: "name",
      name: "name",
      label: "Applicant Details",
      parts: ["first", "last"],
      placeholders: { first: "First Name", last: "Last Name" },
      required: true,
      legacy: "input_1",
    },
    {
      // Canadian address: the country input is hidden in the original.
      type: "address",
      name: "address",
      label: "Street Address",
      parts: ["street", "city", "province", "postal"],
      placeholders: { city: "City", province: "Province", postal: "Postal Code" },
      defaultCountry: "CA",
      required: true,
      legacy: "input_2",
    },
    {
      type: "email",
      name: "email",
      label: "Email",
      placeholder: "Enter Your Email",
      width: "half",
      required: true,
      autoComplete: "email",
      legacy: "input_3",
    },
    { type: "select", name: "language", label: "Language", choices: LANGUAGES, required: true, legacy: "input_17" },
    {
      type: "tel",
      name: "phone",
      label: "Phone",
      placeholder: "Phone",
      width: "half",
      required: true,
      autoComplete: "tel",
      legacy: "input_13",
    },
    { type: "text", name: "role", label: "What role are you applying for?", required: true, legacy: "input_18" },
    {
      type: "radio",
      name: "eligibleInCanada",
      label: "Are you legally eligible for employment in Canada?",
      choices: choices(["Yes", "No"]),
      required: true,
      legacy: "input_15",
    },
    {
      type: "textarea",
      name: "coverLetter",
      label: "Cover Letter",
      placeholder: "Type your application cover letter here. Be sure to mention your skills and experience.",
      required: true,
      legacy: "input_20",
    },
    {
      type: "file",
      name: "cv",
      label: "Upload Your CV",
      description: "Accepted file types: pdf, Max. file size: 5 MB.",
      extensions: ["pdf"],
      maxSize: 5 * 1024 * 1024,
      width: "half",
      required: true,
      legacy: "input_9",
    },
    {
      // The original also listed a selectable "Select Period" option; dropped as a placeholder artefact.
      type: "select",
      name: "workPeriod",
      label: "Work Period",
      choices: choices(["Hourly", "Monthly", "Yearly"]),
      placeholder: "Preferred Work Period",
      width: "half",
      legacy: "input_11",
    },
    {
      // Optional in the original form.
      type: "consent",
      name: "consent",
      label: "Consent",
      text: "I agree to the privacy policy.",
      link: { href: "/privacy-policy/", text: "privacy policy" },
      legacy: "input_7",
    },
  ],
};
