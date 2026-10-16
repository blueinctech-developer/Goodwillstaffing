import { VALUE_CARDS } from "@/data/about";
import styles from "./ValueCards.module.css";

export function ValueCards() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>Canada&rsquo;s choice for top-tier healthcare staffing.</h2>
        <div className={styles.listWrap}>
          <ul className={styles.list}>
            {VALUE_CARDS.map((card) => (
              <li key={card.title} className={styles.card}>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <p className={styles.cardText}>{card.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
