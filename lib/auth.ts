import crypto from "crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

const COOKIE_NAME = "nr_admin_session";

function sign(value: string) {
  return crypto.createHmac("sha256", env.adminSessionSecret).update(value).digest("hex");
}

export function createAdminToken(username: string) {
  const payload = `${username}.${Date.now()}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifyAdminToken(token?: string | null) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length < 3) return false;
  const signature = parts.pop()!;
  const payload = parts.join(".");
  return sign(payload) === signature;
}

export async function requireAdmin() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!verifyAdminToken(token)) return false;
  return true;
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
