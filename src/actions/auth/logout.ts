"use server";

import { auth } from "@/lib/firebase";
import { deleteSession } from "@/actions/auth/auth-actions";

export const logout = async () => {
  await auth.signOut();
  await deleteSession();
};
