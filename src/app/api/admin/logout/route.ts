import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/helpers/admin-auth";

export async function GET(request: Request) {
  const res = NextResponse.redirect(new URL("/admin/login", request.url));
  res.cookies.set(ADMIN_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
