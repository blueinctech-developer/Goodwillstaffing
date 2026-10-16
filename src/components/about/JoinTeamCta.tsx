/* eslint-disable @next/next/no-img-element -- WordPress upload served from the media bucket */
import { ChevronRightIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/Button";
import { ABOUT_IMAGES } from "@/data/about";
import { mediaUrl } from "@/lib/media";
import { APPLY_PATH, REQUEST_STAFFING_PATH } from "@/lib/site";
import styles from "./JoinTeamCta.module.css";

function Wave({ className, viewBox, d }: { className: string; viewBox: string; d: string }) {
  return (
    <svg viewBox={viewBox} fill="none" aria-hidden="true" className={className}>
      <path d={d} stroke="#F2CDCE" strokeWidth="2" strokeMiterlimit="10" />
    </svg>
  );
}

const WAVE_PATH =
  "M1.79906 566.195C-7.136 378.829 164.147 445.666 235.225 387.341C334.271 305.99 214.133 154.658 340.82 88.6859C475.946 18.3347 601.462 139.65 727.486 0.999941";

export function JoinTeamCta() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.copyColumn}>
          <div className={styles.copy}>
            <h2 className={styles.title}>Start Building Your Dream Healthcare Team Today</h2>
            <p className={styles.body}>
              Whether you&apos;re a talented healthcare professional looking for new opportunities or recruiter
              seeking top candidates, we invite you to connect with us.
            </p>
            <div className={styles.action}>
              <ButtonLink href={REQUEST_STAFFING_PATH} variant="secondary" lightFocus className={styles.button}>
                <span>Hire Talents</span>
                <ChevronRightIcon size="1.5rem" className={styles.chevron} />
              </ButtonLink>
              <ButtonLink href={APPLY_PATH} variant="light" lightFocus className={styles.button}>
                <span>Apply now</span>
                <ChevronRightIcon size="1.5rem" className={styles.chevron} />
              </ButtonLink>
            </div>
          </div>
        </div>
        <div className={styles.photoColumn}>
          <img
            src={mediaUrl(ABOUT_IMAGES.join.src)}
            alt="Smiling nurse with a stethoscope in a hospital corridor"
            className={styles.photo}
            width={ABOUT_IMAGES.join.width}
            height={ABOUT_IMAGES.join.height}
            loading="lazy"
          />
          <Wave className={styles.wave} viewBox="0 0 579 481" d={WAVE_PATH} />
          <Wave className={styles.waveMobile} viewBox="0 0 729 567" d={WAVE_PATH} />
        </div>
      </div>
    </section>
  );
}
