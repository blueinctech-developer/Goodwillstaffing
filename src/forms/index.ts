import { accommodationListing } from "./definitions/accommodation-listing";
import { candidateNewsletter } from "./definitions/candidate-newsletter";
import { careers } from "./definitions/careers";
import { clientNewsletter } from "./definitions/client-newsletter";
import { contact } from "./definitions/contact";
import { nurseLead } from "./definitions/nurse-lead";
import { physicianRecruiting } from "./definitions/physician-recruiting";
import { requestStaffing } from "./definitions/request-staffing";
import { smartApply } from "./definitions/smart-apply";
import { talentPool } from "./definitions/talent-pool";
import { travelNurseApplication } from "./definitions/travel-nurse-application";
import { travelNursePhotoVideo } from "./definitions/travel-nurse-photo-video";
import type { FormDefinition } from "./types";

export type * from "./types";

/** Every form on the site, in Gravity Forms id order then the extras. */
export const FORMS: readonly FormDefinition[] = [
  requestStaffing,
  travelNurseApplication,
  physicianRecruiting,
  travelNursePhotoVideo,
  contact,
  accommodationListing,
  careers,
  talentPool,
  candidateNewsletter,
  clientNewsletter,
  nurseLead,
  smartApply,
];

const BY_ID = new Map(FORMS.map((form) => [form.id, form]));

/** Gravity Forms id (as used by imported content blocks) -> form id. */
export const LEGACY_GRAVITY_IDS: Readonly<Record<number, string>> = {
  2: requestStaffing.id,
  3: travelNurseApplication.id,
  4: physicianRecruiting.id,
  5: travelNursePhotoVideo.id,
  6: contact.id,
  7: accommodationListing.id,
  8: careers.id,
  9: talentPool.id,
};

/** Resolve a form by slug, Gravity Forms number, or legacy id ("mc4wp:996027"). */
export function getForm(id: string | number): FormDefinition | undefined {
  if (typeof id === "number") return BY_ID.get(LEGACY_GRAVITY_IDS[id]);
  if (/^\d+$/.test(id)) return BY_ID.get(LEGACY_GRAVITY_IDS[Number(id)]);
  return BY_ID.get(id) ?? FORMS.find((form) => form.legacyId === id);
}
