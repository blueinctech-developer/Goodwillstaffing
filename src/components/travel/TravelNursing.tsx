/* eslint-disable @next/next/no-img-element -- fixed-size WordPress uploads */
import { ButtonLink } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/icons";
import type { FaqItem } from "@/lib/content";
import { mediaUrl, rewriteMediaInHtml } from "@/lib/media";
import { CONTACT_PATH, JOB_BOARD_URL, PORTAL_SIGNUP_URL } from "@/lib/site";
import blockStyles from "@/components/content/Blocks.module.css";
import styles from "./TravelNursing.module.css";

const TEAL = "#02646F";
const PINK = "#F9C0C0";

// Line icons in the site's two-tone style (teal line, pink accent).
const FEATURE_ICONS = {
  license: (
    <>
      <rect x="14" y="8" width="30" height="40" rx="3" fill="none" stroke={TEAL} strokeWidth="2.5" />
      <path d="M21 18h16M21 25h16M21 32h9" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="43" cy="44" r="9" fill={PINK} />
      <path d="M39 44l3 3 5-6" fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  adventure: (
    <>
      <path d="M8 36l18-6 14-18c2-3 7-1 5 3L33 33l-4 17-5 2-1-14-12 4-3-6z" fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="48" cy="46" r="6" fill={PINK} />
    </>
  ),
  travelling: (
    <>
      <path d="M8 16l14-6 14 6 14-6v36l-14 6-14-6-14 6z" fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M22 10v36M36 16v36" stroke={TEAL} strokeWidth="2.5" />
      <circle cx="29" cy="28" r="6" fill={PINK} />
    </>
  ),
  pay: (
    <>
      <circle cx="30" cy="20" r="10" fill={PINK} />
      <path d="M30 14v12M27 17h5a2 2 0 010 4h-4a2 2 0 000 4h5" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round" />
      <path d="M8 44h10l10 4 16-6c3-1 5 3 2 5L30 54l-12-3H8z" fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinejoin="round" />
    </>
  ),
};

// Copy from the live travel nursing page.
const FEATURES: { icon: keyof typeof FEATURE_ICONS; title: string; text: string }[] = [
  {
    icon: "license",
    title: "License Reimbursement",
    text: "When you commit to a first-time, 12-week out-of-province assignment, you may be eligible for a license reimbursement – up to $450! T&C applies.",
  },
  { icon: "adventure", title: "Adventure", text: "Our travel nursing opportunities cover numerous destinations within Canada." },
  { icon: "travelling", title: "Travelling", text: "We organize your travel so you don’t have anything to worry about." },
  {
    icon: "pay",
    title: "Payment & Perks",
    text: "As a travel nurse with us, we offer $500 for every referral made for another nurse who joins our team. T&C applies.",
  },
];

const IMAGES = {
  hero: "/media/2025/01/with-wanderlust-cliff.jpg",
  why: "/media/2025/01/AdobeStock_1871230232.jpg",
  referral: "/media/2026/03/ref.jpg",
  next: "/images/stock/goodwill-nurse-lake.jpg",
  // Pexels photo 33730307: Moraine Lake, Banff (free for commercial use).
  closing: "/images/stock/pexels-33730307-moraine-lake.jpg",
};

const POLICY_PDF = "/media/2026/03/Bonus-and-Referral-Program-Policy.pdf";

function DocIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d="M4 1.5h5l3.5 3.5v9.5h-8.5z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M9 1.5V5h3.5M6 9h4M6 11.5h4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function TravelNursing({ faqs }: { faqs: FaqItem[] }) {
  return (
    <>
      {/* Hero: copy on pale blue, photo cut on a diagonal */}
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <h1 className={styles.heroTitle}>
            Travel Nursing <span className={styles.accent}>in Canada</span>
          </h1>
          <p className={styles.lead}>
            Looking forward to packing your bag for your next or first travel adventure? Discover rewarding travel
            nursing opportunities across Canada.
          </p>
          <ButtonLink href={PORTAL_SIGNUP_URL} tall variant="secondary" className={styles.button}>
            Apply now <ArrowIcon size="1.125rem" />
          </ButtonLink>
        </div>
        <div className={styles.heroMedia}>
          <img src={mediaUrl(IMAGES.hero)} alt="A smiling travel nurse outdoors in the mountains" fetchPriority="high" />
        </div>
      </section>

      {/* Why travel nursing: features beside a portrait */}
      <section className={styles.why}>
        <div className={styles.whyCopy}>
          <h2 className={styles.title}>More than a job. A bigger experience.</h2>
          <p className={styles.lead}>
            We take delight in creating an inclusive and rewarding travel nursing experience for our travelling nurses.
          </p>
          <ul className={styles.features}>
            {FEATURES.map((f) => (
              <li key={f.title} className={styles.feature}>
                <span className={styles.featureIcon}>
                  <svg viewBox="0 0 58 58" aria-hidden="true" focusable="false">
                    {FEATURE_ICONS[f.icon]}
                  </svg>
                </span>
                <span>
                  <strong className={styles.featureTitle}>{f.title}</strong>
                  <span className={styles.featureText}>{f.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <img src={mediaUrl(IMAGES.why)} alt="A travel nurse ready for her next assignment" className={styles.whyPhoto} loading="lazy" />
      </section>

      {/* Bonus and referral policy */}
      <section className={styles.referral}>
        <img src={mediaUrl(IMAGES.referral)} alt="Two nurses reviewing information on a tablet" className={styles.referralPhoto} loading="lazy" />
        <div>
          <h2 className={styles.title}>Bonus and Referral Program Policy</h2>
          <p className={styles.lead}>
            Goodwill Staffing and Recruitment continues to reward the dedication of our nurses and allied health
            professionals across Canada. Our updated Bonus and Referral Program ensures transparency, sustainability, and
            meaningful incentives for professionals who help strengthen our healthcare workforce.
          </p>
          <a href={mediaUrl(POLICY_PDF)} className={styles.download} target="_blank" rel="noopener noreferrer">
            <DocIcon /> Download the full policy <ArrowIcon size="1.125rem" />
          </a>
        </div>
      </section>

      {/* Next assignment */}
      <section className={styles.next}>
        <div className={styles.nextCopy}>
          <h2 className={styles.title}>Ready for your next assignment?</h2>
          <p className={styles.lead}>
            Take the next step in your travel nursing journey. Browse current opportunities or apply now and our team will
            be in touch to help you find the right fit.
          </p>
          <div className={styles.actions}>
            <ButtonLink href={PORTAL_SIGNUP_URL} tall variant="secondary" className={styles.button}>
              Apply now <ArrowIcon size="1.125rem" />
            </ButtonLink>
            <ButtonLink href={JOB_BOARD_URL} tall variant="light" className={`${styles.button} ${styles.outline}`}>
              Search travel nursing jobs <ArrowIcon size="1.125rem" />
            </ButtonLink>
          </div>
        </div>
        <div className={styles.nextMedia} style={{ backgroundImage: `url(${mediaUrl(IMAGES.next)})` }} aria-hidden="true" />
      </section>

      {/* FAQs */}
      <section className={styles.faqs}>
        <div className={styles.faqHeader}>
          <h2 className={styles.title}>FAQs</h2>
          <p className={styles.still}>
            Still have questions?
            <ButtonLink href={CONTACT_PATH} variant="light" className={`${styles.button} ${styles.outlineTeal}`}>
              Contact us <ArrowIcon size="1rem" />
            </ButtonLink>
          </p>
        </div>
        {/* Two columns: first half left, second half right, read top to bottom. */}
        <div className={styles.faqColumns}>
          {[faqs.slice(0, Math.ceil(faqs.length / 2)), faqs.slice(Math.ceil(faqs.length / 2))].map((column, i) => (
            <div key={i} className={styles.faqList}>
              {column.map((item) => (
                <details key={item.question} className={styles.faqItem}>
                  <summary className={styles.faqQuestion}>{item.question}</summary>
                  <div className={blockStyles.prose} dangerouslySetInnerHTML={{ __html: rewriteMediaInHtml(item.answer) }} />
                </details>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Closing band */}
      <section className={styles.closing} style={{ backgroundImage: `url(${mediaUrl(IMAGES.closing)})` }}>
        <div className={styles.closingCopy}>
          <h2 className={styles.closingTitle}>Do you need healthcare staff or healthcare jobs?</h2>
          <p className={styles.closingText}>
            We connect skilled healthcare professionals with great opportunities and help healthcare organizations build
            stronger care teams.
          </p>
          <div className={styles.actions}>
            <ButtonLink href="/request-staffing/" tall variant="secondary" lightFocus className={styles.button}>
              Request staffing <ArrowIcon size="1.125rem" />
            </ButtonLink>
            <ButtonLink href={PORTAL_SIGNUP_URL} tall variant="light" lightFocus className={styles.button}>
              Apply now <ArrowIcon size="1.125rem" />
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
