/* eslint-disable @next/next/no-img-element -- logo strip needs intrinsic sizing */
import { EMPLOYER_LOGOS } from "@/data/home";
import styles from "./EmployerLogos.module.css";

// Desktop: one row of every logo. Mobile: the logos split across two rows
// that scroll in opposite directions. Each track repeats its logos twice and
// moves by half its width, so the loop is seamless.
function Track({ reverse = false }: { reverse?: boolean }) {
  const logos = [...EMPLOYER_LOGOS, ...EMPLOYER_LOGOS];
  return (
    <div className={`${styles.track} ${reverse ? styles.reverse : ""}`} aria-hidden={reverse}>
      {logos.map((logo, i) => (
        <img
          key={`${logo.alt}-${i}`}
          src={logo.src}
          alt={i < EMPLOYER_LOGOS.length && !reverse ? logo.alt : ""}
          className={`${styles.logo} ${logo.mobileRow === 1 ? styles.mobileRowOne : styles.mobileRowTwo}`}
        />
      ))}
    </div>
  );
}

export function EmployerLogos() {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>
        Connect with top
        <br />
        healthcare employers and recruiters
      </h2>
      <div className={styles.viewport}>
        <Track />
        <Track reverse />
      </div>
    </section>
  );
}
