/* eslint-disable @next/next/no-img-element -- logo strip needs intrinsic sizing */
import styles from "./LogoMarquee.module.css";

export type MarqueeLogo = { src: string; alt: string };

// Mirrors vivian.com's logo marquee. Desktop: one row of every logo. Mobile:
// two rows scrolling in opposite directions; the first half of the logos goes
// on the second row, the rest on the first. Each track repeats its logos
// twice and slides by half its width, so the loop is seamless. Short sets are
// spread across 200vw so they still fill the screen.
function Track({ logos, reverse = false }: { logos: MarqueeLogo[]; reverse?: boolean }) {
  const half = Math.ceil(logos.length / 2);
  const doubled = [...logos, ...logos];
  return (
    <div className={`${styles.track} ${reverse ? styles.reverse : ""}`} aria-hidden={reverse}>
      {doubled.map((logo, i) => {
        const index = i % logos.length;
        return (
          <img
            key={`${logo.alt}-${i}`}
            src={logo.src}
            alt={i < logos.length && !reverse ? logo.alt : ""}
            className={`${styles.logo} ${index < half ? styles.mobileRowTwo : styles.mobileRowOne}`}
          />
        );
      })}
    </div>
  );
}

export function LogoMarquee({ logos }: { logos: MarqueeLogo[] }) {
  return (
    <div className={styles.viewport}>
      <Track logos={logos} />
      <Track logos={logos} reverse />
    </div>
  );
}
