"use server";
import * as z from "zod";
import { RegisterSchema } from "@/schemas/auth/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server/server";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password } = validatedFields.data;

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    return { success: "User created successfully", redirectTo: "/app/flights" };
  } catch (error) {
    return { error: "An unexpected error occurred" };
  }
};
