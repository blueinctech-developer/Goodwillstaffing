/* eslint-disable @next/next/no-img-element -- small static SVG icons */
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { cacheLife } from "next/cache";
import {
  ADDRESS_LINES,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
  FOOTER_COLUMNS,
  LEGAL_LINKS,
  RECAPTCHA_LINKS,
  SITE_NAME,
  SOCIAL_LINKS,
} from "@/lib/site";
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
      <Link href="/" className={`${styles.logoLink} focus-ring logoHover`} aria-label={SITE_NAME}>
        <Logo animated="hover" className={styles.wordmark} title="" />
      </Link>
      <address className={styles.address}>
        {ADDRESS_LINES[0]}
        <br />
        {ADDRESS_LINES[1]}
        <br />
        <a href={CONTACT_PHONE_HREF}>{CONTACT_PHONE}</a>
        <br />
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
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
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={`${styles.legalLink} focus-ring`}>
                {link.text}
              </Link>
            ))}
            <p className={styles.fineprint}>
              This site is protected by reCAPTCHA and the Google{" "}
              {RECAPTCHA_LINKS.map((link, i) => (
                <span key={link.href}>
                  {i > 0 && " and "}
                  <a href={link.href}>{link.text}</a>
                </span>
              ))}{" "}
              apply.
            </p>
            <p className={styles.fineprint}>
              Copyright © <CopyrightYear /> {SITE_NAME}. All rights reserved. Designed by{" "}
              <a href="https://blueinctech.com">Blueinc</a>.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
