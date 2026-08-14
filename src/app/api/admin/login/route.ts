import { NextResponse } from "next/server";
import { verifyAdminCredentials, ADMIN_SESSION_COOKIE } from "@/lib/helpers/admin-auth";

export async function POST(request: Request) {
  try {
    const { email, password, rememberMe } = await request.json();

    const isValid = await verifyAdminCredentials(email, password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Only send the cookie over HTTPS in production (Vercel), but allow
    // plain HTTP when testing a production build locally.
    const proto = request.headers.get("x-forwarded-proto");
    const secure = proto ? proto === "https" : new URL(request.url).protocol === "https:";

    const res = NextResponse.json({ success: true });
    res.cookies.set(ADMIN_SESSION_COOKIE, "authenticated", {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: rememberMe === true ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
