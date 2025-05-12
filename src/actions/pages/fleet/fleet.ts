import { createClient } from "@/lib/supabase/client/client";
import { AircraftForm, AircraftFormSubmit } from "@/types/aircraft";
import { v4 as uuidv4 } from "uuid";

export async function createAircraft(
  aircraft: AircraftForm
): Promise<AircraftFormSubmit> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const now = new Date().toISOString();

  const newAircraft = {
    ...aircraft,
    id: uuidv4(),
    user_id: user.id,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("fleet")
    .insert([newAircraft])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAircraft(
  aircraft: AircraftFormSubmit
): Promise<AircraftFormSubmit> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("fleet")
    .update(aircraft)
    .eq("id", aircraft.id)
    .select()
    .single();

  if (!data) throw new Error("Aircraft not found");
  if (data.user_id !== user.id) throw new Error("Unauthorized");

  if (error) throw error;
  return data;
}

export async function getAircraft(id: string): Promise<AircraftFormSubmit> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("fleet")
    .select()
    .eq("id", id)
    .single();

  if (!data) throw new Error("Aircraft not found");
  if (data.user_id !== user.id) throw new Error("Unauthorized");

  if (error) throw error;
  return data;
}

export async function deleteAircraft(id: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const { data: aircraft } = await supabase
    .from("fleet")
    .select()
    .eq("id", id)
    .single();

  if (!aircraft) throw new Error("Aircraft not found");
  if (aircraft.user_id !== user.id) throw new Error("Unauthorized");

  const { error } = await supabase.from("fleet").delete().eq("id", id);

  if (error) throw error;
}
