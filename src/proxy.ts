import { NextResponse, type NextRequest } from "next/server";

// Optimistic gate for the admin: no session cookie -> sign-in page. The real
// check (session row, active admin, role) happens in requireAdminPage() and
// requireAdmin() next to the data, so this only saves a render.

const SESSION_COOKIE = "gw_admin_session";
const PUBLIC_ADMIN = /^\/admin\/(login|forgot-password|reset-password|accept-invite)(\/|$)/;

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (!PUBLIC_ADMIN.test(pathname) && !request.cookies.has(SESSION_COOKIE)) {
    const login = new URL("/admin/login/", request.url);
    // Server Action posts keep their URL; only page loads are redirected with a return path.
    if (request.method === "GET" && pathname !== "/admin/") login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }
  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
