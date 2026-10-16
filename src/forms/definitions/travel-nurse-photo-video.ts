import { LANGUAGES, choices } from "../choices";
import type { FormDefinition } from "../types";

// Gravity Forms #5 — travel nurse photo/video submission.
export const travelNursePhotoVideo: FormDefinition = {
  id: "travel-nurse-photo-video",
  legacyId: "5",
  title: "Share Your Travel Nurse Photo or Video",
  pages: ["/travel-nurse-photo-video/"],
  notify: "marketing",
  submitText: "Submit",
  successMessage:
    "Thank you for sharing your story! Our team will review your submission and may feature it on our social channels.",
  fields: [
    {
      type: "name",
      name: "name",
      label: "Full Name",
      parts: ["first", "last"],
      placeholders: { first: "First Name", last: "Last name" },
      required: true,
      legacy: "input_1",
    },
    { type: "email", name: "email", label: "Email", required: true, autoComplete: "email", legacy: "input_2" },
    { type: "select", name: "language", label: "Language", choices: LANGUAGES, required: true, legacy: "input_16" },
    // A Gravity Forms "number" field labelled "Phone:"; treated as a phone number.
    { type: "tel", name: "phone", label: "Phone", autoComplete: "tel", legacy: "input_15" },
    {
      type: "text",
      name: "specialty",
      label: "Specialty",
      placeholder: "Enter your specialty, eg: Registered Nurse,RN",
      required: true,
      legacy: "input_18",
    },
    {
      type: "file",
      name: "media",
      label: "Upload Photo or Video file",
      // The original accepted any file type; narrowed to photos and videos.
      extensions: ["jpg", "jpeg", "png", "gif", "webp", "heic", "heif", "mp4", "mov", "m4v", "avi", "webm"],
      maxSize: 256 * 1024 * 1024,
      legacy: "input_17",
    },
    {
      type: "text",
      name: "location",
      label: "Location of photo or video",
      placeholder: "For Example, Toronto",
      required: true,
      legacy: "input_5",
    },
    {
      type: "textarea",
      name: "experience",
      label: "Your Experience",
      description: "Share Any story associated with the photo or video.",
      legacy: "input_11",
    },
    {
      type: "text",
      name: "socialHandles",
      label: "Your social media handle",
      description: "Please share your social handles and the platform name, (comma separated)",
      placeholder: "for example twitter@ladyjane, instagram@iamladyjane",
      legacy: "input_14",
    },
    {
      type: "radio",
      name: "socialTagging",
      label: "Social Media tagging",
      description: "Please indicate whether we may tag you when posting your image or video in a social media.",
      choices: choices(["Yes", "No"]),
      legacy: "input_12",
    },
    {
      // Optional in the original form.
      type: "consent",
      name: "consent",
      label: "Consent",
      text: "I give consent to Goodwill staffing & recruitment to share my photos/videos on all their social media accounts now and in the future",
      legacy: "input_8",
    },
  ],
};
