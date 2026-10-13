/* eslint-disable @next/next/no-img-element -- press logo vectors */
import { PRESS_LOGOS } from "@/data/home";
import styles from "./AsSeenOn.module.css";

export function AsSeenOn() {
  return (
    <section className={styles.section}>
      <svg
        className={styles.wave}
        width="1289"
        height="370"
        viewBox="0 0 1289 370"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M39.7956 378.548C50.271 328.828 69.2659 280.091 101.306 240.446C133.36 200.802 179.403 170.884 230.388 164.288C288.508 156.769 345.787 179.214 401.466 197.557C457.146 215.899 519.265 230.228 573.125 207.529C629.476 183.773 664.687 124.144 722.164 103.163C782.601 81.1005 849.477 107.637 906.885 136.897C964.293 166.157 1025.23 199.667 1089.17 191.481C1136.75 185.389 1179.31 155.663 1206.36 116.58C1233.4 77.4973 1245.94 29.8475 1248.26 -17.5225"
          stroke="#FBF9F6"
          strokeWidth="80"
        />
      </svg>
      <h2 className={styles.title}>As seen on</h2>
      <div className={styles.logos}>
        {PRESS_LOGOS.map((logo) => (
          <img key={logo.alt} src={logo.src} alt={logo.alt} className={styles.logo} loading="lazy" />
        ))}
      </div>
    </section>
  );
}
