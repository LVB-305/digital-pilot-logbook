import { createClient } from "@/lib/supabase/client/client";

interface UserProfile {
  [key: string]: string | null;
}

export async function fetchFieldValue(field: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Handle email field from auth
  if (field === "email") {
    return user.email;
  }

  // All other fields from profiles table
  const { data } = (await supabase
    .from("profiles")
    .select(field)
    .eq("id", user.id)
    .single()) as { data: UserProfile | null };

  return data?.[field] || null;
}
