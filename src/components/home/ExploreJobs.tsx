"use client";

import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";
import type { ExploreTab } from "@/data/home";
import styles from "./ExploreJobs.module.css";

const slug = (label: string) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function ExploreJobs({ title, tabs }: { title: string; tabs: ExploreTab[] }) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const focusTab = (index: number) => {
    const next = (index + tabs.length) % tabs.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const moves: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: tabs.length - 1,
    };
    if (event.key in moves) {
      event.preventDefault();
      focusTab(moves[event.key]);
    }
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.tabsScroller}>
        <ul role="tablist" className={styles.tablist}>
          {tabs.map((tab, i) => {
            const id = slug(tab.label);
            return (
              <li key={tab.label} role="presentation" className={styles.tabItem}>
                <a
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  role="tab"
                  id={`${id}-tab-link`}
                  href={`#${id}-tab-panel`}
                  aria-controls={`${id}-tab-panel`}
                  aria-selected={active === i}
                  tabIndex={active === i ? 0 : -1}
                  className={`${styles.tab} ${active === i ? styles.tabActive : ""}`}
                  onClick={(event) => {
                    event.preventDefault();
                    setActive(i);
                  }}
                  onKeyDown={(event) => onKeyDown(event, i)}
                >
                  {tab.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      {tabs.map((tab, i) => {
        const id = slug(tab.label);
        return (
          <nav
            key={tab.label}
            id={`${id}-tab-panel`}
            role="tabpanel"
            aria-labelledby={`${id}-tab-link`}
            hidden={active !== i}
          >
            <ul className={`${styles.list} ${styles.columns}`}>
              {tab.items.map((group) => (
                <li key={group.value} className={styles.group}>
                  <h3 className={styles.heading}>
                    <Link href={group.value} prefetch={false} className={styles.link}>
                      {group.label}
                    </Link>
                  </h3>
                  {group.items && group.items.length > 0 && (
                    <ul className={`${styles.list} ${styles.subList}`}>
                      {group.items.map((item) => (
                        <li key={item.value}>
                          <h4 className={styles.heading}>
                            <Link href={item.value} prefetch={false} className={styles.link}>
                              {item.label}
                            </Link>
                          </h4>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        );
      })}
    </section>
  );
}
