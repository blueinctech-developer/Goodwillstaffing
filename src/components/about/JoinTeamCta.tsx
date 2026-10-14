import { ChevronRightIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/Button";
import { ResponsivePicture } from "@/components/ui/ResponsivePicture";
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
            Join us as we transform healthcare hiring — one job at a time.
            <div className={styles.action}>
              <ButtonLink href="/careers/" variant="secondary" lightFocus className={styles.button}>
                <span>Join the team</span>
                <ChevronRightIcon size="1.5rem" className={styles.chevron} />
              </ButtonLink>
            </div>
          </div>
        </div>
        <div className={styles.photoColumn}>
          <ResponsivePicture
            name="about/join"
            alt="Finding a job with Vivian Health"
            className={styles.photo}
            width={948}
            height={948}
            breakpoints={[{ minWidth: 768, density: "@2x" }]}
            fallback="@1x"
          />
          <Wave className={styles.wave} viewBox="0 0 579 481" d={WAVE_PATH} />
          <Wave className={styles.waveMobile} viewBox="0 0 729 567" d={WAVE_PATH} />
        </div>
      </div>
    </section>
  );
}
