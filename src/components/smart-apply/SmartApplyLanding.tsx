import { ArrowIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/Button";
import { AI_RECRUITER_PATH } from "@/lib/site";
import { BotAvatar } from "./BotAvatar";
import styles from "./SmartApplyLanding.module.css";

// /smart-apply/: the live page's heading, copy and button, with a static
// preview of the GoodwillBot conversation and three short benefits.

const BENEFITS = [
  {
    title: "Faster matching",
    text: "A few quick questions instead of a long form, so our recruiters can match you with openings sooner.",
    icon: (
      <path d="M13 2 4.5 13.5H12l-1 8.5 8.5-11.5H12z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    ),
  },
  {
    title: "Real recruiters, every time",
    text: "GoodwillBot gathers your details; a member of our recruitment team reviews every conversation and follows up.",
    icon: (
      <>
        <circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M4.5 20.5c.8-4 3.8-6 7.5-6s6.7 2 7.5 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: "For job seekers and employers",
    text: "Looking for your next healthcare role, or need staff for your team? SmartApply takes you down the right path.",
    icon: (
      <path
        d="M7 4v10m0 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm10-4a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 0c0 4-4 4-10 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    ),
  },
];

/** Decorative snapshot of the conversation's opening (exact live wording). */
function ChatPreview() {
  return (
    <figure className={styles.preview} aria-hidden="true">
      <div className={styles.previewBar}>
        <BotAvatar className={styles.previewAvatar} />
        <span>
          <strong>GoodwillBot</strong>
          <small>SmartApply recruiting assistant</small>
        </span>
      </div>
      <div className={styles.previewLog}>
        <p className={styles.bot}>Hello there! I&apos;m GoodwillBot, here to connect you with exciting healthcare opportunities across Canada.</p>
        <p className={styles.bot}>First, can I get your name, please?</p>
        <p className={styles.user}>Sarah</p>
        <p className={styles.bot}>Thank you, Sarah! It&apos;s great to meet you. 😊</p>
        <div className={styles.previewChips}>
          <span className={styles.chipOn}>I&apos;m looking for a job.</span>
          <span className={styles.chip}>I&apos;m hiring healthcare staff.</span>
        </div>
        <p className={`${styles.bot} ${styles.typing}`}>
          <span />
          <span />
          <span />
        </p>
      </div>
    </figure>
  );
}

export function SmartApplyLanding() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            SmartApply <span className={styles.badge}>New</span>
          </p>
          <h1 className={styles.title}>AI Meets Healthcare Staffing</h1>
          <p className={styles.lead}>
            Your next healthcare opportunity is just a click away. SmartApply helps you connect faster with our
            recruiters, streamline your applications, and secure your ideal position quickly and confidently.
          </p>
          <ButtonLink href={AI_RECRUITER_PATH} variant="secondary" tall className={styles.cta}>
            Experience it Today <ArrowIcon size="1.125rem" />
          </ButtonLink>
        </div>
        <div className={styles.media}>
          <ChatPreview />
        </div>
      </section>

      <section className={styles.benefits} aria-labelledby="smart-apply-benefits">
        <h2 id="smart-apply-benefits" className="visually-hidden">
          Why use SmartApply
        </h2>
        <ul className={styles.benefitList}>
          {BENEFITS.map((benefit) => (
            <li key={benefit.title} className={styles.benefit}>
              <span className={styles.benefitIcon}>
                <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                  {benefit.icon}
                </svg>
              </span>
              <h3 className={styles.benefitTitle}>{benefit.title}</h3>
              <p className={styles.benefitText}>{benefit.text}</p>
            </li>
          ))}
        </ul>
        <div className={styles.benefitsCta}>
          <ButtonLink href={AI_RECRUITER_PATH} variant="primary" tall className={styles.cta}>
            Start the conversation <ArrowIcon size="1.125rem" />
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
