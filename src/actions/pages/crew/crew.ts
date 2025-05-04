import { z } from "zod";
import { CrewSubmitSchema, CrewFormSchema } from "@/types/crew";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/lib/supabase/client/client";

type CrewSubmitType = z.infer<typeof CrewSubmitSchema>;
type CrewFormType = z.infer<typeof CrewFormSchema>;

export async function createCrew(crew: CrewFormType): Promise<CrewSubmitType> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const now = new Date().toISOString();
  const newCrew = {
    ...crew,
    id: uuidv4(),
    user_id: user.id,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("pilots")
    .insert([newCrew])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCrew(
  crew: CrewSubmitType
): Promise<CrewSubmitType> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pilots")
    .update(crew)
    .eq("id", crew.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCrew(id: string): Promise<CrewSubmitType> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pilots")
    .select()
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCrew(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("pilots").delete().eq("id", id);

  if (error) throw error;
}
