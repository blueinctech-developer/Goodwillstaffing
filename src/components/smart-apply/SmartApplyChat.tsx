"use client";

import { useEffect, useEffectEvent, useId, useRef, useState } from "react";
import type { DragEvent, FormEvent } from "react";
import { ArrowIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/Button";
import { requestUpload, submitForm } from "@/forms/actions";
import type { FileField, UploadRef } from "@/forms/types";
import { fileError, formatBytes } from "@/forms/validate";
import { BotAvatar } from "./BotAvatar";
import {
  ANSWER_FIELDS,
  FIRST_STEP,
  RESET_WORDS,
  getStep,
  labelsFor,
  nextStep,
  render,
  type Answers,
  type EndStep,
  type FileStep,
  type InputStep,
  type StepId,
} from "./flow";
import styles from "./SmartApplyChat.module.css";

const FORM_ID = "smart-apply";

/**
 * Without S3 the résumé travels inside the Server Action request, which is
 * capped at 4 MB (next.config.ts), so leave room for the other answers.
 */
const IN_REQUEST_LIMIT = 3.5 * 1024 * 1024;

type Message = { id: number; from: "bot" | "user"; text: string; file?: boolean };

/**
 * running: the bot is talking; input: waiting for the visitor; submitting:
 * sending the answers; failed: the send failed (retry offered); done.
 */
type Phase = "running" | "input" | "submitting" | "failed" | "done";

type Resume = { file: File; ref?: UploadRef };

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** How long the typing dots show before each bot message. */
function typingDelay() {
  return prefersReducedMotion() ? 250 : 500 + Math.round(Math.random() * 200);
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function cx(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/** PUT the résumé to its presigned S3 URL (as FormClient does), reporting progress. */
function putFile(url: string, file: File, contentType: string, onProgress: (fraction: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (event) => event.total && onProgress(event.loaded / event.total);
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });
}

function fileFieldFor(step: FileStep): FileField {
  return { type: "file", name: step.field, label: "Resume/CV", extensions: step.extensions, maxSize: step.maxSize };
}

export function SmartApplyChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [phase, setPhase] = useState<Phase>("running");
  const [stepId, setStepId] = useState<StepId | null>(null);
  const [text, setText] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [upload, setUpload] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  // The conversation runs asynchronously (typing pauses, the upload, the
  // submission); each run gets a token so "reset" cancels the one in flight.
  const runRef = useRef(0);
  const answersRef = useRef<Answers>({});
  const resumeRef = useRef<Resume | null>(null);
  const endRef = useRef<EndStep | null>(null);
  const nextIdRef = useRef(0);

  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const choicesRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileButtonRef = useRef<HTMLButtonElement>(null);
  const ids = useId();

  const step = stepId ? (getStep(stepId) as InputStep) : null;

  function push(from: Message["from"], body: string, file?: boolean) {
    const id = ++nextIdRef.current;
    setMessages((list) => [...list, { id, from, text: body, file }]);
  }

  /** Show the typing dots, then the message. False when the run was reset meanwhile. */
  async function say(token: number, body: string) {
    setTyping(true);
    await wait(typingDelay());
    if (runRef.current !== token) return false;
    setTyping(false);
    push("bot", body);
    return true;
  }

  /** Walk the flow from `from` until it needs the visitor (or ends). */
  async function run(token: number, from: StepId) {
    setPhase("running");
    setStepId(null);
    let id = from;
    for (;;) {
      const current = getStep(id);
      const answers = answersRef.current;
      if (current.kind === "end") {
        endRef.current = current;
        await submit(token);
        return;
      }
      if (current.kind === "message") {
        if (!(await say(token, render(current.text, answers)))) return;
        id = nextStep(current, answers);
        continue;
      }
      if (!(await say(token, render(current.prompt, answers)))) return;
      setText("");
      setPicked([]);
      setStepId(current.id);
      setPhase("input");
      return;
    }
  }

  async function submit(token: number) {
    setPhase("submitting");
    setTyping(true);

    const data = new FormData();
    const answers = answersRef.current;
    for (const field of ANSWER_FIELDS) {
      const value = answers[field];
      if (Array.isArray(value)) value.forEach((v) => data.append(field, v));
      else if (value) data.append(field, value);
    }
    const resume = resumeRef.current;
    if (resume) data.append("resume", resume.ref ? JSON.stringify(resume.ref) : resume.file);

    const result = await submitForm(FORM_ID, { status: "idle" }, data).catch(
      () => ({ status: "error", message: "Please check your connection and try again.", errors: {} }) as const,
    );
    if (runRef.current !== token) return;
    setTyping(false);

    if (result.status === "success") {
      const end = endRef.current;
      if (end?.text) push("bot", render(end.text, answers));
      setPhase("done");
      return;
    }
    const detail = result.status === "error" ? (Object.values(result.errors)[0] ?? result.message) : "";
    push("bot", `Sorry, I couldn't send your details just now. ${detail}`.trim());
    setPhase("failed");
  }

  function start() {
    const token = ++runRef.current;
    answersRef.current = {};
    resumeRef.current = null;
    endRef.current = null;
    void run(token, FIRST_STEP);
  }

  function reset() {
    setMessages([]);
    setTyping(false);
    setUpload(null);
    setText("");
    setPicked([]);
    start();
  }

  function retry() {
    void submit(++runRef.current);
  }

  /** Record an answer, echo it as the visitor's bubble and carry on. */
  function answer(current: InputStep, value: string | string[], bubble: string, file?: boolean) {
    answersRef.current = { ...answersRef.current, [current.field]: value };
    push("user", bubble, file);
    void run(runRef.current, nextStep(current, answersRef.current));
  }

  /** The bot asks again on the same step. */
  async function reask(body: string) {
    const token = runRef.current;
    setPhase("running");
    if (await say(token, body)) setPhase("input");
  }

  function onSubmitText(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step?.kind !== "text") return;
    const value = text.trim();
    if (!value) return;
    if (RESET_WORDS.has(value.toLowerCase())) {
      reset();
      return;
    }
    const problem = step.validate?.(value);
    if (problem) {
      push("user", value);
      setText("");
      void reask(problem);
      return;
    }
    answer(step, value, value);
  }

  async function onFile(file: File | undefined) {
    if (step?.kind !== "file" || !file) return;
    const current = step;
    const field = fileFieldFor(current);
    const invalid = file.size === 0 ? `"${file.name}" is empty.` : fileError(field, file);
    if (invalid) {
      void reask(`${invalid} Please choose a PDF, DOC or DOCX file up to ${formatBytes(current.maxSize)}.`);
      return;
    }

    const token = runRef.current;
    setUpload(0);
    let resume: Resume | null = null;
    let problem: string | undefined;
    const ticket = await requestUpload(FORM_ID, current.field, { name: file.name, type: file.type, size: file.size }).catch(
      () => ({ status: "error", message: "The upload failed. Please try again." }) as const,
    );
    if (runRef.current !== token) return;
    if (ticket.status === "disabled") {
      // No S3: the file goes with the submission, like FormClient.
      if (file.size > IN_REQUEST_LIMIT) {
        problem = `"${file.name}" is too large to send here. Please choose a file under ${formatBytes(IN_REQUEST_LIMIT)}.`;
      } else resume = { file };
    } else if (ticket.status === "error") {
      problem = ticket.message;
    } else {
      try {
        await putFile(ticket.url, file, ticket.contentType, setUpload);
        resume = { file, ref: { key: ticket.key, name: file.name, size: file.size, type: ticket.contentType } };
      } catch {
        problem = `"${file.name}" couldn't be uploaded. Please check your connection and try again.`;
      }
    }
    if (runRef.current !== token) return;
    setUpload(null);
    if (!resume) {
      void reask(problem ?? "The upload failed. Please try again.");
      return;
    }
    resumeRef.current = resume;
    answer(current, "", `${file.name} (${formatBytes(file.size)})`, true);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (upload === null) void onFile(event.dataTransfer.files[0]);
  }

  // Start the conversation once on mount; the token cancels it on unmount.
  const begin = useEffectEvent(start);
  useEffect(() => {
    const runs = runRef;
    begin();
    return () => {
      runs.current++;
    };
  }, []);

  // Keep the newest message in view (inside the log, not the page).
  useEffect(() => {
    const log = logRef.current;
    if (!log) return;
    log.scrollTo({ top: log.scrollHeight, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [messages.length, typing, phase]);

  // After each bot turn, move focus to whatever answers it.
  useEffect(() => {
    if (phase !== "input" || !stepId) return;
    const kind = getStep(stepId).kind;
    const target =
      kind === "text"
        ? inputRef.current
        : kind === "file"
          ? fileButtonRef.current
          : choicesRef.current?.querySelector<HTMLButtonElement>("button");
    target?.focus({ preventScroll: true });
  }, [phase, stepId]);

  const busy = phase === "running" || phase === "submitting";

  return (
    <section className={styles.chat} aria-labelledby={`${ids}-title`}>
      <header className={styles.bar}>
        <BotAvatar className={styles.barAvatar} />
        <div className={styles.barText}>
          <h2 id={`${ids}-title`} className={styles.barTitle}>
            GoodwillBot
          </h2>
          <p className={styles.barStatus}>SmartApply recruiting assistant</p>
        </div>
        <button type="button" className={styles.restart} onClick={reset}>
          Start over
        </button>
      </header>

      <div ref={logRef} className={styles.log} role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversation with GoodwillBot">
        {messages.map((message) =>
          message.from === "bot" ? (
            <div key={message.id} className={cx(styles.row, styles.botRow)}>
              <BotAvatar className={styles.avatar} />
              <p className={cx(styles.bubble, styles.bot)}>
                <span className="visually-hidden">GoodwillBot: </span>
                {message.text}
              </p>
            </div>
          ) : (
            <div key={message.id} className={cx(styles.row, styles.userRow)}>
              <p className={cx(styles.bubble, styles.user)}>
                <span className="visually-hidden">You: </span>
                {message.file && (
                  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" className={styles.clip}>
                    <path
                      d="M8 12.5l6.4-6.4a3 3 0 0 1 4.2 4.2l-7.8 7.8a5 5 0 0 1-7-7L11 4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {message.text}
              </p>
            </div>
          ),
        )}
        {typing && (
          <div className={cx(styles.row, styles.botRow)} aria-hidden="true">
            <BotAvatar className={styles.avatar} />
            <p className={cx(styles.bubble, styles.bot, styles.typing)}>
              <span />
              <span />
              <span />
            </p>
          </div>
        )}
      </div>

      <div className={styles.composer}>
        {phase === "input" && step?.kind === "text" && (
          <form className={styles.textForm} onSubmit={onSubmitText}>
            <label htmlFor={`${ids}-text`} className="visually-hidden">
              {render(step.prompt, answersRef.current)}
            </label>
            <input
              key={step.id}
              ref={inputRef}
              id={`${ids}-text`}
              className={styles.textInput}
              type={step.input}
              inputMode={step.input === "tel" ? "tel" : step.input === "email" ? "email" : undefined}
              autoComplete={step.autoComplete ?? "off"}
              placeholder={step.placeholder}
              maxLength={500}
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
            <button type="submit" className={styles.send} disabled={!text.trim()}>
              <span className="visually-hidden">Send</span>
              <ArrowIcon size="1.25rem" />
            </button>
          </form>
        )}

        {phase === "input" && step?.kind === "single" && (
          <div ref={choicesRef} className={styles.choices} role="group" aria-label={render(step.prompt, answersRef.current)}>
            {step.options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={styles.chip}
                onClick={() => answer(step, option.value, option.label)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {phase === "input" && step?.kind === "multi" && (
          <>
            <div
              ref={choicesRef}
              className={cx(styles.choices, step.options.length > 8 && styles.choicesScroll)}
              role="group"
              aria-label={`${render(step.prompt, answersRef.current)} (choose one or more)`}
            >
              {step.options.map((option) => {
                const on = picked.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={on}
                    className={cx(styles.chip, on && styles.chipOn)}
                    onClick={() =>
                      setPicked((list) => (on ? list.filter((v) => v !== option.value) : [...list, option.value]))
                    }
                  >
                    {on && (
                      <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                        <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {option.label}
                  </button>
                );
              })}
            </div>
            <div className={styles.multiActions}>
              <span className={styles.hint} aria-live="polite">
                {picked.length ? `${picked.length} selected` : "Choose one or more"}
              </span>
              <button
                type="button"
                className={styles.continue}
                disabled={!picked.length}
                onClick={() => {
                  // Keep the options' order, not the click order.
                  const values = step.options.map((o) => o.value).filter((v) => picked.includes(v));
                  answer(step, values, labelsFor(step.options, values));
                }}
              >
                Continue <ArrowIcon size="1rem" />
              </button>
            </div>
          </>
        )}

        {phase === "input" && step?.kind === "file" && (
          <div
            className={cx(styles.drop, dragging && styles.dropActive)}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <input
              ref={fileInputRef}
              id={`${ids}-file`}
              type="file"
              className="visually-hidden"
              tabIndex={-1}
              accept={step.extensions.map((e) => `.${e}`).join(",")}
              onChange={(event) => {
                void onFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            {upload === null ? (
              <>
                <button
                  ref={fileButtonRef}
                  type="button"
                  className={styles.continue}
                  onClick={() => fileInputRef.current?.click()}
                  aria-describedby={`${ids}-file-hint`}
                >
                  Choose file
                </button>
                <span id={`${ids}-file-hint`} className={styles.hint}>
                  or drop it here. PDF, DOC or DOCX, up to {formatBytes(step.maxSize)}.
                </span>
              </>
            ) : (
              <div className={styles.progress} role="status">
                <span className={styles.hint}>Uploading… {Math.round(upload * 100)}%</span>
                <span className={styles.progressTrack} aria-hidden="true">
                  <span className={styles.progressBar} style={{ width: `${Math.round(upload * 100)}%` }} />
                </span>
              </div>
            )}
          </div>
        )}

        {phase === "failed" && (
          <div className={styles.choices}>
            <button type="button" className={cx(styles.chip, styles.chipOn)} onClick={retry}>
              Try again
            </button>
            <button type="button" className={styles.chip} onClick={reset}>
              Start over
            </button>
          </div>
        )}

        {phase === "done" && (
          <div className={styles.done}>
            <ButtonLink href="/" variant="secondary" tall className={styles.home}>
              Return to our Home Page <ArrowIcon size="1.125rem" />
            </ButtonLink>
          </div>
        )}

        {busy && (
          <p className={styles.waiting} aria-hidden="true">
            {phase === "submitting" ? "Sending your details…" : "GoodwillBot is typing…"}
          </p>
        )}
      </div>
    </section>
  );
}
