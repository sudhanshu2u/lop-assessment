import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const ROLE_ROUTES: Record<string, string[]> = {
  "/dashboard/admin": ["super_admin"],
  "/dashboard/surveys": ["super_admin", "hr_admin"],
  "/dashboard/employees": ["super_admin", "hr_admin"],
  "/dashboard/team": ["super_admin", "hr_admin", "manager"],
};

export default auth((req) => {
  const session = req.auth;
  const path = req.nextUrl.pathname;

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  for (const [prefix, roles] of Object.entries(ROLE_ROUTES)) {
    if (path.startsWith(prefix) && !roles.includes(session.user.role)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!login|api/auth|api/setup|_next/static|_next/image|favicon.ico|public).*)"],
};
