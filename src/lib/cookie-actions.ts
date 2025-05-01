"use server";

import { cookies } from "next/headers";

export async function getPreferenceCookie(
  name: string
): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value;
}

export async function setPreferenceCookie(
  name: string,
  value: string
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(name, value, {
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    path: "/",
  });
}
