"use server";
import * as z from "zod";
import { LoginSchema } from "@/schemas/auth/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server/server";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password } = validatedFields.data;

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    return {
      success: "Logged in successfully",
      redirectTo: "/app/flights",
    };
  } catch (error) {
    console.error("Error logging in:", error);
    return { error: "An unexpected error occurred" };
  }
};
