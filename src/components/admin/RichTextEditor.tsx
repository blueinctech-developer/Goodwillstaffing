"use client";

import Image from "@tiptap/extension-image";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";
import { mediaUrl, rewriteMediaInHtml } from "@/lib/media";
import styles from "./admin.module.css";
import { MediaPickerDialog } from "./Media";
import { cx } from "./ui";

// Tiptap editor for post bodies and rich blocks. It emits the same small set
// of tags the WordPress import produced (p, h2-h4, lists, links, images,
// blockquote, hr), so the site's .prose styles apply unchanged. The server
// sanitizes again on save (src/lib/sanitize.ts), which also turns displayed
// media URLs back into "/media/..." paths.

type Props = {
  /** Initial HTML (as stored). */
  value: string;
  onChange: (html: string) => void;
  /** Taller editing area for full posts. */
  tall?: boolean;
  label?: string;
};

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={styles.rteButton}
      aria-pressed={active ?? undefined}
      aria-label={label}
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor, onImage }: { editor: Editor; onImage: () => void }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      h4: e.isActive("heading", { level: 4 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
    }),
  });

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("Link URL (e.g. /contact-us/ or https://…). Leave empty to remove.", previous ?? "");
    if (href === null) return;
    if (href.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const external = /^https?:\/\//i.test(href) && !href.includes("goodwillstaffing.ca");
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: href.trim(), target: external ? "_blank" : null })
      .run();
  };

  const chain = () => editor.chain().focus();
  return (
    <div className={styles.rteToolbar} role="toolbar" aria-label="Formatting">
      <ToolbarButton label="Bold" active={state.bold} onClick={() => chain().toggleBold().run()}>
        B
      </ToolbarButton>
      <ToolbarButton label="Italic" active={state.italic} onClick={() => chain().toggleItalic().run()}>
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton label="Heading 2" active={state.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}>
        H2
      </ToolbarButton>
      <ToolbarButton label="Heading 3" active={state.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()}>
        H3
      </ToolbarButton>
      <ToolbarButton label="Heading 4" active={state.h4} onClick={() => chain().toggleHeading({ level: 4 }).run()}>
        H4
      </ToolbarButton>
      <ToolbarButton label="Bulleted list" active={state.bullet} onClick={() => chain().toggleBulletList().run()}>
        • List
      </ToolbarButton>
      <ToolbarButton label="Numbered list" active={state.ordered} onClick={() => chain().toggleOrderedList().run()}>
        1. List
      </ToolbarButton>
      <ToolbarButton label="Quote" active={state.quote} onClick={() => chain().toggleBlockquote().run()}>
        “ ”
      </ToolbarButton>
      <ToolbarButton label="Link" active={state.link} onClick={setLink}>
        Link
      </ToolbarButton>
      <ToolbarButton label="Insert image" onClick={onImage}>
        Image
      </ToolbarButton>
      <ToolbarButton label="Divider" onClick={() => chain().setHorizontalRule().run()}>
        ―
      </ToolbarButton>
      <ToolbarButton label="Clear formatting" onClick={() => chain().unsetAllMarks().clearNodes().run()}>
        Clear
      </ToolbarButton>
      <ToolbarButton label="Undo" onClick={() => chain().undo().run()}>
        Undo
      </ToolbarButton>
      <ToolbarButton label="Redo" onClick={() => chain().redo().run()}>
        Redo
      </ToolbarButton>
    </div>
  );
}

export function RichTextEditor({ value, onChange, tall, label }: Props) {
  const [picking, setPicking] = useState(false);
  const editor = useEditor({
    // Rendered on the client only; avoids hydration mismatches.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        code: false,
        codeBlock: false,
        strike: false,
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: null, target: null } },
      }),
      Image.configure({ inline: false }),
    ],
    // Show media from wherever it is served (S3 in production).
    content: rewriteMediaInHtml(value),
    editorProps: { attributes: { "aria-label": label ?? "Content", class: "prose" } },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? "" : e.getHTML()),
  });

  return (
    <div className={cx(styles.rte, tall && styles.rteTall)}>
      {editor && <Toolbar editor={editor} onImage={() => setPicking(true)} />}
      <div className={styles.rteContent}>
        <EditorContent editor={editor} />
      </div>
      <MediaPickerDialog
        open={picking}
        onClose={() => setPicking(false)}
        onSelect={(item) => {
          const alt = window.prompt("Alt text for this image (describe it for screen readers):", "") ?? "";
          editor
            ?.chain()
            .focus()
            .setImage({ src: mediaUrl(item.path), alt })
            .run();
        }}
      />
    </div>
  );
}
