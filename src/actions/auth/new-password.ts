"use server";
import * as z from "zod";
import { NewPasswordSchema } from "@/schemas/auth/auth";
import { verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { authAdmin } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";

export const newPassword = async (
  values: z.infer<typeof NewPasswordSchema>,
  token?: string | null
) => {
  console.log(token);
  if (!token) {
    return { error: "Missing token!" };
  }
  const validatedFields = NewPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { password } = validatedFields.data;

  const userToken = await verifyPasswordResetCode(auth, token);

  if (!userToken) {
    return { error: "Invalid token!" };
  }

  console.log(userToken);

  const user = await authAdmin.getUserByEmail(userToken);

  if (!user) {
    return { error: "Email does not exist!" };
  }

  try {
    // await updatePassword(user, password)
    await authAdmin.updateUser(user.uid, {
      password: password,
    });

    redirect("/logbook");

    return { success: "Password reset, redirecting..." };
  } catch (e) {
    let errorMessage = "Something went wrong.";

    return { error: `${errorMessage}, ${e}` }; // Fallback to the Firebase error message
  }
};
