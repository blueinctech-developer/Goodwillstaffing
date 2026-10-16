import Link from "next/link";
import { ArrowIcon, MapleLeafIcon } from "@/components/icons";
import { FEATURED_ROLES } from "@/data/home";
import { JOB_BOARD_URL } from "@/lib/site";
import styles from "./FeaturedRoles.module.css";

// Two-column job cards: icon badge, bold title, outlined tag pills.
export function FeaturedRoles() {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>
        Current job opportunities
      </h2>
      <p className={styles.intro}>
        Your next healthcare assignment is a few clicks away. Explore openings for nurses, aides and healthcare
        professionals across Canada.
      </p>
      <ul className={styles.grid}>
        {FEATURED_ROLES.map((role) => (
          <li key={role.href}>
            <Link href={role.href} className={`${styles.card} focus-ring`}>
              <span className={styles.head}>
                <span className={styles.badge} aria-hidden="true">
                  <MapleLeafIcon size="1.75rem" />
                </span>
                <span className={styles.role}>{role.title}</span>
              </span>
              <span className={styles.tags}>
                <span className={styles.tag}>
                  Across Canada <small>(Travel &amp; local)</small>
                </span>
                {role.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <a href={JOB_BOARD_URL} className={styles.browse}>
        Browse all jobs <ArrowIcon size="1.125rem" />
      </a>
    </section>
  );
}
