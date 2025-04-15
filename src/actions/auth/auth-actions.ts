"use server";

import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/routes";

export async function createSession(userId: string) {
  // Set session cookie
  (await cookies()).set(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 12 * 60 * 60 * 1000, // 12 hours
  });
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE_NAME);
  (await cookies()).delete("firebase-token");
}

export async function getSession() {
  const session = (await cookies()).get(SESSION_COOKIE_NAME);
  return session?.value;
}
