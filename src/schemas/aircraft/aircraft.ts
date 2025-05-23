import { z } from "zod";

export const aircraftTypeSchema = z.object({
  model: z.string(),
  type: z.string(),
  manufacturer: z.string(),
  category: z.enum(["single-pilot", "multi-pilot"]).default("single-pilot"),
  engine_count: z.number().int().min(0).default(1),
  engine_type: z
    .enum(["piston", "turboprop", "jet", "electric"])
    .default("piston"),
  passenger_seats: z.number().int().min(0).default(0),
});

export type AircraftType = z.infer<typeof aircraftTypeSchema>;

export const aircraftTypesArraySchema = z.array(aircraftTypeSchema);
