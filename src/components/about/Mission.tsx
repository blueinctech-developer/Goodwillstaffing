import styles from "./Mission.module.css";

export function Mission() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.eyebrow}>Our Mission</h2>
        <p className={styles.statement}>
          Vivian&apos;s mission is to empower every healthcare professional to find their perfect job opportunity,
          faster and easier than ever before.
        </p>
      </div>
    </section>
  );
}
