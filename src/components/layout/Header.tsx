"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { ChevronDownIcon, CloseIcon } from "@/components/icons";
import {
  EMPLOYER_URL,
  LOGIN_PATH,
  REGISTER_PATH,
  RESOURCES_LINKS,
  TRENDING_JOBS_LINKS,
  type NavLink,
} from "@/lib/site";
import styles from "./Header.module.css";

const PRIMARY_LINKS: NavLink[] = [
  { text: "Browse Jobs", href: "/browse-jobs/landing" },
  { text: "Locations", href: "/explore/" },
  { text: "For Employers", href: EMPLOYER_URL },
];

function Dropdown({ label, links }: { label: string; links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLLIElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <li className={styles.menuItem} ref={rootRef}>
      <button
        type="button"
        className={styles.navLink}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        {label}
        <ChevronDownIcon size="1.5rem" className={styles.dropdownIcon} />
      </button>
      {open && (
        <ul id={menuId} className={styles.dropdown}>
          {links.map((link) => (
            <li key={link.text}>
              <Link href={link.href} className={styles.dropdownLink} onClick={() => setOpen(false)}>
                {link.text}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div className={`${styles.drawerRoot} ${open ? styles.drawerOpen : ""}`} aria-hidden={!open}>
      <div className={styles.backdrop} onClick={onClose} />
      <nav className={styles.drawer} aria-label="Mobile navigation" inert={!open}>
        <div className={styles.drawerTop}>
          <button
            ref={closeRef}
            type="button"
            className={styles.drawerClose}
            aria-label="close drawer"
            onClick={onClose}
          >
            <CloseIcon size="1.5rem" />
          </button>
          <div className={styles.drawerActions}>
            <ButtonLink href={REGISTER_PATH} fullWidth onClick={onClose}>
              Join Vivian
            </ButtonLink>
            <Link href={LOGIN_PATH} className={styles.drawerLogin} onClick={onClose}>
              Log in
            </Link>
          </div>
        </div>
        <ul className={styles.drawerList}>
          {PRIMARY_LINKS.map((link) => (
            <li key={link.text} className={styles.drawerItem}>
              <Link href={link.href} onClick={onClose}>
                {link.text}
              </Link>
            </li>
          ))}
          {[
            { title: "Resources", links: RESOURCES_LINKS },
            { title: "Trending Jobs", links: TRENDING_JOBS_LINKS },
          ].map((group) => (
            <li key={group.title} className={styles.drawerItem}>
              <details className={styles.drawerGroup}>
                <summary>
                  {group.title}
                  <ChevronDownIcon size="1.5rem" className={styles.drawerChevron} />
                </summary>
                <ul className={styles.drawerSubList}>
                  {group.links.map((link) => (
                    <li key={link.text} className={styles.drawerItem}>
                      <Link href={link.href} onClick={onClose}>
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Stable so the drawer's open effect doesn't re-run (and refocus) on every render.
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Navigation Bar">
        <div className={styles.brand}>
          <Link href="/" className={styles.logoLink}>
            {/* eslint-disable-next-line @next/next/no-img-element -- static vector logo */}
            <img src="/svg/vivian-logo.svg" alt="Vivian Health" width={83} height={24} className={styles.logo} />
          </Link>
        </div>

        <div className={styles.desktopMenus}>
          <ul className={styles.menuLeft}>
            {PRIMARY_LINKS.map((link) => (
              <li key={link.text} className={styles.menuItem}>
                <Link href={link.href} className={styles.navLink}>
                  {link.text}
                </Link>
              </li>
            ))}
            <Dropdown label="Resources" links={RESOURCES_LINKS} />
            <Dropdown label="Trending Jobs" links={TRENDING_JOBS_LINKS} />
          </ul>
          <ul className={styles.menuRight}>
            <li className={`${styles.menuItem} ${styles.loginItem}`}>
              <Link href={LOGIN_PATH} className={`${styles.loginLink} focus-ring`}>
                Log in
              </Link>
            </li>
            <li className={`${styles.menuItem} ${styles.joinItem}`}>
              <ButtonLink href={REGISTER_PATH}>Join Vivian</ButtonLink>
            </li>
          </ul>
        </div>

        <button
          type="button"
          className={styles.menuButton}
          aria-label="open drawer"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(true)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static vector icon */}
          <img src="/svg/menu.svg" alt="" width={24} height={24} />
        </button>
      </nav>
      <Drawer open={drawerOpen} onClose={closeDrawer} />
    </header>
  );
}
