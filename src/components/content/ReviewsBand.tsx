import { GOOGLE_REVIEWS_URL, GOOGLE_WRITE_REVIEW_URL } from "@/lib/site";
import styles from "./ReviewsBand.module.css";

// Replaces the WordPress Google-reviews widget. The rating is the figure the
// widget showed on 2026-10-14; update it here when it changes.
const RATING = "4.9";
const REVIEW_COUNT = 39;

export function ReviewsBand() {
  return (
    <div className={styles.band}>
      <div>
        <p className={styles.rating}>
          {RATING} <span aria-hidden="true">★★★★★</span>
        </p>
        <p className={styles.caption}>Based on {REVIEW_COUNT} Google reviews</p>
      </div>
      <div className={styles.links}>
        <a href={GOOGLE_REVIEWS_URL} className={styles.link}>
          Read our reviews
        </a>
        <a href={GOOGLE_WRITE_REVIEW_URL} className={styles.link}>
          Leave a review
        </a>
      </div>
    </div>
  );
}
