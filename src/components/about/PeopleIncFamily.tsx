/* eslint-disable @next/next/no-img-element -- static brand logo */
import { LogoMarquee } from "@/components/ui/LogoMarquee";
import { PEOPLE_INC_BRANDS } from "@/data/about";
import styles from "./PeopleIncFamily.module.css";

export function PeopleIncFamily() {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Proudly part of the People Incorporated family</h2>
      <img
        src="/images/about/people-incorporated-logo-black.png"
        alt="People Incorporated"
        className={styles.logo}
        width={3016}
        height={1016}
        loading="lazy"
      />
      <div className={styles.strip}>
        <LogoMarquee logos={PEOPLE_INC_BRANDS} />
      </div>
      <p className={styles.body}>
        As a member of the People Incorporated family, Vivian benefits from the expertise and guidance of one of the
        world&apos;s leading technology holding companies.
      </p>
    </section>
  );
}
