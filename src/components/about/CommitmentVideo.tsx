import { CELEBRATES_NURSES_VIDEO } from "@/data/about";
import styles from "./CommitmentVideo.module.css";

export function CommitmentVideo() {
  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <h2 className={styles.title}>We&apos;re committed to serving those who serve others.</h2>
      </div>
      <div className={styles.videoRow}>
        <div className={styles.frame}>
          <iframe
            width="100%"
            height="100%"
            src={CELEBRATES_NURSES_VIDEO}
            title="Vivian Health Celebrates Nurses"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className={styles.iframe}
          />
        </div>
      </div>
    </section>
  );
}
