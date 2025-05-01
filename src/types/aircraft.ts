import { z } from "zod";

export const AircraftSchema = z.object({
  id: z.string().uuid(),
  registration: z.string(),
  model: z.string(),
  simulator_type: z.string().nullable(),
  is_simulator: z.boolean(),
});

export type Aircraft = z.infer<typeof AircraftSchema>;
