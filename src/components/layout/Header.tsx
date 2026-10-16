"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowRightIcon, ChevronDownIcon, CloseIcon, SECTION_ICONS } from "@/components/icons";
import { Logo } from "@/components/ui/Logo";
import {
  MEGA_MENUS,
  PORTAL_SIGNIN_URL,
  PORTAL_SIGNUP_URL,
  SMART_APPLY_LINK,
  TRAVEL_NURSING_LINK,
  isExternal,
  type MegaMenu,
  type MenuLink,
  type NavGroup,
  type NavIcon,
} from "@/lib/site";
import { mediaUrl } from "@/lib/media";
import styles from "./Header.module.css";

// Hover intent: a short pause before a panel opens so sweeping the pointer
// across the bar doesn't flash menus, and a grace period before it closes so
// the pointer can travel from the trigger down into the panel.
const OPEN_DELAY = 120;
const CLOSE_DELAY = 260;
// A click that lands right after a hover-open shouldn't immediately close it.
const HOVER_CLICK_GRACE = 600;

function MenuIcon({ icon }: { icon?: NavIcon }) {
  if (!icon) return null;
  if (icon.startsWith("/")) {
    // eslint-disable-next-line @next/next/no-img-element -- static vector icon
    return <img src={icon} alt="" width={28} height={28} className={styles.groupIcon} />;
  }
  const Icon = SECTION_ICONS[icon as keyof typeof SECTION_ICONS];
  return (
    <span className={styles.groupIcon} aria-hidden="true">
      <Icon />
    </span>
  );
}

function Badge({ text }: { text: string }) {
  return <span className={styles.badge}>{text}</span>;
}

// Internal routes go through next/link; the job board and portal are off-site.
function NavAnchor({
  href,
  className,
  onClick,
  children,
}: {
  href: string;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  if (isExternal(href)) {
    return (
      <a href={href} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

function GroupLinks({ group, onNavigate }: { group: NavGroup; onNavigate: () => void }) {
  return (
    <div className={styles.group}>
      <p className={styles.groupTitle}>
        <MenuIcon icon={group.icon} />
        {group.title}
      </p>
      <ul className={styles.groupList}>
        {group.links.map((link: MenuLink) => (
          <li key={link.text}>
            <NavAnchor href={link.href} className={styles.panelLink} onClick={onNavigate}>
              <span className={styles.panelLinkText}>
                {link.text}
                {link.badge && <Badge text={link.badge} />}
                <ArrowRightIcon size="1rem" className={styles.panelLinkArrow} />
              </span>
              {link.description && <span className={styles.panelLinkHint}>{link.description}</span>}
            </NavAnchor>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MegaPanel({
  menu,
  id,
  labelId,
  open,
  onNavigate,
  onPointerEnter,
  panelRef,
}: {
  menu: MegaMenu;
  id: string;
  labelId: string;
  open: boolean;
  onNavigate: () => void;
  onPointerEnter: () => void;
  panelRef: (node: HTMLDivElement | null) => void;
}) {
  const { intro, promo, strip } = menu;
  return (
    <div
      ref={panelRef}
      id={id}
      role="region"
      aria-labelledby={labelId}
      className={styles.panel}
      data-open={open || undefined}
      inert={!open}
      onPointerEnter={onPointerEnter}
    >
      <div className={styles.panelGrid} style={{ "--columns": menu.columns.length } as React.CSSProperties}>
        <div className={styles.intro} style={{ "--i": 0 } as React.CSSProperties}>
          <p className={styles.introTitle}>{intro.title}</p>
          <p className={styles.introText}>{intro.text}</p>
          <NavAnchor href={intro.link.href} className={styles.introLink} onClick={onNavigate}>
            {intro.link.text}
            <ArrowRightIcon size="1.125rem" />
          </NavAnchor>
        </div>

        {menu.columns.map((column, i) => (
          <div key={i} className={styles.column} style={{ "--i": i + 1 } as React.CSSProperties}>
            {column.map((group) => (
              <GroupLinks key={group.title} group={group} onNavigate={onNavigate} />
            ))}
          </div>
        ))}

        <NavAnchor href={promo.link.href} className={styles.promo} onClick={onNavigate}>
          <span className={styles.promoMedia}>
            {/* eslint-disable-next-line @next/next/no-img-element -- local photo, decorative */}
            <img src={mediaUrl(promo.image)} alt="" loading="lazy" />
          </span>
          <span className={styles.promoBody}>
            <span className={styles.promoEyebrow}>
              {promo.eyebrow}
              {promo.badge && <Badge text={promo.badge} />}
            </span>
            <span className={styles.promoTitle}>{promo.title}</span>
            <span className={styles.promoText}>{promo.text}</span>
            <span className={styles.promoCta}>
              {promo.link.text}
              <ArrowRightIcon size="1.125rem" />
            </span>
          </span>
        </NavAnchor>
      </div>

      {strip && (
        <div className={styles.strip}>
          <p className={styles.stripTitle}>{strip.title}</p>
          <ul className={styles.chips}>
            {strip.links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={styles.chip} onClick={onNavigate}>
                  {link.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
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
      <nav className={styles.drawer} aria-label="Mobile navigation" inert={!open}>
        <div className={styles.drawerTop}>
          <Link href="/" className={styles.drawerLogo} onClick={onClose}>
            <Logo className={styles.logo} />
          </Link>
          <button
            ref={closeRef}
            type="button"
            className={styles.drawerClose}
            aria-label="close drawer"
            onClick={onClose}
          >
            <CloseIcon size="1.5rem" />
          </button>
        </div>

        <ul className={styles.drawerList}>
          <li>
            <Link href={TRAVEL_NURSING_LINK.href} className={styles.drawerLink} onClick={onClose}>
              {TRAVEL_NURSING_LINK.text}
            </Link>
          </li>
          {MEGA_MENUS.map((menu) => (
            <li key={menu.label}>
              {/* One section open at a time, like the desktop panels. */}
              <details name="mobile-menu" className={styles.accordion}>
                <summary className={styles.drawerLink}>
                  {menu.label}
                  <ChevronDownIcon size="1.5rem" className={styles.drawerChevron} />
                </summary>
                <div className={styles.accordionBody}>
                  <NavAnchor href={menu.intro.link.href} className={styles.drawerOverview} onClick={onClose}>
                    {menu.intro.link.text}
                    <ArrowRightIcon size="1rem" />
                  </NavAnchor>
                  {menu.columns.flat().map((group) => (
                    <div key={group.title} className={styles.drawerGroup}>
                      <p className={styles.groupTitle}>
                        <MenuIcon icon={group.icon} />
                        {group.title}
                      </p>
                      <ul className={styles.drawerSubList}>
                        {group.links.map((link) => (
                          <li key={link.text}>
                            <NavAnchor href={link.href} className={styles.drawerSubLink} onClick={onClose}>
                              {link.text}
                              {link.badge && <Badge text={link.badge} />}
                            </NavAnchor>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {menu.strip && (
                    <div className={styles.drawerGroup}>
                      <p className={styles.groupTitle}>{menu.strip.title}</p>
                      <ul className={styles.chips}>
                        {menu.strip.links.map((link) => (
                          <li key={link.href}>
                            <Link href={link.href} className={styles.chip} onClick={onClose}>
                              {link.text}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </details>
            </li>
          ))}
          <li>
            <Link href={SMART_APPLY_LINK.href} className={styles.drawerLink} onClick={onClose}>
              <span className={styles.labelWithBadge}>
                {SMART_APPLY_LINK.text}
                {SMART_APPLY_LINK.badge && <Badge text={SMART_APPLY_LINK.badge} />}
              </span>
            </Link>
          </li>
        </ul>

        <div className={styles.drawerActions}>
          {/* Applications start on the LaborEdge sign-up, as on the live site. */}
          <ButtonLink href={PORTAL_SIGNUP_URL} fullWidth tall onClick={onClose}>
            Apply now
          </ButtonLink>
          <a href={PORTAL_SIGNIN_URL} className={styles.drawerLogin} onClick={onClose}>
            Employee portal
          </a>
        </div>
      </nav>
    </div>
  );
}

export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Stable so the drawer's open effect doesn't re-run (and refocus) on every render.
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const hoverOpenedAt = useRef(0);
  const focusFirstLink = useRef(false);
  const headerRef = useRef<HTMLElement>(null);
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const baseId = useId();

  const clearTimer = () => window.clearTimeout(timer.current);
  const close = useCallback(() => {
    window.clearTimeout(timer.current);
    setOpenIndex(null);
  }, []);

  const openOnHover = (index: number) => {
    clearTimer();
    if (openIndex === index) return;
    const show = () => {
      hoverOpenedAt.current = performance.now();
      setOpenIndex(index);
    };
    // Moving between triggers while a panel is showing switches immediately.
    if (openIndex !== null) show();
    else timer.current = window.setTimeout(show, OPEN_DELAY);
  };

  const closeOnLeave = () => {
    clearTimer();
    timer.current = window.setTimeout(() => setOpenIndex(null), CLOSE_DELAY);
  };

  // event.timeStamp shares performance.now()'s clock.
  const toggle = (event: React.MouseEvent, index: number) => {
    clearTimer();
    if (openIndex === index && event.timeStamp - hoverOpenedAt.current < HOVER_CLICK_GRACE) return;
    setOpenIndex(openIndex === index ? null : index);
  };

  const onTriggerKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key !== "ArrowDown") return;
    event.preventDefault();
    focusFirstLink.current = true;
    setOpenIndex(index);
  };

  // Arrow-down moves focus into the panel once it is rendered un-inert.
  useEffect(() => {
    if (openIndex === null || !focusFirstLink.current) return;
    focusFirstLink.current = false;
    panelRefs.current[openIndex]?.querySelector<HTMLElement>("a")?.focus();
  }, [openIndex]);

  // Escape closes and returns focus to the trigger; clicks or focus moving
  // outside the header close too.
  useEffect(() => {
    if (openIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      triggerRefs.current[openIndex]?.focus();
      close();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) close();
    };
    const onFocusIn = (event: FocusEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, [openIndex, close]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Hover intent is for mice only; touch and pen open menus by tapping.
  const onMouseLeave = (event: React.PointerEvent) => {
    if (event.pointerType === "mouse") closeOnLeave();
  };
  const onMouseEnterTrigger = (event: React.PointerEvent, index: number) => {
    if (event.pointerType === "mouse") openOnHover(index);
  };

  return (
    <header
      ref={headerRef}
      className={styles.header}
      data-menu-open={openIndex !== null || undefined}
      onPointerLeave={onMouseLeave}
    >
      <nav className={styles.nav} aria-label="Navigation Bar">
        <div className={styles.brand} onPointerEnter={onMouseLeave}>
          <Link href="/" className={`${styles.logoLink} logoHover`}>
            <Logo animated="load" className={styles.logo} />
          </Link>
        </div>

        <div className={styles.desktopMenus}>
          <ul className={styles.menuLeft}>
            <li className={styles.menuItem} onPointerEnter={onMouseLeave}>
              <Link href={TRAVEL_NURSING_LINK.href} className={styles.navLink}>
                {TRAVEL_NURSING_LINK.text}
              </Link>
            </li>
            {MEGA_MENUS.map((menu, i) => (
              <li key={menu.label} className={styles.menuItem} onPointerEnter={(event) => onMouseEnterTrigger(event, i)}>
                <button
                  ref={(node) => {
                    triggerRefs.current[i] = node;
                  }}
                  id={`${baseId}-trigger-${i}`}
                  type="button"
                  className={styles.navLink}
                  aria-expanded={openIndex === i}
                  aria-controls={`${baseId}-panel-${i}`}
                  onClick={(event) => toggle(event, i)}
                  onKeyDown={(event) => onTriggerKeyDown(event, i)}
                >
                  {menu.label}
                  <ChevronDownIcon size="1.25rem" className={styles.dropdownIcon} />
                </button>
              </li>
            ))}
            <li className={styles.menuItem} onPointerEnter={onMouseLeave}>
              <Link href={SMART_APPLY_LINK.href} className={styles.navLink}>
                <span className={styles.labelWithBadge}>
                  {SMART_APPLY_LINK.text}
                  {SMART_APPLY_LINK.badge && <Badge text={SMART_APPLY_LINK.badge} />}
                </span>
              </Link>
            </li>
          </ul>
          <ul className={styles.menuRight} onPointerEnter={onMouseLeave}>
            <li className={`${styles.menuItem} ${styles.loginItem}`}>
              <a href={PORTAL_SIGNIN_URL} className={`${styles.loginLink} focus-ring`}>
                Employee portal
              </a>
            </li>
            <li className={`${styles.menuItem} ${styles.joinItem}`}>
              <ButtonLink href={PORTAL_SIGNUP_URL}>Apply now</ButtonLink>
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

      <div className={styles.panels}>
        {MEGA_MENUS.map((menu, i) => (
          <MegaPanel
            key={menu.label}
            menu={menu}
            id={`${baseId}-panel-${i}`}
            labelId={`${baseId}-trigger-${i}`}
            open={openIndex === i}
            onNavigate={close}
            onPointerEnter={clearTimer}
            panelRef={(node) => {
              panelRefs.current[i] = node;
            }}
          />
        ))}
      </div>
      {/* Dims the page under an open panel; clicking it closes the menu. */}
      <div className={styles.scrim} aria-hidden="true" onClick={close} onPointerEnter={onMouseLeave} />

      <Drawer open={drawerOpen} onClose={closeDrawer} />
    </header>
  );
}
