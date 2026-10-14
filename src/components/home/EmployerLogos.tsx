import { LogoMarquee } from "@/components/ui/LogoMarquee";
import { EMPLOYER_LOGOS } from "@/data/home";
import styles from "./EmployerLogos.module.css";

export function EmployerLogos() {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>
        Connect with top
        <br />
        healthcare employers and recruiters
      </h2>
      <LogoMarquee logos={EMPLOYER_LOGOS} />
    </section>
  );
}
