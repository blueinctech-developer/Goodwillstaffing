import { ResponsivePicture } from "@/components/ui/ResponsivePicture";
import styles from "./AboutHero.module.css";

// Thin pink flourishes around the portraits; each has a smaller variant
// that swaps in below 1200px.
function ArchLine({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 60 115" fill="none" aria-hidden="true" className={className}>
      <path d="M58.7603 114C30.5046 90.6694 6.85574 65.1736 1.55078 1" stroke="#F2CDCE" strokeWidth="2" />
    </svg>
  );
}

function ArchLineSmall({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 37 71" fill="none" aria-hidden="true" className={className}>
      <path d="M35.8306 69.8088C18.6249 55.6022 4.22448 40.0771 0.994141 1" stroke="#F2CDCE" strokeWidth="1.21786" />
    </svg>
  );
}

function CircleLine({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 336 88" fill="none" aria-hidden="true" className={className}>
      <path
        d="M335 1.65527C277.065 20.2263 243.979 47.6011 188.999 70.0001C131.599 93.3848 38.4934 94.5626 1 59.3396"
        stroke="#F2CDCE"
        strokeWidth="2"
      />
    </svg>
  );
}

function CircleLineSmall({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 205 54" fill="none" aria-hidden="true" className={className}>
      <path
        d="M204 0.814941C168.722 12.1234 148.575 28.7926 115.096 42.432C80.1433 56.6716 23.4489 57.3888 0.618164 35.9405"
        stroke="#F2CDCE"
        strokeWidth="1.21786"
      />
    </svg>
  );
}

export function AboutHero() {
  return (
    <header className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h1 className={styles.title}>
            <span className={styles.phrase}>We are transforming</span>{" "}
            <span className={styles.phrase}>the way</span>{" "}
            <span className={styles.phrase}>healthcare hires</span>
          </h1>
          <h2 className={styles.subtitle}>
            We built a leading platform that connects employers with top healthcare professionals across the
            country.
          </h2>
        </div>
        <div className={styles.artColumn}>
          <div className={styles.art}>
            <div className={styles.arch}>
              <ArchLine className={styles.archLine} />
              <ArchLineSmall className={styles.archLineSmall} />
              <ResponsivePicture
                name="about/client"
                ext="png"
                alt=""
                className={styles.portrait}
                width={598}
                height={826}
                breakpoints={[{ minWidth: 1200, density: "@2x" }]}
                fallback="@1x"
                loading="eager"
              />
            </div>
            <div className={styles.circle}>
              <CircleLine className={styles.circleLine} />
              <CircleLineSmall className={styles.circleLineSmall} />
              <ResponsivePicture
                name="about/nurse"
                ext="png"
                alt=""
                className={`${styles.portrait} ${styles.round}`}
                width={584}
                height={574}
                breakpoints={[{ minWidth: 1200, density: "@2x" }]}
                fallback="@1x"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
