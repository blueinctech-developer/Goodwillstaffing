import { choices } from "../choices";
import type { FormDefinition } from "../types";

// Mailchimp for WP signup form. Subscribers are now stored locally instead of
// being pushed to Mailchimp; the Mailchimp merge-tag names are kept in `legacy`.

// mc4wp form 995890 ("client newsletter").
export const clientNewsletter: FormDefinition = {
  id: "client-newsletter",
  legacyId: "mc4wp:995890",
  title: "Client Newsletter",
  pages: ["/client-newsletter/"],
  notify: "newsletter",
  submitText: "Sign Up",
  submitNote: "Sign up for staffing updates and company news. Unsubscribe anytime.",
  successMessage: "Thank you, your sign-up request was successful!",
  fields: [
    {
      type: "email",
      name: "email",
      label: "Email Address",
      required: true,
      autoComplete: "email",
      legacy: "EMAIL",
    },
    { type: "text", name: "organization", label: "Organization Name", autoComplete: "organization", legacy: "ORGNAME" },
    { type: "text", name: "contactName", label: "Contact Name", autoComplete: "name", legacy: "FNAME" },
    {
      type: "checkbox",
      name: "facilityTypes",
      label: "Facility Type",
      columns: 2,
      choices: [
        { value: "LTC", label: "Long-Term Care (LTC)" },
        ...choices([
          "Clinics",
          "Hospitals",
          "Rural Remote Facilities",
          "Telehealth Virtual Care Organizations",
          "Correctional Facilities",
          "Group Homes",
          "Assisted Living",
          "Rehabilitation Centres",
          "Home and Community Care Providers",
          "Occupational Health Clinics",
          "First Nations Health Facilities",
        ]),
      ],
      legacy: "FACILITY[]",
    },
    {
      // Ten regions in the original (no Quebec, Northwest Territories or Nunavut).
      type: "select",
      name: "region",
      label: "Region",
      placeholder: "Select Region",
      required: true,
      choices: choices([
        "Alberta",
        "British Columbia",
        "Manitoba",
        "New Brunswick",
        "Newfoundland and Labrador",
        "Nova Scotia",
        "Ontario",
        "Prince Edward Island",
        "Saskatchewan",
        "Yukon",
      ]),
      legacy: "REGION",
    },
    {
      type: "checkbox",
      name: "interests",
      label: "Interest Areas",
      choices: choices([
        "Staffing Updates",
        "Talent Availability Notices",
        "Compliance & Licensing Tips",
        "Partnership Opportunities",
        "Scheduling/Travel Solutions",
      ]),
      legacy: "INTEREST[]",
    },
    {
      type: "consent",
      name: "consent",
      label: "Consent",
      hideLabel: true,
      text: "I agree to the Privacy Policy",
      link: { href: "/privacy-policy/", text: "Privacy Policy" },
      required: true,
      legacy: "CONSENT",
    },
  ],
};
