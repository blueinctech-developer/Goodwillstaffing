# Forms

The forms migrated from goodwillstaffing.ca: Gravity Forms, Mailchimp for WP and the
Salesforce Web-to-Lead "multiPageForm". Each one is a typed, serializable definition.

| File | Purpose |
| --- | --- |
| `types.ts` | `FormDefinition`, the `Field` union, conditional logic, values and `FormState` |
| `definitions/*.ts` | One file per form, copied from the original markup and live conditional-logic JSON |
| `index.ts` | `FORMS`, `getForm(id)` (slug, Gravity number or legacy id), `LEGACY_GRAVITY_IDS` |
| `choices.ts` | Shared choice lists (languages, provinces, countries, specialties) |
| `logic.ts` | Pure FormData parsing and visibility rules, shared by client and server |
| `validate.ts` | `validateSubmission()` checks required fields, formats, the choice whitelist, files and the honeypot, and skips fields hidden by logic |
| `actions.ts` | `submitForm(formId, prevState, formData)` Server Action for `useActionState`, plus `requestUpload()` for direct S3 uploads |
| `sink.ts` | `handleSubmission()`: inserts into Neon `submissions`, stores files in S3, emails the `notify` group through SES and records each outcome in `meta`. Only logs when `DATABASE_URL` is unset. |
| `uploads.ts` | Direct browser-to-S3 uploads: presign, verify with HeadObject, move into `private/submissions/<yyyy>/<mm>/<id>/` |
| `format.ts` | Labelled, readable values for the notification email, the admin and CSV export |
| `salesforce.ts` | Server-side Web-to-Lead forwarding. It only runs when `SALESFORCE_FORWARD=1`. |

Rendering: `src/components/forms/Form.tsx` exports `<FormBlock formId={6} />`, which is
server-side and resolves the id, and `<Form definition={…} />`, the client renderer in
`FormClient.tsx`.

## Forms

"Fields" counts the inputs only. Section headings and HTML blocks are not counted.

| id | Legacy | Fields | Notify | Original page(s) | Conditional logic |
| --- | --- | --- | --- | --- | --- |
| `request-staffing` | GF 2 | 7 | staffing | /request-staffing/, /healthcare-staffing-solutions-across-canada/ | none |
| `travel-nurse-application` | GF 3 | 14 | recruitment | /apply-now/ and site-wide popups (homepage included) | specialty shown when Job Category is "Nursing and Allied Health…" |
| `physician-recruiting` | GF 4 | 7 | recruitment | /goodwill-physician-executive-recruiting/ | none |
| `travel-nurse-photo-video` | GF 5 | 11 | marketing | /travel-nurse-photo-video/ | none |
| `contact` | GF 6 | 18 | general | /contact-us/ | see below |
| `accommodation-listing` | GF 7 | 16 (+4 sections) | housing | /contact-us/ (in export) | Confirm Email must match Email |
| `careers` | GF 8 | 11 | careers | /careers/ | none |
| `talent-pool` | GF 9 | 8 | recruitment | /register-travel-nurse-jobs-canada/ | none |
| `candidate-newsletter` | mc4wp 996027 | 8 | newsletter | /candidate-newsletter/ | none |
| `client-newsletter` | mc4wp 995890 | 7 | newsletter | /client-newsletter/ | none |
| `nurse-lead` | Salesforce multiPageForm | 22 (4 steps) | recruitment | /nurse-portal/ (and hidden on /apply-now/) | none |
| `smart-apply` | WPBot CF68c9c06a5e697 | 17 | smartapply | /ai-recruiter/ (GoodwillBot chat, never rendered as a form) | per branch, see below |

Contact form logic, from `gf_form_conditional_logic[6]`:

- Shown when **Contact Category = Job seeker**: Job Category, Years of Experience, Current
  Province, Preferred Province, Start Date, End Date, Resume and Cover letter.
- Healthcare Category is shown when Job Category = "I need healthcare jobs".
- Specialty is shown when Healthcare Category = "Nursing and Allied Health…".
- Job title is shown when Job Category = "I need non-healthcare jobs".
- Message is shown when Contact Category = Employer **or** Agency.

SmartApply (`definitions/smart-apply.ts`) is filled in by the chat in
`src/components/smart-apply/` (conversation in `flow.ts`, spec in `docs/smart-apply-spec.md`),
which posts every answer through `submitForm` once the conversation ends. Its
conditional logic mirrors the chat's branches so only the answers on the visitor's
path are required:

- Shown when **Looking for = "I'm looking for a job."**: roles, locations, job types,
  travel, experience and certified. Wants guidance is shown when certified = NO;
  start date and Resume/CV (pdf, doc, docx, 5 MB) when certified = YES.
- Shown when **Looking for = "I'm hiring healthcare staff."**: role to fill,
  organization location and urgency.
- Email is shown when contact method = Email, Phone when it is Phone.
- The notification subject is "Notification: New Smart Apply Submission"
  (`notifySubject`), as on the live site.

## Salesforce (nurse-lead)

The form posts to `https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8&orgId=00DHu00000GOMpB`
with these hidden values:

- `oid=00DHu00000GOMpB`
- `retURL=https://goodwillstaffing.ca/`
- `lead_source=Nurse Form`

Field mapping is in `definitions/nurse-lead.ts`. It covers `first_name`, `last_name`,
`email`, `phone`, `description` and the custom fields `00NHu00001XvWYf`, `00NHu00001XvcLP`,
`00NHu00001ZeWtS`, `00NHu00001bUEld`, `00NHu00001bUEmG`, `00NHu00001XvcLy`,
`00NHu00001XvcLe`, `00NHu00001Zhx09`, `00NHu00001Zhx0E`, `00NHu00001XvcLj`,
`00NHu00001XvcLo`, `00NHu00001XvcLt`, `00NHu00001XvcQB`, `00NHu00001XvdB7`,
`00NHu00001XvdBC`, `00NHu00001Zhx0J` and `00NHu00001XvdJ7`.

How values are sent:

- **Multi-select picklists** post one entry per value. The original used `<select multiple>`;
  the new form renders these as checkbox groups.
- **The "Flexible" checkbox** posts `1`.
- **Dates** post as `YYYY-MM-DD`, the same as the original `<input type=date>`.

## Ambiguities and deviations

- **Confirmation messages**: the Gravity Forms confirmations are stored in the plugin
  settings, which were not exported, so every GF `successMessage` here is newly written.
  The nurse-lead message is the original modal text. The newsletter message is the mc4wp
  default, minus the double opt-in sentence.
- **Request Staffing email**: GF 2's "Email Address" was a plain text field. It is now
  validated as an email.
- **GF 4 and GF 6 "Full Name"**: these were name fields with only the First input
  enabled, so they are now a single `fullName` text field.
- **GF 4 "How did you hear about us?"**: the choices are provinces. This was kept as-is
  but is probably a misconfiguration.
- **GF 4 "Primary Residency"**: its first option, "Primary Residency", is now the empty
  placeholder.
- **GF 4 "Citizenship"**: this was an address field with only Country enabled. It is now
  a country select.
- **GF 5 Phone**: this was a GF "number" field. It is now a tel field.
- **GF 5 and GF 7 uploads**: the originals accepted any file type and are now limited to
  images and videos (GF 5) and images (GF 7).
- **GF 6 resume**: any type is still accepted, apart from the executable and script deny
  list.
- **GF 5 and GF 8 consent checkboxes**: these were optional in the original and still
  are. Consider making them required.
- **GF 6 date defaults**: the original pre-filled the year with 2024 for the start date
  and 2025 for the end date. That was not carried over.
- **Date dropdown years**: these are now static ranges (2026–2030) so pages can
  prerender. GF offered 1920–2027. Update `minYear` and `maxYear` yearly.
- **GF 7 Confirm Email**: this was a second email field shown by an always-true
  `contains ""` rule. It now has to match Email.
- **GF 7 hidden labels**: the two checkbox groups labelled "Untitled" had hidden labels.
  They now have screen-reader labels.
- **GF 8 Work Period**: the stray "Select Period" choice was dropped.
- **GF 9**: the province list has only nine provinces, and the CV upload was multi-file
  and optional. Both were kept.
- **Uploads**: with S3 configured, `FormClient` asks `requestUpload` for a presigned PUT per
  file (field, type and size checked against the definition), uploads straight to
  `private/tmp/`, then posts a JSON `UploadRef` in place of the File. The server re-checks
  each ref with HeadObject (real size, form/field prefix) before moving it into place. Without
  S3 the File is posted with the form as before (`serverActions.bodySizeLimit` is 4 MB; Vercel
  caps bodies at 4.5 MB) and recorded without a stored copy.
- **Spam protection**: a honeypot (`_hp_details`) plus Postgres rate limits per hashed IP
  (10 submissions per 10 minutes, 40 upload presigns per hour). No CAPTCHA.
- **Routing by category**: GF 6 messages from employers and agencies notify `staffing`
  (`notifyKeyFor` in `sink.ts`); everything else uses the definition's `notify` group.
  Recipients come from `FORM_NOTIFY_<GROUP>`, falling back to `FORM_NOTIFY_DEFAULT`.
