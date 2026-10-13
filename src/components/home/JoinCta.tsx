import { ButtonLink } from "@/components/ui/Button";
import { ResponsivePicture } from "@/components/ui/ResponsivePicture";
import { REGISTER_PATH } from "@/lib/site";
import styles from "./JoinCta.module.css";

export function JoinCta() {
  return (
    <section className={styles.section}>
      <div className={styles.copy}>
        <h2 className={styles.title}>
          Join over <span className={styles.italic}>3 million</span> clinicians on Vivian
        </h2>
        <div>
          <ButtonLink href={REGISTER_PATH} variant="secondary" tall lightFocus className={styles.cta}>
            Join Vivian
          </ButtonLink>
        </div>
      </div>
      <div className={styles.photos}>
        <div className={styles.group}>
          <ResponsivePicture
            name="Vivian_LifestyleFinal_Group"
            alt="A group of smiling nurses."
            className={styles.groupImage}
            width={1906}
            height={1270}
            breakpoints={[
              { minWidth: 1024, density: "@3x" },
              { minWidth: 768, density: "@2x" },
            ]}
            fallback="@2x"
          />
        </div>
        <div className={styles.single}>
          <ResponsivePicture
            name="Vivian_LifestyleFinal"
            alt="A smiling nurse."
            className={styles.singleImage}
            width={783}
            height={1170}
            breakpoints={[
              { minWidth: 1024, density: "@3x" },
              { minWidth: 480, density: "@2x" },
            ]}
            fallback="@2x"
          />
        </div>
      </div>
    </section>
  );
}
