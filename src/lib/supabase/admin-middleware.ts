import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

const ADMIN_SESSION_COOKIE = "qistghar_admin_session";

export async function adminMiddleware(request: NextRequest) {
  const adminSession = request.cookies.get(ADMIN_SESSION_COOKIE);

  if (!adminSession || adminSession.value !== "authenticated") {
    return NextResponse.redirect(
      new URL("/admin/login", request.url)
    );
  }

  return NextResponse.next();
}
