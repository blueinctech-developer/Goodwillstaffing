"use client";

import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { ChevronRightIcon, CloseIcon, PauseGlyph, PlayGlyph } from "@/components/icons";
import { HERO_CLIP_URL, HERO_FULL_VIDEO_URL, REGISTER_PATH } from "@/lib/site";
import { useMediaQuery } from "@/lib/useMediaQuery";
import type { JobsByType } from "@/data/home";
import { JobTypeCard } from "./JobTypeCard";
import styles from "./Hero.module.css";

export function Hero({ jobsByType }: { jobsByType: JobsByType[] }) {
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
    <section className={styles.hero}>
      <div className={styles.banner}>
        <div className={styles.copyColumn}>
          <div className={styles.copy}>
            <h1 className={styles.title}>
              Find the <span className={styles.italic}>healthcare</span>
              <br className={styles.breakMobileWide} /> job where{" "}
              <span className={styles.italic}>
                you are <br className={styles.breakMobile} />
                valued
              </span>
            </h1>
            <p className={styles.subtitle}>
              Vivian is the leading marketplace for <br className={styles.breakMobile} />
              healthcare jobs. Choose from staff, <br className={styles.breakMobile} />
              travel, local contract, and per diem <br className={styles.breakMobile} />
              opportunities to fit your lifestyle needs.
            </p>
            <div className={styles.actions}>
              <ButtonLink href={REGISTER_PATH} tall fullWidth className={styles.cta}>
                Create a free profile
              </ButtonLink>
            </div>
          </div>
        </div>

        <div className={styles.media}>
          <div className={styles.videoControls}>
            <button
              type="button"
              className={styles.playButton}
              aria-label={isPlaying ? "Pause" : "Play"}
              onClick={() => setPlayChoice(!isPlaying)}
            >
              {isPlaying ? <PauseGlyph /> : <PlayGlyph />}
            </button>
            <button type="button" className={styles.fullVideoButton} onClick={openFullVideo}>
              Full video
              <ChevronRightIcon size="1rem" className={styles.fullVideoChevron} />
            </button>
          </div>
          <video
            ref={loopRef}
            className={styles.video}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src={HERO_CLIP_URL} type="video/mp4" />
          </video>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-label="Vivian Health video"
        onClose={handleDialogClose}
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current.close();
        }}
      >
        <div className={styles.dialogBody}>
          {/* preload="none": the 315 MB file only streams once someone presses play. */}
          <video ref={fullVideoRef} className={styles.fullVideo} controls playsInline preload="none">
            <source src={HERO_FULL_VIDEO_URL} type="video/mp4" />
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

      <div className={styles.cards}>
        {jobsByType.map((jobs) => (
          <JobTypeCard key={jobs.employmentType} {...jobs} className={styles.card} />
        ))}
      </div>
    </section>
  );
}
