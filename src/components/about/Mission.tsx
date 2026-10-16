import styles from "./Mission.module.css";

export function Mission() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.eyebrow}>At Goodwill Staffing &amp; Recruitment</h2>
        <p className={styles.statement}>
          Goodwill Staffing partners with healthcare institutions across Canada, to provide the right professionals
          for quality care.
        </p>
      </div>
    </section>
  );
}
