/* eslint-disable @next/next/no-img-element -- WordPress upload served from the media bucket */
import { ChevronRightIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/Button";
import { ABOUT_IMAGES, CONNECTING_PARAGRAPHS } from "@/data/about";
import { mediaUrl } from "@/lib/media";
import { CONTACT_PATH } from "@/lib/site";
import styles from "./ConnectingTalent.module.css";

export function ConnectingTalent() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <img
          src={mediaUrl(ABOUT_IMAGES.connecting.src)}
          alt="Goodwill recruiters working at their laptops"
          className={styles.photo}
          width={ABOUT_IMAGES.connecting.width}
          height={ABOUT_IMAGES.connecting.height}
          loading="lazy"
        />
        <div className={styles.copy}>
          <h2 className={styles.title}>Connecting Healthcare Providers with Top-Tier Talent</h2>
          {CONNECTING_PARAGRAPHS.map((text) => (
            <p key={text} className={styles.text}>
              {text}
            </p>
          ))}
          <div className={styles.action}>
            <ButtonLink href={CONTACT_PATH} variant="primary" className={styles.button}>
              <span>Contact us</span>
              <ChevronRightIcon size="1.5rem" className={styles.chevron} />
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
