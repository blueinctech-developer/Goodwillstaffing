import type { Metadata } from "next";
import styles from "@/components/admin/admin.module.css";
import { MediaBrowser } from "@/components/admin/Media";
import { requireAdminPage } from "@/lib/auth/admin";
import { hasS3 } from "@/lib/env";

// Reads the session (or a token) at request time; navigations may block.
export const instant = false;

export const metadata: Metadata = { title: "Media" };

export default async function MediaPage() {
  await requireAdminPage();
  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.h1}>Media library</h1>
      </div>
      {hasS3() ? (
        <div className={styles.card}>
          <MediaBrowser />
        </div>
      ) : (
        <p className={styles.notice}>
          The media library lives in S3. Set <code>S3_BUCKET</code>, <code>S3_REGION</code>,{" "}
          <code>AWS_ACCESS_KEY_ID</code> and <code>AWS_SECRET_ACCESS_KEY</code>, upload the existing files with{" "}
          <code>npm run media:upload</code>, then reload this page.
        </p>
      )}
    </>
  );
}
