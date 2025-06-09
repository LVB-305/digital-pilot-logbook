import { z } from "zod";

export const AirportSchema = z.object({
  icao: z.string().min(1, "ICAO code is required."),
  iata: z.string().nullable(),
  name: z.string().min(1, "Airport name is required."),
  city: z.string().min(1, "City is required."),
  state: z.string().nullable(),
  country: z.string().min(1, "Country is required."),
  lat: z.number().nullable(),
  long: z.number().nullable(),
  elevation: z.number().nullable(),
  tz: z.string().nullable(),
  runways: z
    .array(
      z.object({
        ident: z.string(),
        heading: z.number().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        elevation_ft: z.number().int().optional(),
        length_ft: z.number().int().optional(),
        width_ft: z.number().int().optional(),
        displaced_threshold_ft: z.number().int().optional(),
        surface: z.string().optional(),
        lighted: z.boolean().optional(),
        closed: z.boolean().optional(),
      })
    )
    .optional(),
});

export const RunwaySchema = z.object({
  ident: z.string(),
  heading: z.number().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  elevation_ft: z.number().int().optional(),
  length_ft: z.number().int().optional(),
  width_ft: z.number().int().optional(),
  displaced_threshold_ft: z.number().int().optional(),
  surface: z.string().optional(),
  lighted: z.boolean().optional(),
  closed: z.boolean().optional(),
});

export type Airport = z.infer<typeof AirportSchema>;
export type Runway = z.infer<typeof RunwaySchema>;
