import { z } from "zod";

export const FlightSchema = z.object({
  id: z.string().uuid(),
  date: z.string(),
  user_id: z.string().uuid(),
  aircraft_id: z.string().uuid(),
  departure_airport_code: z.string(),
  departure_runway: z.string().nullable(),
  destination_airport_code: z.string(),
  destination_runway: z.string().nullable(),
  block_start: z.string().nullable(),
  block_end: z.string().nullable(),
  flight_start: z.string().nullable(),
  flight_end: z.string().nullable(),
  total_block_minutes: z.number().nullable(),
  total_air_minutes: z.number().nullable(),
  remarks: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const SimulatorSessionSchema = z.object({
  id: z.string().uuid(),
  date: z.string(),
  user_id: z.string().uuid(),
  simulator_id: z.string().uuid(),
  session_minutes: z.number(),
  instructor_name: z.string().nullable(),
  remarks: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Flight = z.infer<typeof FlightSchema>;
export type SimulatorSession = z.infer<typeof SimulatorSessionSchema>;

export type FlightListItem = Flight | SimulatorSession;

// Type guards
export const isFlight = (item: FlightListItem): item is Flight => {
  return "departure_airport_code" in item;
};

export const isSimulatorSession = (
  item: FlightListItem
): item is SimulatorSession => {
  return "simulator_id" in item && "session_minutes" in item;
};

// Helper functions
export const getDisplayTime = (item: FlightListItem): string | null => {
  if (isFlight(item)) {
    return item.total_air_minutes
      ? `${Math.floor(item.total_air_minutes / 60)}:${(
          item.total_air_minutes % 60
        )
          .toString()
          .padStart(2, "0")}`
      : null;
  }
  return item.session_minutes
    ? `${Math.floor(item.session_minutes / 60)}:${(item.session_minutes % 60)
        .toString()
        .padStart(2, "0")}`
    : null;
};
