import Link from "next/link";
import { ArrowRightIcon, EMPLOYMENT_TYPE_ICONS } from "@/components/icons";
import { EMPLOYMENT_TYPE_LABELS, browseJobsHref, type JobsByType } from "@/data/home";
import styles from "./JobTypeCard.module.css";

export function JobTypeCard({
  employmentType,
  maxPay,
  jobCount,
  className,
}: JobsByType & { className?: string }) {
  const Icon = EMPLOYMENT_TYPE_ICONS[employmentType];

  return (
    <Link href={browseJobsHref(employmentType)} className={`${styles.card} focus-ring ${className ?? ""}`}>
      <div className={styles.icon}>
        <Icon />
      </div>
      <div>
        <div className={styles.heading}>
          <span className={styles.label}>{EMPLOYMENT_TYPE_LABELS[employmentType]}</span>
          {maxPay && <span>up to {maxPay}</span>}
        </div>
        {jobCount > 0 && (
          <div className={styles.count}>
            <span>{jobCount.toLocaleString("en-US")} jobs</span>
            <ArrowRightIcon size="1.125rem" />
          </div>
        )}
      </div>
    </Link>
  );
}
