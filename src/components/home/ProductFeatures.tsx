"use client";

/* eslint-disable @next/next/no-img-element -- fixed-size WordPress uploads */
import { useId, useState, type KeyboardEvent } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/icons";
import { PRODUCT_FEATURES } from "@/data/home";
import { mediaUrl } from "@/lib/media";
import styles from "./ProductFeatures.module.css";

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path className="draw-tick" pathLength={1} d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Three audiences as tabs. Each panel reads left to right: headline and copy,
// the photo in a teal arch with a stat badge, then the button and badges.
export function ProductFeatures() {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const count = PRODUCT_FEATURES.length;

  const onTabKey = (event: KeyboardEvent) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (active + step + count) % count;
    setActive(next);
    document.getElementById(`${baseId}-tab-${next}`)?.focus();
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>
        Step into your next adventure with{" "}
        <br />
        Canada’s leading healthcare staffing agency!
      </h2>

      <div role="tablist" aria-label="Who we help" className={styles.tabs} onKeyDown={onTabKey}>
        {PRODUCT_FEATURES.map((feature, i) => (
          <button
            key={feature.audience}
            id={`${baseId}-tab-${i}`}
            type="button"
            role="tab"
            aria-selected={active === i}
            aria-controls={`${baseId}-panel-${i}`}
            tabIndex={active === i ? 0 : -1}
            className={styles.tab}
            onClick={() => setActive(i)}
          >
            {feature.audience}
          </button>
        ))}
      </div>

      {PRODUCT_FEATURES.map((feature, i) => (
        <div
          key={feature.audience}
          id={`${baseId}-panel-${i}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${i}`}
          hidden={active !== i}
          className={styles.panel}
        >
          <div className={styles.copy}>
            <h3 className={styles.headline}>
              {feature.title} <span className={styles.accent}>{feature.accent}</span>
            </h3>
            <p className={styles.description}>{feature.description}</p>
          </div>

          <div className={styles.visual}>
            <div className={styles.arch} aria-hidden="true" />
            <img src={mediaUrl(feature.image)} alt="" className={styles.photo} width={531} height={531} />
            <div className={styles.stat}>
              <span className={styles.statValue}>{feature.stat.value}</span>
              <span className={styles.statLabel}>{feature.stat.label}</span>
            </div>
          </div>

          <div className={styles.actions}>
            <ButtonLink href={feature.cta.href} tall variant="secondary" className={styles.cta}>
              {feature.cta.text} <ArrowIcon size="1.125rem" />
            </ButtonLink>
            <ul className={styles.badges}>
              {feature.badges.map((badge) => (
                <li key={badge} className={styles.badge}>
                  <span className={styles.check}>
                    <CheckIcon />
                  </span>
                  {badge}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </section>
  );
}
