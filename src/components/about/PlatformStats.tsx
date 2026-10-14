import { PLATFORM_STATS } from "@/data/about";
import styles from "./PlatformStats.module.css";

export function PlatformStats() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>A healthcare hiring platform that&apos;s changing everything</h2>
        <div className={styles.listWrap}>
          <ul className={styles.list}>
            {PLATFORM_STATS.map((stat) => (
              <li key={stat.value} className={styles.stat}>
                <div className={styles.value}>{stat.value}</div>
                <div className={styles.label}>{stat.label}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
