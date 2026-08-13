import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const ADMIN_SESSION_COOKIE = "qistghar_admin_session";

export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminEmail || !adminPasswordHash) return false;

  if (email !== adminEmail) return false;

  // Support both bcrypt hashes and plaintext for demo
  if (adminPasswordHash.startsWith("$2")) {
    return bcrypt.compareSync(password, adminPasswordHash);
  }
  return password === adminPasswordHash;
}

export async function setAdminSession(rememberMe?: boolean) {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24, // 30 days or 24 hours
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE);
  return session?.value === "authenticated";
}
