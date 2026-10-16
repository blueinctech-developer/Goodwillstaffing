import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/icons";
import { FormBlock } from "@/components/forms/Form";
import type { Block } from "@/lib/content";
import { mediaUrl, rewriteMediaInHtml } from "@/lib/media";
import { CUSTOM_COMPONENTS } from "./custom";
import { LatestPosts } from "./LatestPosts";
import { ReviewsBand } from "./ReviewsBand";
import styles from "./Blocks.module.css";

function Heading({ level, text, href }: { level: number; text: string; href?: string }) {
  // Some imported headings are links ("Apply Today!").
  const content = href ? <Link href={href}>{text}</Link> : text;
  // The page hero owns the only <h1>; imported pages sometimes have a second.
  if (level <= 2) return <h2 className={styles.h2}>{content}</h2>;
  if (level === 3) return <h3 className={styles.h3}>{content}</h3>;
  return <h4 className={styles.h4}>{content}</h4>;
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "heading":
      return <Heading level={block.level} text={block.text} href={block.href} />;
    case "rich":
      return <div className={styles.prose} dangerouslySetInnerHTML={{ __html: rewriteMediaInHtml(block.html) }} />;
    case "image": {
      const img = (
        // eslint-disable-next-line @next/next/no-img-element -- imported WordPress media of unknown size
        <img
          src={mediaUrl(block.src)}
          alt={block.alt}
          width={block.width}
          height={block.height}
          loading="lazy"
          className={styles.image}
        />
      );
      return <figure className={styles.figure}>{block.href ? <Link href={block.href}>{img}</Link> : img}</figure>;
    }
    case "buttons":
      return (
        <div className={styles.buttons}>
          {block.items.map((item, i) => (
            <ButtonLink key={item.href + item.text} href={item.href} tall variant={i ? "secondary" : "primary"}>
              {item.text} <ArrowIcon size="1.125rem" />
            </ButtonLink>
          ))}
        </div>
      );
    case "cards":
      return (
        <ul className={styles.cards} data-count={block.items.length}>
          {block.items.map((card, i) => {
            const body = (
              <>
                {card.image && (
                  // eslint-disable-next-line @next/next/no-img-element -- small imported icon or photo
                  <img src={mediaUrl(card.image.src)} alt="" loading="lazy" className={styles.cardImage} />
                )}
                {card.title && <h3 className={styles.cardTitle}>{card.title}</h3>}
                {card.text && <p className={styles.cardText}>{card.text}</p>}
                {card.href && <span className={styles.cardMore}>{card.cta || "Learn more"} →</span>}
              </>
            );
            return (
              <li key={`${card.title}-${i}`} className={styles.card}>
                {card.href ? (
                  <Link href={card.href} className={`${styles.cardLink} focus-ring`}>
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ul>
      );
    case "stats":
      return (
        <dl className={styles.stats}>
          {block.items.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <dt className={styles.statLabel}>{stat.label}</dt>
              <dd className={styles.statValue}>{stat.value}</dd>
            </div>
          ))}
        </dl>
      );
    case "list":
      return (
        <ul className={styles.list}>
          {block.items.map((item) => (
            <li key={item.text}>
              {item.href ? (
                <Link href={item.href} className={`${styles.pill} focus-ring`}>
                  {item.text}
                </Link>
              ) : (
                <span className={styles.listText}>{item.text}</span>
              )}
            </li>
          ))}
        </ul>
      );
    case "faq":
      return (
        <div className={styles.faq}>
          {block.items.map((item) => (
            <details key={item.question} className={styles.faqItem}>
              <summary className={styles.faqQuestion}>{item.question}</summary>
              <div className={styles.prose} dangerouslySetInnerHTML={{ __html: rewriteMediaInHtml(item.answer) }} />
            </details>
          ))}
        </div>
      );
    case "video":
      return (
        <div className={styles.video}>
          {block.youtubeId ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${block.youtubeId}`}
              title="Goodwill Staffing video"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <video src={block.src && mediaUrl(block.src)} controls preload="metadata" playsInline />
          )}
        </div>
      );
    case "gallery":
      return (
        <div className={styles.gallery}>
          {block.images.map((image) => (
            // eslint-disable-next-line @next/next/no-img-element -- imported WordPress media of unknown size
            <img key={image.src} src={mediaUrl(image.src)} alt={image.alt ?? ""} loading="lazy" />
          ))}
        </div>
      );
    case "form":
      return (
        <div className={styles.form}>
          <FormBlock formId={block.formId} />
        </div>
      );
    case "reviews":
      return <ReviewsBand />;
    case "posts":
      return <LatestPosts />;
    case "custom": {
      const Component = CUSTOM_COMPONENTS[block.component];
      return Component ? <Component /> : null;
    }
  }
}

type Section = { key: string; blocks: Block[] };

// Each top-level heading starts a new band so long pages read as sections,
// alternating white and cream like the rest of the site.
function toSections(blocks: Block[]): Section[] {
  const sections: Section[] = [];
  for (const [i, block] of blocks.entries()) {
    const startsSection = block.type === "heading" && block.level <= 2;
    if (!sections.length || startsSection) sections.push({ key: String(i), blocks: [] });
    sections[sections.length - 1].blocks.push(block);
  }
  return sections;
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {toSections(blocks).map((section, i) => (
        <section key={section.key} className={`${styles.section} ${i % 2 ? styles.alt : ""}`}>
          <div className={styles.inner}>
            {section.blocks.map((block, j) => (
              <BlockView key={j} block={block} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
