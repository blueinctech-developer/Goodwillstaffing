import { SECTION_ICONS } from "@/components/icons";
import { STATS } from "@/data/home";
import styles from "./StatsBar.module.css";

export function StatsBar() {
  return (
    <section className={styles.section} aria-label="Goodwill at a glance">
      <dl className={styles.list}>
        {STATS.map((stat) => {
          const Icon = SECTION_ICONS[stat.icon];
          return (
            <div key={stat.label} className={styles.stat}>
              <Icon />
              <div>
                <dt className={styles.label}>{stat.label}</dt>
                <dd className={styles.value}>{stat.value}</dd>
              </div>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
