"use client";

import { useEffect, useRef, useState, type TouchEvent } from "react";
import type { AnimationItem } from "lottie-web";
import { ButtonLink } from "@/components/ui/Button";
import { ThinChevronLeft, ThinChevronRight } from "@/components/icons";
import { PRODUCT_FEATURES } from "@/data/home";
import { REGISTER_PATH } from "@/lib/site";
import { useMediaQuery } from "@/lib/useMediaQuery";
import styles from "./ProductFeatures.module.css";

const COUNT = PRODUCT_FEATURES.length;
const indicatorTop = (index: number) => `${(index * 100) / COUNT}%`;

// Each feature plays a one-shot Lottie animation; the static screenshot shows
// until the animation has loaded, and on devices that prefer reduced motion.
function FeatureAnimation({ index, isMobile }: { index: number; isMobile: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const variant = isMobile ? "mobile" : "desktop";
  const key = `${variant}-${index + 1}`;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let animation: AnimationItem | undefined;
    let cancelled = false;

    (async () => {
      const [{ default: lottie }, data] = await Promise.all([
        import("lottie-web/build/player/lottie_light"),
        fetch(`/lottie/product-feature-${key}.json`).then((res) => res.json()),
      ]);
      if (cancelled || !containerRef.current) return;
      animation = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: false,
        autoplay: true,
        animationData: data,
      });
      setLoadedKey(key);
    })().catch(() => {
      // Keep the static fallback if the animation can't load.
    });

    return () => {
      cancelled = true;
      animation?.destroy();
    };
  }, [key]);

  const n = index + 1;
  const showAnimation = loadedKey === key;

  return (
    <>
      <div ref={containerRef} className={styles.animation} hidden={!showAnimation} />
      {!showAnimation && (
        <picture>
          <source media="(min-width: 1024px)" srcSet={`/images/Static-Product-Desktop-${n}.webp`} type="image/webp" />
          <source media="(min-width: 1024px)" srcSet={`/images/Static-Product-Desktop-${n}.jpg`} type="image/jpeg" />
          <source srcSet={`/images/Static-Product-Mobile-${n}.webp`} type="image/webp" />
          <img
            src={`/images/Static-Product-Mobile-${n}.jpg`}
            alt=""
            className={styles.staticImage}
            width={2445}
            height={2064}
          />
        </picture>
      )}
    </>
  );
}

export function ProductFeatures() {
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
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
    <section className={styles.section}>
      <h2 className={styles.title}>Vivian empowers you to land the job and pay you deserve</h2>
      <div
        className={styles.layout}
        onTouchStart={(event) => (touchStartX.current = event.touches[0].clientX)}
        onTouchMove={onTouchMove}
      >
        {isMobile ? (
          <div className={styles.mobileCaption}>
            <div className={styles.mobileControls}>
              <button type="button" aria-label="Previous" className={styles.mobileArrow} onClick={prev}>
                <ThinChevronLeft />
              </button>
              <div className={styles.dots}>
                {PRODUCT_FEATURES.map((feature, i) => (
                  <button
                    key={feature.title}
                    type="button"
                    aria-label={`Show ${feature.title}`}
                    aria-current={active === i}
                    className={styles.dotButton}
                    onClick={() => setActive(i)}
                  >
                    <span className={`${styles.dot} ${active === i ? styles.dotActive : ""}`} />
                  </button>
                ))}
              </div>
              <button type="button" aria-label="Next" className={styles.mobileArrow} onClick={next}>
                <ThinChevronRight />
              </button>
            </div>
            <span className={styles.mobileTitle}>{PRODUCT_FEATURES[active].title}</span>
            <span className={styles.mobileDescription}>{PRODUCT_FEATURES[active].description}</span>
          </div>
        ) : (
          <div className={styles.featureList}>
            <div className={styles.rail} aria-hidden="true">
              <div className={styles.railTrack} />
              {hovered !== null && (
                <div className={styles.railHover} style={{ top: indicatorTop(hovered) }} />
              )}
              <div className={styles.railActive} style={{ top: indicatorTop(active) }} />
            </div>
            <div className={styles.features}>
              {PRODUCT_FEATURES.map((feature, i) => (
                <button
                  key={feature.title}
                  type="button"
                  className={`${styles.feature} ${active === i ? styles.featureActive : ""}`}
                  aria-pressed={active === i}
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <span className={styles.featureTitle}>{feature.title}</span>
                  <span className={styles.featureDescription}>{feature.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={styles.stage}>
          {!isMobile && (
            <button type="button" aria-label="Previous" className={`${styles.stageArrow} ${styles.stagePrev}`} onClick={prev}>
              <ThinChevronLeft />
            </button>
          )}
          <FeatureAnimation index={active} isMobile={isMobile} />
          {!isMobile && (
            <button type="button" aria-label="Next" className={`${styles.stageArrow} ${styles.stageNext}`} onClick={next}>
              <ThinChevronRight />
            </button>
          )}
        </div>
      </div>
      <ButtonLink href={REGISTER_PATH} tall className={styles.cta}>
        Join Vivian
      </ButtonLink>
    </section>
  );
}
