"use server";

import * as z from "zod";
import { ResetSchema } from "@/schemas/auth";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { authAdmin } from "@/lib/firebaseAdmin";
import { providerMap } from "@/actions/auth-providers";

// Type guard to check if error is a FirebaseAuthError
function isFirebaseAuthError(error: any): error is { errorInfo: { code: string, message: string } } {
    return error && typeof error === "object" && "errorInfo" in error;
}

export const resetPassword = async (values: z.infer<typeof ResetSchema>) => {
    const validatedFields = ResetSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" }
    }

    const { email } = validatedFields.data;


    try {
        // Get existing user by email (if not error)
        const user = await authAdmin.getUserByEmail(email);

        const externalProviders = Object.values(providerMap).map((provider) => provider.PROVIDER_ID);

        const isExternalProvider = user.providerData.some((provider) => {
            return (externalProviders as readonly string[]).includes(provider.providerId)
        })
        
        if (isExternalProvider) {
            return { error: "Cannot reset password for accounts created with a third party service." } 
        }
        
        // If no user, Firebase will throw an error, so this will only run if the user exists
        // console.log('User found:', user);

        // Send password reset email
        await sendPasswordResetEmail(auth, email);

        return { success: "Reset email sent!" };
    } catch (e) {
        let errorMessage = "Something went wrong.";

        if (isFirebaseAuthError(e)) {
            // Use switch to handle different Firebase errors
            switch (e.errorInfo.code) {
                case "auth/user-not-found":
                    return { error: "No account with this email." };
                    break;
                case "auth/invalid-email":
                    return { error: "The email address is badly formatted." };
                    break;
                case "auth/too-many-requests":
                    return { error: "Too many attempts, please try again later." };
                    break;
                default:
                    return { error: e.errorInfo.message }; // Fallback to the Firebase error message
            }
        }
        return { error: `${errorMessage}, ${e}` }; // Fallback to the Firebase error message
    }
}