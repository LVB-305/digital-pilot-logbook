"use server";
import * as z from "zod";
import { ChangePasswordSchema } from "@/schemas/auth/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server/server";

export const changePassword = async (
  values: z.infer<typeof ChangePasswordSchema>
) => {
  const validatedFields = ChangePasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { current_password, password } = validatedFields.data;

  try {
    const supabase = await createServerSupabaseClient();

    // First verify the current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: (await supabase.auth.getUser()).data.user?.email || "",
      password: current_password,
    });

    if (signInError) {
      return { error: "Current password is incorrect" };
    }

    // If current password is correct, update to new password
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      return { error: error.message };
    }

    return { success: "Password updated successfully" };
  } catch (error) {
    return { error: "An unexpected error occurred" };
  }
};
