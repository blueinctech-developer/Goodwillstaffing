import { getForm } from "@/forms";
import { Form } from "./FormClient";

export { Form };

/**
 * Drop-in for content blocks: `{ type: "form", formId: 6 }` -> <FormBlock formId={6} />.
 * Accepts a Gravity Forms number, a form slug ("contact") or a legacy id
 * ("mc4wp:996027"). Resolving here keeps the definitions out of the client
 * bundle; only the one form's definition is serialized to the browser.
 */
export function FormBlock({ formId }: { formId: number | string }) {
  const definition = getForm(formId);
  if (!definition) {
    if (process.env.NODE_ENV !== "production") console.warn(`[forms] Unknown form id: ${formId}`);
    return null;
  }
  return <Form definition={definition} />;
}
