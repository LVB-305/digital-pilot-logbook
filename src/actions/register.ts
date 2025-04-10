"use server";
import * as z from "zod";
import { RegisterSchema } from "@/schemas/auth";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { redirect } from "next/navigation";
import { createSession } from "@/actions/auth-actions";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
    const validatedFields = RegisterSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" }
    }

    const { email, password, confirm_password } = validatedFields.data;

    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        if (result) {
            await createSession(result.user.uid);
        }

        return { success: "User created successfully"}
    } catch (e) {
        let errorMessage;
        if (e instanceof Error) {
          errorMessage = e.message;
          console.log(e.message)
        } else
        return { error: errorMessage}
    }

    redirect('/logbook');
}