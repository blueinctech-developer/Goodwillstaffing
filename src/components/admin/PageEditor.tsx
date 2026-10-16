"use client";

import { useActionState, useMemo, useState, type ReactNode } from "react";
import { savePage } from "@/app/admin/_actions/pages";
import { IDLE } from "@/lib/admin/types";
import type { Block, Card, Cta, HeroLayout, Image, Page } from "@/lib/content";
import styles from "./admin.module.css";
import { ImageField, MediaPickerDialog } from "./Media";
import { RichTextEditor } from "./RichTextEditor";
import { ActionMessage, SubmitButton, cx } from "./ui";

// Page editor: title, SEO, hero and the ordered block list. The whole page is
// posted as one JSON payload; the server validates it against
// src/lib/admin/content-schema.ts (and sanitizes rich HTML) before saving.

type BlockType = Block["type"];
type Keyed = { id: string; block: Block };
type Option = { value: string; label: string };

let counter = 0;
const newId = () => `b${++counter}-${Date.now().toString(36)}`;

const BLOCK_LABELS: Record<BlockType, string> = {
  heading: "Heading",
  rich: "Text",
  image: "Image",
  buttons: "Buttons",
  cards: "Cards",
  stats: "Stats",
  list: "Link list",
  faq: "FAQ",
  video: "Video",
  gallery: "Gallery",
  form: "Form",
  reviews: "Google reviews",
  posts: "Latest posts",
  custom: "Custom component",
};

function emptyBlock(type: BlockType, forms: Option[], components: Option[]): Block {
  switch (type) {
    case "heading":
      return { type, level: 2, text: "" };
    case "rich":
      return { type, html: "" };
    case "image":
      return { type, src: "", alt: "" };
    case "buttons":
      return { type, items: [{ text: "", href: "" }] };
    case "cards":
      return { type, items: [{ title: "", text: "" }] };
    case "stats":
      return { type, items: [{ value: "", label: "" }] };
    case "list":
      return { type, items: [{ text: "" }] };
    case "faq":
      return { type, items: [{ question: "", answer: "" }] };
    case "video":
      return { type };
    case "gallery":
      return { type, images: [] };
    case "form":
      return { type, formId: forms[0]?.value ?? "contact" };
    case "custom":
      return { type, component: components[0]?.value ?? "" };
    default:
      return { type } as Block;
  }
}

function summary(block: Block): string {
  switch (block.type) {
    case "heading":
      return block.text;
    case "rich":
      return block.html
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    case "image":
      return block.alt || block.src;
    case "buttons":
    case "list":
      return block.items.map((i) => i.text).join(" · ");
    case "cards":
      return block.items.map((i) => i.title).join(" · ");
    case "stats":
      return block.items.map((i) => `${i.value} ${i.label}`).join(" · ");
    case "faq":
      return `${block.items.length} questions`;
    case "gallery":
      return `${block.images.length} images`;
    case "form":
      return String(block.formId);
    case "custom":
      return block.component;
    default:
      return "";
  }
}

// ------------------------------------------------------------- small inputs

function Text({
  label,
  value,
  onChange,
  multiline,
  placeholder,
  hint,
}: {
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      {multiline ? (
        <textarea
          className={styles.textarea}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={styles.input}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
        />
      )}
      {hint && <span className={styles.hint}>{hint}</span>}
    </label>
  );
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Ordered list of sub-items (cards, buttons, FAQ entries…) with add/remove/reorder. */
function Items<T>({
  items,
  onChange,
  create,
  noun,
  render,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  create: () => T;
  noun: string;
  render: (item: T, update: (patch: Partial<T>) => void) => ReactNode;
}) {
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} className={styles.item}>
          <div className={styles.itemHead}>
            <span>
              {noun} {i + 1}
            </span>
            <span className={styles.actions}>
              <button
                type="button"
                className={cx(styles.button, styles.secondary, styles.sm)}
                onClick={() => onChange(move(items, i, i - 1))}
                disabled={i === 0}
                aria-label={`Move ${noun} ${i + 1} up`}
              >
                ↑
              </button>
              <button
                type="button"
                className={cx(styles.button, styles.secondary, styles.sm)}
                onClick={() => onChange(move(items, i, i + 1))}
                disabled={i === items.length - 1}
                aria-label={`Move ${noun} ${i + 1} down`}
              >
                ↓
              </button>
              <button
                type="button"
                className={cx(styles.button, styles.danger, styles.sm)}
                onClick={() => onChange(items.filter((_, j) => j !== i))}
              >
                Remove
              </button>
            </span>
          </div>
          {render(item, (patch) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it))))}
        </div>
      ))}
      <button
        type="button"
        className={cx(styles.button, styles.secondary, styles.sm)}
        onClick={() => onChange([...items, create()])}
      >
        Add {noun.toLowerCase()}
      </button>
    </div>
  );
}

function CtaItems({ items, onChange }: { items: Cta[]; onChange: (items: Cta[]) => void }) {
  return (
    <Items
      items={items}
      onChange={onChange}
      create={() => ({ text: "", href: "" })}
      noun="Button"
      render={(item, update) => (
        <div className={styles.grid2}>
          <Text label="Text" value={item.text} onChange={(text) => update({ text })} />
          <Text label="Link" value={item.href} onChange={(href) => update({ href })} placeholder="/contact-us/" />
        </div>
      )}
    />
  );
}

function VideoPicker({ value, onChange }: { value: string | undefined; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.field}>
      <span className={styles.label}>Video file</span>
      <div className={styles.inline}>
        <input
          className={styles.input}
          style={{ flex: 1 }}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/media/2025/01/clip.mp4"
        />
        <button type="button" className={cx(styles.button, styles.secondary, styles.sm)} onClick={() => setOpen(true)}>
          Choose
        </button>
      </div>
      <MediaPickerDialog
        open={open}
        accept="video"
        onClose={() => setOpen(false)}
        onSelect={(item) => onChange(item.path)}
      />
    </div>
  );
}

// ------------------------------------------------------------- block editor

function BlockFields({
  block,
  onChange,
  forms,
  components,
}: {
  block: Block;
  onChange: (block: Block) => void;
  forms: Option[];
  components: Option[];
}) {
  switch (block.type) {
    case "heading":
      return (
        <div className={styles.inline}>
          <label className={styles.field}>
            <span className={styles.label}>Level</span>
            <select
              className={styles.select}
              value={block.level}
              onChange={(e) => onChange({ ...block, level: Number(e.target.value) })}
            >
              {[1, 2, 3, 4, 5, 6].map((l) => (
                <option key={l} value={l}>
                  H{l}
                </option>
              ))}
            </select>
          </label>
          <div style={{ flex: 1, minWidth: "14rem" }}>
            <Text label="Text" value={block.text} onChange={(text) => onChange({ ...block, text })} />
          </div>
        </div>
      );
    case "rich":
      return <RichTextEditor value={block.html} onChange={(html) => onChange({ ...block, html })} />;
    case "image":
      return (
        <>
          <ImageField
            label="Image"
            value={block.src ? block : undefined}
            onChange={(img) =>
              onChange({ ...block, src: img?.src ?? "", alt: img?.alt ?? "", width: img?.width, height: img?.height })
            }
          />
          <Text label="Link (optional)" value={block.href} onChange={(href) => onChange({ ...block, href })} />
        </>
      );
    case "buttons":
      return <CtaItems items={block.items} onChange={(items) => onChange({ ...block, items })} />;
    case "cards":
      return (
        <Items<Card>
          items={block.items}
          onChange={(items) => onChange({ ...block, items })}
          create={() => ({ title: "", text: "" })}
          noun="Card"
          render={(card, update) => (
            <>
              <Text label="Title" value={card.title} onChange={(title) => update({ title })} />
              <Text label="Text" value={card.text} onChange={(text) => update({ text })} multiline />
              <div className={styles.grid2}>
                <Text label="Link (optional)" value={card.href} onChange={(href) => update({ href })} />
                <Text label="Link text (optional)" value={card.cta} onChange={(cta) => update({ cta })} />
              </div>
              <ImageField label="Image (optional)" value={card.image} onChange={(image) => update({ image })} />
            </>
          )}
        />
      );
    case "stats":
      return (
        <Items
          items={block.items}
          onChange={(items) => onChange({ ...block, items })}
          create={() => ({ value: "", label: "" })}
          noun="Stat"
          render={(item, update) => (
            <div className={styles.grid2}>
              <Text label="Value" value={item.value} onChange={(value) => update({ value })} placeholder="500+" />
              <Text label="Label" value={item.label} onChange={(label) => update({ label })} />
            </div>
          )}
        />
      );
    case "list":
      return (
        <Items<{ text: string; href?: string }>
          items={block.items}
          onChange={(items) => onChange({ ...block, items })}
          create={() => ({ text: "" })}
          noun="Item"
          render={(item, update) => (
            <div className={styles.grid2}>
              <Text label="Text" value={item.text} onChange={(text) => update({ text })} />
              <Text label="Link (optional)" value={item.href} onChange={(href) => update({ href })} />
            </div>
          )}
        />
      );
    case "faq":
      return (
        <Items
          items={block.items}
          onChange={(items) => onChange({ ...block, items })}
          create={() => ({ question: "", answer: "" })}
          noun="Question"
          render={(item, update) => (
            <>
              <Text label="Question" value={item.question} onChange={(question) => update({ question })} />
              <div className={styles.field}>
                <span className={styles.label}>Answer</span>
                <RichTextEditor value={item.answer} onChange={(answer) => update({ answer })} />
              </div>
            </>
          )}
        />
      );
    case "video":
      return (
        <>
          <Text
            label="YouTube video id"
            value={block.youtubeId}
            onChange={(youtubeId) => onChange({ ...block, youtubeId })}
            hint="The part after v= in the YouTube URL. Leave empty to use a video file."
          />
          <VideoPicker value={block.src} onChange={(src) => onChange({ ...block, src })} />
        </>
      );
    case "gallery":
      return (
        <Items<Image>
          items={block.images}
          onChange={(images) => onChange({ ...block, images })}
          create={() => ({ src: "", alt: "" })}
          noun="Image"
          render={(image, update) => (
            <ImageField
              label="Image"
              value={image.src ? image : undefined}
              onChange={(img) => update(img ?? { src: "", alt: "" })}
            />
          )}
        />
      );
    case "form":
      return (
        <label className={styles.field}>
          <span className={styles.label}>Form</span>
          <select
            className={styles.select}
            value={String(block.formId)}
            onChange={(e) => onChange({ ...block, formId: e.target.value })}
          >
            {forms.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
      );
    case "custom":
      return (
        <label className={styles.field}>
          <span className={styles.label}>Component</span>
          <select
            className={styles.select}
            value={block.component}
            onChange={(e) => onChange({ ...block, component: e.target.value })}
          >
            {components.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      );
    default:
      return <p className={styles.muted}>This block has no settings.</p>;
  }
}

// ------------------------------------------------------------- page

export function PageEditor({
  page,
  status,
  forms,
  components,
}: {
  page: Page;
  status: "published" | "draft";
  forms: Option[];
  components: Option[];
}) {
  const [state, formAction] = useActionState(savePage.bind(null, page.slug), IDLE);
  const [title, setTitle] = useState(page.title);
  const [pageStatus, setPageStatus] = useState(status);
  const [seo, setSeo] = useState(page.seo);
  const [hero, setHero] = useState(page.hero);
  const [blocks, setBlocks] = useState<Keyed[]>(() => page.blocks.map((block) => ({ id: newId(), block })));
  const [addType, setAddType] = useState<BlockType>("rich");

  const payload = useMemo(
    () => JSON.stringify({ title, status: pageStatus, seo, hero, blocks: blocks.map((b) => b.block) }),
    [title, pageStatus, seo, hero, blocks],
  );

  const errors = state.status === "error" ? (state.errors ?? {}) : {};
  const blockErrors = (i: number) =>
    Object.entries(errors)
      .filter(([k]) => k.startsWith(`blocks.${i}.`) || k === `blocks.${i}`)
      .map(([k, v]) => `${k.split(".").slice(2).join(" › ") || "block"}: ${v}`);

  const update = (i: number, block: Block) => setBlocks((prev) => prev.map((b, j) => (j === i ? { ...b, block } : b)));
  const insert = (at: number) =>
    setBlocks((prev) => [
      ...prev.slice(0, at),
      { id: newId(), block: emptyBlock(addType, forms, components) },
      ...prev.slice(at),
    ]);

  return (
    <form action={formAction}>
      <input type="hidden" name="payload" value={payload} />
      <ActionMessage state={state} />
      <div className={styles.editorGrid}>
        <div className={styles.stack}>
          <div className={styles.card}>
            <h2 className={styles.h2}>Hero</h2>
            <Text label="Title" value={hero.title} onChange={(v) => setHero({ ...hero, title: v })} />
            <div className={styles.grid2}>
              <Text
                label="Eyebrow (optional)"
                value={hero.eyebrow}
                onChange={(v) => setHero({ ...hero, eyebrow: v })}
              />
              <label className={styles.field}>
                <span className={styles.label}>Layout</span>
                <select
                  className={styles.select}
                  value={hero.layout ?? "plain"}
                  onChange={(e) => setHero({ ...hero, layout: e.target.value as HeroLayout })}
                >
                  <option value="cover">Photo behind text</option>
                  <option value="split">Text beside photo</option>
                  <option value="plain">Teal band, no photo</option>
                </select>
              </label>
            </div>
            <Text
              label="Subtitle (optional)"
              value={hero.subtitle}
              onChange={(v) => setHero({ ...hero, subtitle: v })}
              multiline
            />
            <ImageField
              label="Background image (optional)"
              value={hero.image}
              onChange={(image) => setHero({ ...hero, image })}
            />
            <span className={styles.label}>Buttons</span>
            <CtaItems items={hero.ctas} onChange={(ctas) => setHero({ ...hero, ctas })} />
          </div>

          <div className={styles.card}>
            <h2 className={styles.h2}>Content blocks</h2>
            <div className={styles.blockList}>
              {blocks.map(({ id, block }, i) => {
                const problems = blockErrors(i);
                return (
                  <section
                    key={id}
                    className={styles.block}
                    style={problems.length ? { borderColor: "#b42318" } : undefined}
                  >
                    <div className={styles.blockHead}>
                      <span className={styles.blockTitle}>
                        {i + 1}. {BLOCK_LABELS[block.type]}
                        <span className={styles.blockSummary}>{summary(block).slice(0, 70)}</span>
                      </span>
                      <span className={styles.actions}>
                        <button
                          type="button"
                          className={cx(styles.button, styles.secondary, styles.sm)}
                          disabled={i === 0}
                          onClick={() => setBlocks((p) => move(p, i, i - 1))}
                          aria-label={`Move block ${i + 1} up`}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className={cx(styles.button, styles.secondary, styles.sm)}
                          disabled={i === blocks.length - 1}
                          onClick={() => setBlocks((p) => move(p, i, i + 1))}
                          aria-label={`Move block ${i + 1} down`}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className={cx(styles.button, styles.secondary, styles.sm)}
                          onClick={() => insert(i + 1)}
                          title={`Insert a ${BLOCK_LABELS[addType]} block below`}
                        >
                          + Below
                        </button>
                        <button
                          type="button"
                          className={cx(styles.button, styles.danger, styles.sm)}
                          onClick={() =>
                            window.confirm(`Remove this ${BLOCK_LABELS[block.type].toLowerCase()} block?`) &&
                            setBlocks((p) => p.filter((b) => b.id !== id))
                          }
                        >
                          Remove
                        </button>
                      </span>
                    </div>
                    <div className={styles.blockBody}>
                      {problems.map((p) => (
                        <p key={p} className={styles.fieldError}>
                          {p}
                        </p>
                      ))}
                      <BlockFields block={block} onChange={(b) => update(i, b)} forms={forms} components={components} />
                    </div>
                  </section>
                );
              })}
              <div className={styles.addRow}>
                <label className={styles.inline}>
                  <span className={styles.label}>New block</span>
                  <select
                    className={styles.select}
                    style={{ width: "auto" }}
                    value={addType}
                    onChange={(e) => setAddType(e.target.value as BlockType)}
                  >
                    {(Object.keys(BLOCK_LABELS) as BlockType[])
                      .filter((t) => t !== "custom" || components.length > 0)
                      .map((t) => (
                        <option key={t} value={t}>
                          {BLOCK_LABELS[t]}
                        </option>
                      ))}
                  </select>
                </label>
                <button
                  type="button"
                  className={cx(styles.button, styles.secondary, styles.sm)}
                  onClick={() => insert(blocks.length)}
                >
                  Add at end
                </button>
                <span className={styles.hint}>“+ Below” on a block inserts the selected type after it.</span>
              </div>
            </div>
          </div>
        </div>

        <div className={cx(styles.stack, styles.sticky)}>
          <div className={styles.card}>
            <Text label="Page title (admin and breadcrumbs)" value={title} onChange={setTitle} />
            <label className={styles.field}>
              <span className={styles.label}>Status</span>
              <select
                className={styles.select}
                value={pageStatus}
                onChange={(e) => setPageStatus(e.target.value as "published" | "draft")}
              >
                <option value="published">Published</option>
                <option value="draft">Draft (hidden from the site)</option>
              </select>
            </label>
            <div className={styles.actions}>
              <SubmitButton>Save</SubmitButton>
              {status === "published" && (
                <a
                  className={cx(styles.button, styles.secondary)}
                  href={page.slug === "home" ? "/" : `/${page.slug}/`}
                  target="_blank"
                  rel="noopener"
                >
                  View
                </a>
              )}
            </div>
          </div>
          <div className={styles.card}>
            <h2 className={styles.h2}>SEO</h2>
            <Text label="SEO title" value={seo.title} onChange={(v) => setSeo({ ...seo, title: v })} />
            <Text
              label="Description"
              value={seo.description}
              onChange={(v) => setSeo({ ...seo, description: v })}
              multiline
              hint="About 150 characters."
            />
            <ImageField
              label="Social image"
              value={seo.image}
              onChange={(image) => setSeo({ ...seo, image })}
              withAlt={false}
            />
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={Boolean(seo.noindex)}
                onChange={(e) => setSeo({ ...seo, noindex: e.target.checked })}
              />
              Hide from search engines (noindex)
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
