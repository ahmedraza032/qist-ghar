import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/helpers/admin-auth";

export async function GET(request: Request) {
  await clearAdminSession();
  return NextResponse.redirect(new URL("/admin/login", request.url));
}
