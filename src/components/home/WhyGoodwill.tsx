/* eslint-disable @next/next/no-img-element -- fixed-size WordPress upload */
import { ButtonLink } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/icons";
import { WHY_GOODWILL } from "@/data/home";
import { mediaUrl } from "@/lib/media";
import { ABOUT_PATH, REQUEST_STAFFING_PATH } from "@/lib/site";
import styles from "./WhyGoodwill.module.css";

export function WhyGoodwill() {
  return (
    <section className={styles.section}>
      <div className={styles.media}>
        <img src={mediaUrl(WHY_GOODWILL.image)} alt="" className={styles.photo} loading="lazy" />
      </div>
      <div className={styles.copy}>
        <h2 className={styles.title}>
          {WHY_GOODWILL.title} <span className={styles.accent}>{WHY_GOODWILL.accent}</span>
        </h2>
        <p className={styles.text}>{WHY_GOODWILL.description}</p>
        <div className={styles.actions}>
          <ButtonLink href={REQUEST_STAFFING_PATH} tall variant="secondary" className={styles.button}>
            Request staffing <ArrowIcon size="1.125rem" />
          </ButtonLink>
          <ButtonLink href={ABOUT_PATH} tall variant="light" className={`${styles.button} ${styles.outline}`}>
            About Goodwill <ArrowIcon size="1.125rem" />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
