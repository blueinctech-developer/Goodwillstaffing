"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { browseMedia, deleteMedia, requestMediaUpload } from "@/app/admin/_actions/media";
import type { MediaItem } from "@/lib/admin/types";
import { mediaUrl } from "@/lib/media";
import styles from "./admin.module.css";
import { ActionButton, cx } from "./ui";

// The media library UI: browse media/ in S3 by folder, upload straight to S3
// with a presigned PUT, and pick an item (editors) or copy/delete (library).

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,application/pdf";

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Upload one file to the media library; resolves to the new item. */
export async function uploadMedia(file: File, onProgress?: (fraction: number) => void): Promise<MediaItem> {
  const ticket = await requestMediaUpload({ name: file.name, type: file.type, size: file.size });
  if (!ticket.ok) throw new Error(ticket.error);
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", ticket.url);
    xhr.setRequestHeader("Content-Type", ticket.contentType);
    xhr.setRequestHeader("Cache-Control", ticket.cacheControl);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    xhr.onload = () =>
      xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status}). Check the bucket's CORS settings.`));
    xhr.onerror = () => reject(new Error("Upload failed. Check the bucket's CORS settings."));
    xhr.send(file);
  });
  return ticket.item;
}

function Thumb({ item }: { item: MediaItem }) {
  if (item.kind === "image") {
    return (
      <span className={styles.thumb}>
        {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary S3 media */}
        <img src={item.url} alt="" loading="lazy" />
      </span>
    );
  }
  return <span className={styles.thumb}>{item.name.split(".").pop()}</span>;
}

export function MediaBrowser({
  onSelect,
  accept,
}: {
  onSelect?: (item: MediaItem) => void;
  accept?: "image" | "video";
}) {
  const [folder, setFolder] = useState("");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, startLoading] = useTransition();
  const [upload, setUpload] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback((nextFolder: string, from: string | null) => {
    startLoading(async () => {
      const page = await browseMedia(nextFolder, from);
      if (!page.ok) {
        setError(page.error);
        return;
      }
      setError(null);
      setItems((prev) => (from ? [...prev, ...page.items] : page.items));
      setCursor(page.nextCursor);
    });
  }, []);

  useEffect(() => load("", null), [load]);

  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    for (const file of Array.from(files)) {
      try {
        const item = await uploadMedia(file, (f) => setUpload(`${file.name}: ${Math.round(f * 100)}%`));
        setItems((prev) => [item, ...prev]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
      }
    }
    setUpload(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const visible = items.filter(
    (item) => (!accept || item.kind === accept) && (!query || item.name.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <div>
      <div className={styles.filters}>
        {/* Not a <form>: the browser also renders inside the editors' forms. */}
        <div className={styles.inline}>
          <label className={styles.field}>
            <span className={styles.label}>Folder</span>
            <input
              className={styles.input}
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                load(folder, null);
              }}
              placeholder="e.g. 2025/01"
            />
          </label>
          <button
            type="button"
            className={cx(styles.button, styles.secondary)}
            disabled={loading}
            onClick={() => load(folder, null)}
          >
            {loading ? "Loading…" : "Show"}
          </button>
        </div>
        <label className={styles.field}>
          <span className={styles.label}>Filter loaded files</span>
          <input
            className={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
            placeholder="File name"
          />
        </label>
        <label className={cx(styles.button)} style={{ marginLeft: "auto" }}>
          {upload ?? "Upload files"}
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT}
            multiple
            hidden
            disabled={upload !== null}
            onChange={(e) => void onUpload(e.target.files)}
          />
        </label>
      </div>
      <p className={cx(styles.hint)} style={{ marginTop: "-0.5rem", marginBottom: "0.75rem" }}>
        Images up to 20 MB, video (MP4/WebM) up to 256 MB, PDF up to 25 MB. New uploads go into this month&apos;s
        folder.
      </p>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.mediaGrid}>
        {visible.map((item) =>
          onSelect ? (
            <button
              key={item.key}
              type="button"
              className={styles.mediaItem}
              onClick={() => onSelect(item)}
              title={item.path}
            >
              <Thumb item={item} />
              <span className={styles.mediaName}>{item.name}</span>
              <span className={styles.muted}>{formatSize(item.size)}</span>
            </button>
          ) : (
            <div key={item.key} className={styles.mediaItem}>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                <Thumb item={item} />
              </a>
              <span className={styles.mediaName} title={item.path}>
                {item.name}
              </span>
              <span className={styles.muted}>
                {formatSize(item.size)} · {item.key.split("/").slice(1, -1).join("/")}
              </span>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={cx(styles.button, styles.secondary, styles.sm)}
                  onClick={() => {
                    void navigator.clipboard.writeText(item.url).then(() => setCopied(item.key));
                  }}
                >
                  {copied === item.key ? "Copied" : "Copy URL"}
                </button>
                <ActionButton
                  action={deleteMedia}
                  fields={{ key: item.key }}
                  variant="danger"
                  confirm={`Delete ${item.name}? Pages or posts that use it will show a broken image.`}
                >
                  Delete
                </ActionButton>
              </div>
            </div>
          ),
        )}
      </div>
      {!loading && visible.length === 0 && !error && <p className={styles.muted}>No files here.</p>}
      {cursor && (
        <p>
          <button
            type="button"
            className={cx(styles.button, styles.secondary)}
            disabled={loading}
            onClick={() => load(folder, cursor)}
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </p>
      )}
    </div>
  );
}

/** Modal media picker used by the editors. */
export function MediaPickerDialog({
  open,
  onClose,
  onSelect,
  accept = "image",
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (item: MediaItem) => void;
  accept?: "image" | "video";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog ref={ref} className={styles.dialog} onClose={onClose}>
      <div className={styles.dialogHead}>
        <strong>Choose {accept === "video" ? "a video" : "an image"}</strong>
        <button type="button" className={cx(styles.button, styles.secondary, styles.sm)} onClick={onClose}>
          Close
        </button>
      </div>
      <div className={styles.dialogBody}>
        {open && (
          <MediaBrowser
            accept={accept}
            onSelect={(item) => {
              onSelect(item);
              onClose();
            }}
          />
        )}
      </div>
    </dialog>
  );
}

export type ImageValue = { src: string; alt?: string; width?: number; height?: number };

/** Read an image's natural size so content keeps width/height (no layout shift). */
function measure(src: string): Promise<{ width?: number; height?: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth || undefined, height: img.naturalHeight || undefined });
    img.onerror = () => resolve({});
    img.src = src;
  });
}

/** Image chooser with preview and alt text; controlled. */
export function ImageField({
  label,
  value,
  onChange,
  withAlt = true,
}: {
  label: string;
  value: ImageValue | undefined;
  onChange: (value: ImageValue | undefined) => void;
  withAlt?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <div className={styles.imageField}>
        {value?.src ? (
          // eslint-disable-next-line @next/next/no-img-element -- preview of arbitrary media
          <img className={styles.imagePreview} src={mediaUrl(value.src)} alt="" />
        ) : (
          <span className={styles.imagePreview} />
        )}
        <div className={styles.actions}>
          <button
            type="button"
            className={cx(styles.button, styles.secondary, styles.sm)}
            onClick={() => setOpen(true)}
          >
            {value?.src ? "Change" : "Choose"}
          </button>
          {value?.src && (
            <button
              type="button"
              className={cx(styles.button, styles.danger, styles.sm)}
              onClick={() => onChange(undefined)}
            >
              Remove
            </button>
          )}
        </div>
      </div>
      {value?.src && <span className={cx(styles.hint, styles.mono)}>{value.src}</span>}
      {withAlt && value?.src && (
        <input
          className={styles.input}
          value={value.alt ?? ""}
          placeholder="Alt text (describe the image)"
          aria-label={`${label} alt text`}
          onChange={(e) => onChange({ ...value, alt: e.target.value })}
        />
      )}
      <MediaPickerDialog
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(item) => {
          const next = { src: item.path, alt: value?.alt ?? "" };
          onChange(next);
          void measure(item.url).then((size) => onChange({ ...next, ...size }));
        }}
      />
    </div>
  );
}
