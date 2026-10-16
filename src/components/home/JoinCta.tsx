import { ButtonLink } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/icons";
import { CTA_BAND } from "@/data/home";
import { mediaUrl } from "@/lib/media";
import { APPLY_PATH, TALENT_POOL_PATH } from "@/lib/site";
import styles from "./JoinCta.module.css";

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
      <path className="draw-tick" pathLength={1} d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Full-bleed landscape: copy, buttons and checklist on the left over a teal
// wash; the nurse on the right stays clear of any overlay.
export function JoinCta() {
  return (
    <section className={styles.section} style={{ backgroundImage: `url(${mediaUrl(CTA_BAND.image)})` }}>
      <div className={styles.copy}>
        <h2 className={styles.title}>{CTA_BAND.title}</h2>
        <p className={styles.text}>{CTA_BAND.description}</p>
        <div className={styles.actions}>
          <ButtonLink href={TALENT_POOL_PATH} variant="secondary" tall lightFocus>
            Join our talent pool <ArrowIcon size="1.125rem" className={styles.arrow} />
          </ButtonLink>
          <ButtonLink href={APPLY_PATH} variant="light" tall lightFocus>
            Apply now <ArrowIcon size="1.125rem" className={styles.arrow} />
          </ButtonLink>
        </div>
        <ul className={styles.points}>
          {CTA_BAND.points.map((point) => (
            <li key={point}>
              <span className={styles.check}>
                <CheckIcon />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
