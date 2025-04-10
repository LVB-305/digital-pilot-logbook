"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
    DEFAULT_REDIRECT,
    SESSION_COOKIE_NAME,
} from "@/routes";

export async function createSession(uid: string) {
    (await cookies()).set(SESSION_COOKIE_NAME, uid, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3 * 60 * 60 * 24, // Duration in seconds (3 days)
        path: "/",
    });

    redirect(DEFAULT_REDIRECT);
}

export async function removeSession() {
    (await cookies()).delete(SESSION_COOKIE_NAME);

    redirect('/')
}