import { type NextRequest, NextResponse } from "next/server";
import { adminMiddleware } from "@/lib/supabase/admin-middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes (except login)
  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    !pathname.startsWith("/api/admin")
  ) {
    const adminCheck = await adminMiddleware(request);
    if (adminCheck.status !== 200) return adminCheck;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
