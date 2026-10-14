"use client";

import { useRef, useState, type TouchEvent } from "react";
import { ResponsivePicture } from "@/components/ui/ResponsivePicture";
import { TEAM_TESTIMONIALS } from "@/data/about";
import styles from "./TeamTestimonials.module.css";

const COUNT = TEAM_TESTIMONIALS.length;

function QuoteMark() {
  return (
    <svg width="59" height="46" viewBox="0 0 59 46" fill="none" aria-hidden="true" className={styles.quoteMark}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.4737 20.4526H25.4632V44.0316H1V20.4526L11.3158 1H24.5789L16.4737 20.4526ZM17.9737 19.4526H26.4632V45.0316H0V20.2039L10.7142 0H26.0789L17.9737 19.4526ZM58.2053 0L50.1 19.4526H58.5895V45.0316H32.1263V20.2039L42.8405 0H58.2053ZM48.6 20.4526L56.7053 1H43.4421L33.1263 20.4526V44.0316H57.5895V20.4526H48.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Arrow({ direction }: { direction: "previous" | "next" }) {
  return (
    <svg viewBox="0 0 23 43" fill="none" width="23" height="43" aria-hidden="true">
      <path
        d={direction === "previous" ? "M22.5 42L2 21.5L22.5 1" : "M1 1L21.5 21.5L1 42"}
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function TeamTestimonials() {
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const prev = () => setActive((i) => (i - 1 + COUNT) % COUNT);
  const next = () => setActive((i) => (i + 1) % COUNT);

  const onTouchMove = (event: TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - event.touches[0].clientX;
    if (delta > 5) next();
    if (delta < -5) prev();
    touchStartX.current = null;
  };

  return (
    <section className={styles.section} aria-roledescription="carousel" aria-label="What people say about Vivian">
      <div className={styles.frame}>
        <div
          className={styles.viewport}
          onTouchStart={(event) => (touchStartX.current = event.touches[0].clientX)}
          onTouchMove={onTouchMove}
        >
          <div className={styles.track}>
            {TEAM_TESTIMONIALS.map((t, i) => (
              <div
                key={t.name}
                className={styles.slide}
                aria-hidden={active !== i}
                inert={active !== i}
                style={{ opacity: active === i ? 1 : 0, transform: `translateX(${-active * 100}%)` }}
              >
                <div className={styles.slideInner}>
                  <ResponsivePicture
                    name={t.image}
                    alt={t.name}
                    className={styles.photo}
                    width={948}
                    height={948}
                    breakpoints={[{ minWidth: 768, density: "@2x" }]}
                    fallback="@1x"
                  />
                  <figure className={styles.figure}>
                    {/* Inline SVG in a div, as on the original; its line box adds the spacing. */}
                    <div className={styles.quoteMarkWrap}>
                      <QuoteMark />
                    </div>
                    <blockquote className={styles.blockquote}>
                      <p className={styles.quote}>{t.quote}</p>
                    </blockquote>
                    <figcaption className={styles.caption}>
                      <span className={styles.name}>{t.name}</span> {t.role}
                    </figcaption>
                  </figure>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={`${styles.control} ${styles.controlPrev}`}>
          <button type="button" className={styles.arrow} aria-label="Previous" onClick={prev}>
            <Arrow direction="previous" />
          </button>
        </div>
        <div className={`${styles.control} ${styles.controlNext}`}>
          <button type="button" className={styles.arrow} aria-label="Next" onClick={next}>
            <Arrow direction="next" />
          </button>
        </div>
      </div>
    </section>
  );
}
