import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "@/components/admin/admin.module.css";
import { PageEditor } from "@/components/admin/PageEditor";
import { StatusBadge } from "@/components/admin/ui";
import { CUSTOM_COMPONENTS } from "@/components/content/custom";
import { FORMS, getForm } from "@/forms";
import { getPageAdmin } from "@/lib/admin/content";
import { requireAdminPage } from "@/lib/auth/admin";

// Reads the session (or a token) at request time; navigations may block.
export const instant = false;

export const metadata: Metadata = { title: "Edit page" };

export default async function EditPagePage({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdminPage();
  const { slug } = await params;
  const found = await getPageAdmin(decodeURIComponent(slug));
  if (!found) notFound();

  // Imported form blocks reference Gravity Forms numbers; the editor works with form slugs.
  const page = {
    ...found.page,
    blocks: found.page.blocks.map((b) => (b.type === "form" ? { ...b, formId: getForm(b.formId)?.id ?? b.formId } : b)),
  };
  const forms = FORMS.map((f) => ({ value: f.id, label: f.title }));
  const components = Object.keys(CUSTOM_COMPONENTS).map((name) => ({ value: name, label: name }));

  return (
    <>
      <Link className={styles.crumb} href="/admin/pages/">
        ← Pages
      </Link>
      <div className={styles.pageHead}>
        <h1 className={styles.h1}>
          {page.title} <StatusBadge status={found.status} />
        </h1>
        <span className={styles.muted}>/{page.slug}/</span>
      </div>
      <PageEditor page={page} status={found.status} forms={forms} components={components} />
    </>
  );
}
