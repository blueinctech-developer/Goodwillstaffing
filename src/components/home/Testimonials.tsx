"use client";

/* eslint-disable @next/next/no-img-element -- 120px Google profile pictures */
import { useState } from "react";
import { ArrowIcon, StarIcon } from "@/components/icons";
import { TESTIMONIALS } from "@/data/home";
import { mediaUrl } from "@/lib/media";
import { GOOGLE_REVIEWS_URL, GOOGLE_WRITE_REVIEW_URL } from "@/lib/site";
import { Watermark } from "@/components/ui/Watermark";
import styles from "./Testimonials.module.css";

const COUNT = TESTIMONIALS.length;
const VISIBLE = 3;

// Always one large feature card followed by two smaller ones. The arrows
// rotate the list, so whichever review is next always takes the feature slot.
export function Testimonials() {
  const [active, setActive] = useState(0);
  const step = (direction: 1 | -1) => setActive((i) => (i + direction + COUNT) % COUNT);
  const shown = Array.from({ length: VISIBLE }, (_, offset) => TESTIMONIALS[(active + offset) % COUNT]);

  return (
    <section className={styles.section} aria-label="Google reviews" aria-roledescription="carousel">
      <Watermark shape="leaf" position="top-right" />
      <div className={styles.header}>
        <h2 className={styles.title}>
          Hear from the people{" "}
          <br />
          who make it all possible.
        </h2>
        <div className={styles.arrows}>
          <button type="button" aria-label="Previous review" className={styles.prev} onClick={() => step(-1)}>
            <ArrowIcon size="1.25rem" className={styles.flip} />
          </button>
          <button type="button" aria-label="Next review" className={styles.next} onClick={() => step(1)}>
            <ArrowIcon size="1.25rem" />
          </button>
        </div>
      </div>

      {/* Keyed on the active index so each step replays the entrance animation. */}
      <ul key={active} className={styles.track} aria-live="polite">
        {shown.map((t, slot) => (
          <li key={t.name} className={`${styles.card} ${slot === 0 ? styles.featured : ""}`}>
            <img src={mediaUrl(t.photo)} alt="" className={styles.photo} width={120} height={120} />
            <figure className={styles.body}>
              <span className={styles.quoteMark} aria-hidden="true">
                “
              </span>
              <blockquote className={styles.quote}>{t.quote}</blockquote>
              <figcaption className={styles.footer}>
                <span className={styles.person}>
                  <a href={t.profile} className={styles.name} target="_blank" rel="noopener noreferrer">
                    {t.name}
                  </a>
                  <span className={styles.source}>Google review</span>
                </span>
                <span className={styles.stars} role="img" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }, (_, star) => (
                    <StarIcon key={star} size="1rem" />
                  ))}
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <div className={styles.googleLinks}>
        <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer">
          See all reviews on Google <ArrowIcon size="1rem" />
        </a>
        <a href={GOOGLE_WRITE_REVIEW_URL} target="_blank" rel="noopener noreferrer">
          Review us on Google <ArrowIcon size="1rem" />
        </a>
      </div>
    </section>
  );
}
