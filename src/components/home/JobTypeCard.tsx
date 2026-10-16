import Link from "next/link";
import { ArrowIcon, EMPLOYMENT_TYPE_ICONS } from "@/components/icons";
import type { JobType } from "@/data/home";
import styles from "./JobTypeCard.module.css";

export function JobTypeCard({
  employmentType,
  label,
  description,
  href,
  className,
}: JobType & { className?: string }) {
  return (
    <Link href={href} className={`${styles.card} focus-ring ${className ?? ""}`}>
      <div className={styles.icon}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static vector icon; it animates its own trace */}
        <img src={EMPLOYMENT_TYPE_ICONS[employmentType]} alt="" width={56} height={56} className={styles.iconImage} />
      </div>
      <div>
        <div className={styles.heading}>
          <span className={styles.label}>{label}</span>
          <span>{description}</span>
        </div>
        <div className={styles.count}>
          <span>Explore</span>
          <ArrowIcon size="1.125rem" />
        </div>
      </div>
    </Link>
  );
}
