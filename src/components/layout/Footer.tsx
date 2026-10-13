/* eslint-disable @next/next/no-img-element -- small static SVG icons */
import Link from "next/link";
import { cacheLife } from "next/cache";
import { VivianMarkIcon } from "@/components/icons";
import { APP_STORE_URL, FOOTER_COLUMNS, GOOGLE_PLAY_URL, SOCIAL_LINKS } from "@/lib/site";
import styles from "./Footer.module.css";

// Reading the clock during prerender fails under Cache Components, so the
// year is cached and refreshed daily.
async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

function BrandBlock() {
  return (
    <div className={styles.brand}>
      <Link href="/" className={`${styles.logoLink} focus-ring`} aria-label="Vivian Health">
        <VivianMarkIcon size="100%" className={styles.mark} />
        <img src="/svg/vivian-logo.svg" alt="" className={styles.wordmark} width={114} height={33} />
      </Link>
      <address className={styles.address}>
        100 Pine St., Ste. 1250 (PMB A140)
        <br />
        San Francisco, CA 94111
      </address>
      <ul className={styles.social}>
        {SOCIAL_LINKS.map((social) => (
          <li key={social.name}>
            <a href={social.href} className={`${styles.socialLink} focus-ring`}>
              <img src={social.icon} alt={social.name} width={32} height={32} />
            </a>
          </li>
        ))}
      </ul>
      <ul className={styles.stores}>
        <li>
          <a href={APP_STORE_URL} className={`${styles.storeLink} focus-ring`}>
            <img src="/svg/icon-apple.svg" alt="" width={15} height={18} />
            App Store
          </a>
        </li>
        <li>
          <a href={GOOGLE_PLAY_URL} className={`${styles.storeLink} focus-ring`}>
            <img src="/svg/icon-google-play.svg" alt="" width={16} height={17} />
            Google Play
          </a>
        </li>
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <BrandBlock />
        <div className={styles.content}>
          <div className={styles.columns}>
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title} className={styles.column}>
                <h3 className={styles.columnTitle}>{column.title}</h3>
                {column.links.map((link) => (
                  <Link key={link.text} href={link.href} className={`${styles.columnLink} focus-ring`}>
                    {link.text}
                  </Link>
                ))}
              </div>
            ))}
          </div>
          <div className={styles.legal}>
            <Link href="/terms-of-service/" target="_blank" className={`${styles.legalLink} focus-ring`}>
              Terms of use
            </Link>
            <Link href="/privacy-policy/" target="_blank" className={`${styles.legalLink} focus-ring`}>
              Privacy policy
            </Link>
            <p className={styles.fineprint}>
              All rights reserved. Vivian Health <CopyrightYear />.
              <br />
              This site is protected by reCAPTCHA Enterprise and the Google{" "}
              <a href="https://policies.google.com/privacy">Privacy Policy</a> and{" "}
              <a href="https://policies.google.com/terms">Terms of Service</a> apply.
            </p>
            <p className={styles.fineprint}>
              Vivian is not a bank. Visa prepaid debit cards are issued by Lead Bank, Member FDIC,
              pursuant to license from Visa U.S.A. Inc. Terms and conditions apply.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
