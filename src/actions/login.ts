"use server";
import * as z from "zod";
import { LoginSchema } from "@/schemas/auth";

import { signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/lib/firebase";
import { redirect } from "next/navigation";
import { createSession } from "@/actions/auth-actions";

export const login = async (values: z.infer<typeof LoginSchema>) => {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" }
    }

    const { email, password } = validatedFields.data;

    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        if (result) {
            await createSession(result.user.uid);
        }

        return { success: "User logged successfully in"}
        //return [{ success: "User logged successfully in"}, router.push("/logbook")]
    } catch (e) {
        if (e instanceof FirebaseError) {
            switch (e.code) {
                case 'auth/invalid-email':
                    return { error: "Invalid email address"}
                    break
                case 'auth/user-not-found':
                    return { error: "User not found"}
                    break
                case 'auth/wrong-password':
                    return { error: "Incorrect password"}
                    break
                case 'auth/argument-error':
                    return { error: "Bad request, please try again."}
                    break
                default:
                    return { error: e.message }
            }
        }
    }

    redirect('/logbook');
}