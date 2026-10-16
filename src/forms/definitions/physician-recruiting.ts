import { COUNTRIES, LANGUAGES, PHYSICIAN_SPECIALTIES, PROVINCES_AND_TERRITORIES, choices } from "../choices";
import type { FormDefinition } from "../types";

// Gravity Forms #4 — physician & executive recruiting enquiry.
export const physicianRecruiting: FormDefinition = {
  id: "physician-recruiting",
  legacyId: "4",
  title: "Physician & Executive Recruiting",
  pages: ["/goodwill-physician-executive-recruiting/"],
  notify: "recruitment",
  submitText: "Submit",
  successMessage:
    "Thank you for your interest. A member of our physician and executive recruiting team will contact you shortly.",
  fields: [
    {
      // A Gravity Forms name field with only its "First" input enabled.
      type: "text",
      name: "fullName",
      label: "Full Name",
      autoComplete: "name",
      legacy: "input_2.3",
    },
    { type: "tel", name: "phone", label: "Phone number", required: true, autoComplete: "tel", legacy: "input_7" },
    {
      // An address field with only its country input enabled.
      type: "select",
      name: "citizenship",
      label: "Citizenship",
      choices: COUNTRIES,
      placeholder: "",
      legacy: "input_13.6",
    },
    { type: "email", name: "email", label: "Email", autoComplete: "email", legacy: "input_8" },
    {
      // Sic: the original question lists provinces rather than referral sources.
      type: "radio",
      name: "hearAboutUs",
      label: "How did you hear about us?",
      choices: PROVINCES_AND_TERRITORIES,
      columns: 3,
      legacy: "input_15",
    },
    {
      type: "select",
      name: "primaryResidency",
      label: "Primary Residency",
      choices: choices(PHYSICIAN_SPECIALTIES),
      placeholder: "Primary Residency",
      required: true,
      legacy: "input_12",
    },
    { type: "select", name: "language", label: "Language", choices: LANGUAGES, required: true, legacy: "input_14" },
  ],
};
