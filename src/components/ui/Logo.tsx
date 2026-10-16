import { HAND_LEFT, HAND_RIGHT, WORDMARK, WORDMARK_RECTS } from "./logo-paths";
import styles from "./Logo.module.css";

const TEAL = "#02646F";
const ORANGE = "#E5482E";

type LogoProps = {
  className?: string;
  /**
   * "load": shake hands on mount and again on hover of the closest
   * `.logoHover` ancestor. "hover": only on hover (e.g. the footer, which is
   * off screen at load).
   */
  animated?: false | "load" | "hover";
  title?: string;
};

// The Goodwill mark as inline SVG: the teal and orange hands are separate
// groups so they can slide together and shake (see Logo.module.css).
export function Logo({ className, animated = false, title = "Goodwill Staffing & Recruitment" }: LogoProps) {
  const motion = animated === "load" ? `${styles.hover} ${styles.onLoad}` : animated === "hover" ? styles.hover : "";
  return (
    <svg
      viewBox="0 0 843 241"
      role="img"
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      className={`${styles.logo} ${motion} ${className ?? ""}`}
    >
      <g className={styles.mark}>
        <g className={styles.handLeft}>
          <path fill={TEAL} d={HAND_LEFT} />
        </g>
        <g className={styles.handRight}>
          {HAND_RIGHT.map((d) => (
            <path key={d.slice(0, 24)} fill={ORANGE} d={d} />
          ))}
        </g>
      </g>
      <g fill={TEAL}>
        {WORDMARK.map((d) => (
          <path key={d.slice(0, 24)} d={d} />
        ))}
        {WORDMARK_RECTS.map((r) => (
          <rect key={r.x} {...r} />
        ))}
      </g>
    </svg>
  );
}
