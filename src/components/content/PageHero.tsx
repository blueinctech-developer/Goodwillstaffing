import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/icons";
import type { Page } from "@/lib/content";
import { mediaUrl } from "@/lib/media";
import styles from "./PageHero.module.css";

type Hero = Page["hero"];

// The three hero treatments used across goodwillstaffing.ca's inner pages:
// a photo behind centred copy (province and role pages), copy beside a photo
// (solutions and job-board pages) and a plain teal band (forms, policies).

function Breadcrumbs({ items, light }: { items: Hero["breadcrumbs"]; light?: boolean }) {
  if (!items?.length) return null;
  return (
    <nav aria-label="Breadcrumb" className={`${styles.crumbs} ${light ? styles.crumbsLight : ""}`}>
      <ol>
        <li>
          <Link href="/" aria-label="Home">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={`${item.text}-${i}`}>
            {item.href && i < items.length - 1 ? (
              <Link href={item.href}>{item.text}</Link>
            ) : (
              <span aria-current={i === items.length - 1 ? "page" : undefined}>{item.text}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function Ctas({ ctas, onDark }: { ctas: Hero["ctas"]; onDark: boolean }) {
  if (!ctas.length) return null;
  return (
    <div className={styles.ctas}>
      {ctas.map((cta, i) => (
        <ButtonLink
          key={cta.href + cta.text}
          href={cta.href}
          tall
          // Goodwill's hero CTAs are orange pills on photos and teal on light panels.
          variant={onDark || i ? "secondary" : "primary"}
          lightFocus={onDark}
          className={styles.pill}
        >
          {cta.text} <ArrowIcon size="1.125rem" />
        </ButtonLink>
      ))}
    </div>
  );
}

export function PageHero({ hero }: { hero: Hero }) {
  const image = hero.image;
  const layout = image ? hero.layout : "plain";

  if (layout === "cover" && image) {
    return (
      <section className={styles.cover} style={{ backgroundImage: `url("${mediaUrl(image.src)}")` }}>
        <div className={styles.coverInner}>
          <Breadcrumbs items={hero.breadcrumbs} light />
          {hero.eyebrow && <p className={styles.eyebrowLight}>{hero.eyebrow}</p>}
          <h1 className={styles.coverTitle}>{hero.title}</h1>
          {hero.subtitle && <p className={styles.coverSubtitle}>{hero.subtitle}</p>}
          <Ctas ctas={hero.ctas} onDark />
        </div>
      </section>
    );
  }

  if (layout === "split" && image) {
    return (
      <section className={styles.split}>
        <div className={styles.splitCopy}>
          <div className={styles.splitCopyInner}>
            <Breadcrumbs items={hero.breadcrumbs} />
            {hero.eyebrow && <p className={styles.eyebrow}>{hero.eyebrow}</p>}
            <h1 className={styles.splitTitle}>{hero.title}</h1>
            {hero.subtitle && <p className={styles.splitSubtitle}>{hero.subtitle}</p>}
            <Ctas ctas={hero.ctas} onDark={false} />
          </div>
        </div>
        <div className={styles.splitMedia}>
          {/* eslint-disable-next-line @next/next/no-img-element -- imported WordPress media of unknown size */}
          <img src={mediaUrl(image.src)} alt={image.alt ?? ""} fetchPriority="high" />
        </div>
      </section>
    );
  }

  return (
    <section className={styles.plain}>
      <div className={styles.coverInner}>
        <Breadcrumbs items={hero.breadcrumbs} light />
        {hero.eyebrow && <p className={styles.eyebrowLight}>{hero.eyebrow}</p>}
        <h1 className={styles.plainTitle}>{hero.title}</h1>
        {hero.subtitle && <p className={styles.plainSubtitle}>{hero.subtitle}</p>}
        <Ctas ctas={hero.ctas} onDark />
      </div>
    </section>
  );
}
