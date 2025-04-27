"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server/server";
import { providerMap } from "@/lib/auth/constants/providers";
import { redirect } from "next/navigation";

export const socialAuthentication = async (
  service: keyof typeof providerMap
) => {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: providerMap[service],
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) {
      console.error("Error during social auth:", error?.message);
      return { error: error?.message };
    }

    if (data?.url) {
      return { url: data.url };
    }

    return { success: "Logged in successfully", redirectTo: "/app/flights" };
  } catch (e) {
    console.error("Error during social auth:", e);
    return { error: "An unexpected error occurred" };
  }
};
