import { NextResponse, type NextRequest } from "next/server";
import { getSubmission } from "@/lib/admin/submissions";
import { presignGet } from "@/lib/aws/s3";
import { getCurrentAdmin } from "@/lib/auth/admin";
import { hasS3 } from "@/lib/env";

// Private upload download: checks the admin session, then redirects to a
// five-minute presigned S3 URL. The object key never appears in the page.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getCurrentAdmin())) return NextResponse.redirect(new URL("/admin/login/", request.url));
  if (!hasS3()) return new NextResponse("S3 is not configured.", { status: 503 });

  const { id } = await params;
  const index = Number.parseInt(request.nextUrl.searchParams.get("i") ?? "", 10);
  const submission = await getSubmission(id);
  const file = submission?.files[index];
  if (!file?.key) return new NextResponse("File not found.", { status: 404 });

  const url = await presignGet(file.key, file.name);
  return NextResponse.redirect(url, { headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
}
