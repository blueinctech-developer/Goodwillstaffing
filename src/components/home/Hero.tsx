"use client";

import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowIcon, ChevronRightIcon, CloseIcon, MapleLeafIcon, PauseGlyph, PlayGlyph } from "@/components/icons";
import { HERO_CLIP_URL, HERO_FULL_VIDEO_URL, JOB_BOARD_URL, REQUEST_STAFFING_PATH } from "@/lib/site";
import { mediaUrl } from "@/lib/media";
import { useMediaQuery } from "@/lib/useMediaQuery";
import type { JobType } from "@/data/home";
import { JobTypeCard } from "./JobTypeCard";
import styles from "./Hero.module.css";

// Faint, blurred backdrop: a hospital corridor from the Goodwill media library.
const HERO_BACKDROP = "/media/2025/01/sdr0-scaled-1.jpg";


export function Hero({ jobTypes }: { jobTypes: JobType[] }) {
  const loopRef = useRef<HTMLVideoElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fullVideoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  // null until the visitor presses play/pause; the loop pauses by default
  // for visitors who prefer reduced motion.
  const [playChoice, setPlayChoice] = useState<boolean | null>(null);
  const isPlaying = playChoice ?? !prefersReducedMotion;
  // Whether the loop was playing when the modal opened, so closing can resume it.
  const resumeAfterModal = useRef(false);

  useEffect(() => {
    const video = loopRef.current;
    if (!video) return;
    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying]);

  const openFullVideo = () => {
    resumeAfterModal.current = isPlaying;
    setPlayChoice(false);
    dialogRef.current?.showModal();
    fullVideoRef.current?.play().catch(() => {});
  };

  // Runs for the close button, Escape, and backdrop clicks alike.
  const handleDialogClose = () => {
    fullVideoRef.current?.pause();
    if (resumeAfterModal.current) setPlayChoice(true);
  };

  return (
    <>
      <section className={styles.hero}>
        {/* Blurred hospital scene behind the hero, washed out toward the copy. */}
        <div className={styles.backdrop} style={{ backgroundImage: `url(${mediaUrl(HERO_BACKDROP)})` }} aria-hidden="true" />
        <div className={styles.banner}>
          <div className={styles.copy}>
            <h1 className={styles.title}>
              <span className={styles.line}>Hire the best,</span>{" "}
              <span className={styles.line}>when it matters</span>{" "}
              <span className={`${styles.line} ${styles.accent}`}>the most.</span>
            </h1>
            <p className={styles.subtitle}>
              Connecting skilled healthcare professionals with leading healthcare organizations across Canada.
            </p>
            <div className={styles.actions}>
              <ButtonLink href={JOB_BOARD_URL} tall variant="secondary" className={styles.button}>
                Find a job <ArrowIcon size="1.125rem" />
              </ButtonLink>
              <ButtonLink href={REQUEST_STAFFING_PATH} tall variant="light" className={`${styles.button} ${styles.outline}`}>
                Request staffing <ArrowIcon size="1.125rem" />
              </ButtonLink>
            </div>
            </div>

          <div className={styles.media}>
            <div className={styles.frame}>
              <video
                ref={loopRef}
                className={styles.video}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              >
                <source src={mediaUrl(HERO_CLIP_URL)} type="video/mp4" />
              </video>
              {/* Live site's control: one white pill, teal play/pause dot, "Watch Video ›". */}
              <div className={styles.videoControls}>
                <button
                  type="button"
                  className={styles.playButton}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  onClick={() => setPlayChoice(!isPlaying)}
                >
                  {isPlaying ? <PauseGlyph /> : <PlayGlyph />}
                </button>
                <button type="button" className={styles.watchButton} onClick={openFullVideo}>
                  Watch Video
                  <ChevronRightIcon size="1rem" />
                </button>
              </div>
              <p className={styles.note} aria-hidden="true">
                Real people
                <br />
                Real opportunities
                <svg viewBox="0 0 60 40" className={styles.noteArrow}>
                  <path d="M52 4C50 22 36 32 10 34" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M17 28l-7 6 8 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </p>
            </div>
            <p className={styles.badge}>
              <MapleLeafIcon size="2.25rem" className={styles.leaf} />
              <span>
                Across
                <br />
                <strong>Canada</strong>
              </span>
            </p>
          </div>
        </div>

        <dialog
          ref={dialogRef}
          className={styles.dialog}
          aria-label="Goodwill Staffing & Recruitment video"
          onClose={handleDialogClose}
          onClick={(event) => {
            if (event.target === dialogRef.current) dialogRef.current.close();
          }}
        >
          <div className={styles.dialogBody}>
            {/* preload="none": the 28 MB file only streams once someone presses play. */}
            <video ref={fullVideoRef} className={styles.fullVideo} controls playsInline preload="none">
              <source src={mediaUrl(HERO_FULL_VIDEO_URL)} type="video/mp4" />
            </video>
            <button
              type="button"
              aria-label="Close"
              className={styles.dialogClose}
              onClick={() => dialogRef.current?.close()}
            >
              <CloseIcon size="1.5rem" />
            </button>
          </div>
        </dialog>

      </section>

      {/* A separate section whose cards ride up over the bottom of the hero. */}
      <section className={styles.cardsSection} aria-label="Job types">
        <div className={styles.cards}>
          {jobTypes.map((jobType) => (
            <JobTypeCard key={jobType.employmentType} {...jobType} className={styles.card} />
          ))}
        </div>
      </section>
    </>
  );
}
