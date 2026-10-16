import { ABOUT_VIDEO } from "@/data/about";
import styles from "./CommitmentVideo.module.css";

export function CommitmentVideo() {
  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <h2 className={styles.title}>{ABOUT_VIDEO.title}</h2>
      </div>
      <div className={styles.videoRow}>
        <div className={styles.frame}>
          <iframe
            width="100%"
            height="100%"
            src={ABOUT_VIDEO.src}
            title={ABOUT_VIDEO.title}
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
