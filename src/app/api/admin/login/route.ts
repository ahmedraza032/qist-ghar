import { NextResponse } from "next/server";
import { verifyAdminCredentials, setAdminSession } from "@/lib/helpers/admin-auth";

export async function POST(request: Request) {
  try {
    const { email, password, rememberMe } = await request.json();

    const isValid = await verifyAdminCredentials(email, password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await setAdminSession(rememberMe === true);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
