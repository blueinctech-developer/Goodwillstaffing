"use client";

import { useRef, useState, type CSSProperties, type TouchEvent } from "react";
import { CircleArrowLeft, CircleArrowRight } from "@/components/icons";
import { ResponsivePicture } from "@/components/ui/ResponsivePicture";
import { TESTIMONIALS } from "@/data/home";
import styles from "./Testimonials.module.css";

const COUNT = TESTIMONIALS.length;

// Inactive slides stay in the DOM, absolutely positioned on top of the active
// one, so the swap is a 500ms crossfade with no layout shift.
const slideStyle = (isActive: boolean): CSSProperties => ({
  position: isActive ? "static" : "absolute",
  opacity: isActive ? 1 : 0,
  transition: "opacity 500ms ease",
});

export function Testimonials() {
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
    <section className={styles.section} aria-roledescription="carousel" aria-label="Clinician testimonials">
      <h2 className={styles.title}>Your one-stop shop for healthcare jobs that fit your lifestyle</h2>
      <div
        className={styles.layout}
        onTouchStart={(event) => (touchStartX.current = event.touches[0].clientX)}
        onTouchMove={onTouchMove}
      >
        {TESTIMONIALS.map((t, i) => (
          <div key={t.name} style={slideStyle(active === i)} aria-hidden={active !== i}>
            <ResponsivePicture
              name={t.image}
              alt={t.name}
              className={styles.photo}
              width={1602}
              height={2397}
              breakpoints={[
                { minWidth: 1024, density: "@3x" },
                { minWidth: 768, density: "@2x" },
              ]}
              fallback="@2x"
            />
          </div>
        ))}

        <div className={styles.content}>
          {TESTIMONIALS.map((t, i) => (
            <blockquote key={t.name} className={styles.quoteSlot} style={slideStyle(active === i)} aria-hidden={active !== i}>
              <p className={styles.quote}>{t.quote}</p>
            </blockquote>
          ))}
          <div className={styles.footer}>
            <div className={styles.attributionSlot}>
              {TESTIMONIALS.map((t, i) => (
                <div key={t.name} style={slideStyle(active === i)} aria-hidden={active !== i}>
                  <p className={styles.attribution}>
                    <span className={styles.name}>{t.name}</span>
                    <br />
                    {t.title}
                  </p>
                </div>
              ))}
            </div>
            <div className={styles.arrows}>
              <button type="button" aria-label="Previous" className={styles.arrow} onClick={prev}>
                <CircleArrowLeft />
              </button>
              <button type="button" aria-label="Next" className={styles.arrow} onClick={next}>
                <CircleArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
