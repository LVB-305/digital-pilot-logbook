"use server";

import { auth } from "@/lib/firebase";
import { removeSession } from "@/actions/auth-actions";

export const logout = async () => {
    await auth.signOut();
    await removeSession();
}