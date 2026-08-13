import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/helpers/admin-auth";

export async function GET() {
  await clearAdminSession();
  return NextResponse.redirect(new URL("/admin/login", process.env.NEXT_PUBLIC_APP_URL));
}
