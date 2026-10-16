import { SmartApplyChat } from "@/components/smart-apply/SmartApplyChat";
import { pageMetadata } from "@/lib/metadata";
import { AI_RECRUITER_PATH } from "@/lib/site";
import styles from "./page.module.css";

export const metadata = pageMetadata({
  title: "AI Recruiter - SmartApply | Goodwill Staffing",
  description:
    "Chat with GoodwillBot, Goodwill's SmartApply recruiter. Answer a few questions and our recruitment team will match you with healthcare opportunities or candidates across Canada.",
  path: AI_RECRUITER_PATH,
});

export default function AiRecruiterPage() {
  return (
    <section className={styles.section}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>SmartApply</p>
        <h1 className={styles.title}>Let our AI recruiter find your perfect match</h1>
        <p className={styles.lead}>
          Answer a few quick questions and GoodwillBot will pass your details to our recruitment team.
        </p>
      </div>
      <div className={styles.chat}>
        <SmartApplyChat />
      </div>
    </section>
  );
}
