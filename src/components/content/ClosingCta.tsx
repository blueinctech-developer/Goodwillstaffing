import { ButtonLink } from "@/components/ui/Button";
import { APPLY_PATH, CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_HREF, REQUEST_STAFFING_PATH } from "@/lib/site";
import styles from "./ClosingCta.module.css";

// The "Do you need healthcare staff or healthcare jobs?" sign-off that ends
// most Goodwill pages.
export function ClosingCta() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>Do you need healthcare staff or healthcare jobs?</h2>
        <p className={styles.text}>
          Talk to us. We respond within one business day — call{" "}
          <a href={CONTACT_PHONE_HREF}>{CONTACT_PHONE}</a> or email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
        <div className={styles.ctas}>
          <ButtonLink href={REQUEST_STAFFING_PATH} tall variant="secondary" lightFocus>
            Request staffing
          </ButtonLink>
          <ButtonLink href={APPLY_PATH} tall variant="light" lightFocus>
            Apply now
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
