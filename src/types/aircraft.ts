import { z } from "zod";
import { Building, Plane } from "lucide-react";

export const AircraftSchema = z.object({
  registration: z.string().min(1, "Registration is required."),
  is_simulator: z.boolean(),
  type: z.string().nullable(),
  model: z.string().nullable(),
  manufacturer: z.string().nullable(),
  category: z.string(), // refine Single Pilot - Single Engine
  engine_count: z.number().int(),
  engine_type: z.string().nullable(),
  passenger_seats: z.number().int(),
  operator: z.string().nullable(),
  status: z.string().nullable(),
  note: z.string().nullable(),
});

export const BaseSchema = AircraftSchema.extend({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
});

export const SubmitSchema = BaseSchema.extend({
  created_at: z.string(),
  updated_at: z.string(),
});

export type Aircraft = z.infer<typeof BaseSchema>;
export type AircraftForm = z.infer<typeof AircraftSchema>;
export type AircraftFormSubmit = z.infer<typeof SubmitSchema>;

interface Column {
  key: keyof Aircraft;
  label: string;
  sortable?: boolean;
  sortType?: "string" | "number" | "date";
  width?: string;
  formatFn?: (item: Aircraft) => string;
}

export const columns: Column[] = [
  {
    key: "is_simulator",
    label: "Type",
    formatFn: (item: Aircraft) =>
      item.is_simulator ? "<div><Building /></div>" : "<div><Plane /></div>",
  },
  {
    key: "registration",
    label: "Registration",
    sortable: true,
    sortType: "string",
  },
  {
    key: "model",
    label: "Model",
    sortable: false,
    sortType: "string",
  },
  {
    key: "manufacturer",
    label: "Manufacturer",
    sortable: false,
    sortType: "string",
  },
  {
    key: "operator",
    label: "Operator",
    sortable: false,
    sortType: "string",
  },
];
