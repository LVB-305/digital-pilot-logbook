import { z } from "zod";
import { Aircraft } from "./aircraft";

export const FlightSchema = z.object({
  id: z.string().uuid(),
  date: z.string(),
  user_id: z.string().uuid(),
  aircraft_id: z.string().uuid(),
  // Route info
  departure_airport_code: z.string(),
  departure_runway: z.string().nullable(),
  destination_airport_code: z.string(),
  destination_runway: z.string().nullable(),

  // Time info
  block_start: z.string(),
  block_end: z.string(),
  flight_start: z.string().nullable(),
  flight_end: z.string().nullable(),
  scheduled_start: z.string().nullable(),
  scheduled_end: z.string().nullable(),
  duty_start: z.string().nullable(),
  duty_end: z.string().nullable(),

  // Durations
  total_block_minutes: z.number(),
  total_air_minutes: z.number().nullable(),
  night_time_minutes: z.number().int().nullable(),
  ifr_time_minutes: z.number().int().nullable(),
  xc_time_minutes: z.number().int().nullable(),
  pic_time_minutes: z.number().int().nullable(),
  dual_time_minutes: z.number().int().nullable(),
  copilot_time_minutes: z.number().int().nullable(),
  instructor_time_minutes: z.number().int().nullable(),

  // Manoeuvers
  day_takeoffs: z.number().int(),
  night_takeoffs: z.number().int(),
  day_landings: z.number().int(),
  night_landings: z.number().int(),
  autolands: z.number().int().nullable(),
  go_arounds: z.number().int().nullable(),

  // Info
  is_solo: z.boolean().nullable(),
  is_spic: z.boolean().nullable(),
  is_picus: z.boolean().nullable(),
  pic_name: z.string().nullable(),
  hobbs_start: z.number().nullable(),
  hobbs_end: z.number().nullable(),
  tach_start: z.number().nullable(),
  tach_end: z.number().nullable(),
  fuel: z.number().int().nullable(),
  passengers: z.number().int().nullable(),

  // Other
  remarks: z.string().nullable(),
  training_description: z.string().nullable(),
  // ENDORSEMENT
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
  hobbs_start: z.number().nullable(),
  hobbs_end: z.number().nullable(),
  remarks: z.string().nullable(),
  training_description: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Flight = z.infer<typeof FlightSchema>;
export type SimulatorSession = z.infer<typeof SimulatorSessionSchema>;

export type FlightItem = Flight | SimulatorSession;

// Type guards
export const isFlight = (item: FlightItem): item is Flight => {
  return "departure_airport_code" in item;
};

export const isSimulatorSession = (
  item: FlightItem
): item is SimulatorSession => {
  return "simulator_id" in item && "session_minutes" in item;
};

// Utility functions for formatting
export const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins.toString().padStart(2, "0")}`;
};

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatTimeString = (timeStr: string | null) => {
  if (!timeStr) return null;
  return timeStr.substring(0, 5); // Takes "14:30:00" and returns "14:30"
};

export const formatLocation = (location: string, runway?: string) => {
  // Handle missing airport with runway
  if (!location && runway) {
    return `-/${runway}`;
  }
  // Only add the runway with separator if runway is provided
  return runway && runway.trim() ? `${location}/${runway}` : location || "-";
};

export const formatMovement = (day: number, night: number) => {
  const dayStr = day > 0 ? `${day} D` : "";
  const nightStr = night > 0 ? `${night} N` : "";
  return dayStr && nightStr ? `${dayStr} / ${nightStr}` : dayStr || nightStr;
};

// Helper functions
export const getDisplayTime = (item: FlightItem): string | null => {
  if (isFlight(item)) {
    return item.total_block_minutes
      ? `${Math.floor(item.total_block_minutes / 60)}:${(
          item.total_block_minutes % 60
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

// This type represents all possible keys that could exist in either Flight or SimulatorSession
export type FlightKeys = keyof Flight | keyof SimulatorSession;

// This type represents columns that combine or transform existing fields
export type VirtualColumns =
  | "departure" // departure ICAO code and runway
  | "destination" // destination ICAO code and runway
  | "takeoffs" // total takeoffs
  | "landings" // total landings
  | "function"; // function (PIC, CoPilot, Dual, Instructor, solo, spic, picus [special]);

// Combined type for all possible column keys
export type ColumnKey = FlightKeys | VirtualColumns;

interface Column {
  key: ColumnKey;
  label: string;
  sortable?: boolean;
  sortType?: "string" | "number" | "date" | "time" | "boolean";
  hiddenByDefault?: boolean;
  width?: string;
  getValue?: (item: FlightItem, aircraftMap?: Record<string, Aircraft>) => any;
}

export const columns: Column[] = [
  {
    key: "date",
    label: "Date",
    sortable: true,
    sortType: "date",
    width: "120px",
    getValue: (item: FlightItem) => formatDate(item.date),
  },
  {
    key: "departure",
    label: "Departure",
    width: "120px",
    sortable: true,
    getValue: (item: FlightItem) =>
      isFlight(item)
        ? formatLocation(
            item.departure_airport_code,
            item.departure_runway ?? undefined
          )
        : null,
  },
  {
    key: "destination",
    label: "Destination",
    width: "120px",
    sortable: true,
    getValue: (item: FlightItem) =>
      isFlight(item)
        ? formatLocation(
            item.destination_airport_code,
            item.destination_runway ?? undefined
          )
        : null,
  },
  {
    key: "aircraft_id",
    label: "Aircraft",
    width: "120px",
    sortable: true,
    getValue: (
      item: FlightItem,
      aircraftMap: Record<string, Aircraft> = {}
    ) => {
      if (isFlight(item)) {
        const registration = aircraftMap[item.aircraft_id]?.registration;
        const model = aircraftMap[item.aircraft_id]?.model;
        return { registration, model };
      } else {
        const registration = aircraftMap[item.simulator_id]?.registration;
        return { registration, model: "SIM" };
      }
    },
  },
  {
    key: "total_block_minutes",
    label: "Total Time",
    sortable: true,
    sortType: "time",
    width: "100px",
    getValue: (item: FlightItem) =>
      formatTime(
        isFlight(item)
          ? item.total_block_minutes || 0
          : item.session_minutes || 0
      ),
  },
  {
    key: "total_air_minutes",
    label: "Air Time",
    sortable: true,
    sortType: "time",
    width: "100px",
    getValue: (item: FlightItem) =>
      isFlight(item) ? formatTime(item.total_air_minutes || 0) : null,
  },
  {
    key: "block_start",
    label: "Off Block",
    width: "100px",
    getValue: (item: FlightItem) =>
      isFlight(item) ? formatTimeString(item.block_start) : null,
    hiddenByDefault: true,
  },
  {
    key: "block_end",
    label: "On Block",
    width: "100px",
    getValue: (item: FlightItem) =>
      isFlight(item) ? formatTimeString(item.block_end) : null,
    hiddenByDefault: true,
  },
  {
    key: "flight_start",
    label: "Take Off",
    width: "100px",
    getValue: (item: FlightItem) =>
      isFlight(item) ? formatTimeString(item.flight_start) : null,
    hiddenByDefault: true,
  },
  {
    key: "flight_end",
    label: "Landing",
    width: "100px",
    getValue: (item: FlightItem) =>
      isFlight(item) ? formatTimeString(item.flight_end) : null,
    hiddenByDefault: true,
  },
  {
    key: "scheduled_start",
    label: "Scheduled Take Off",
    width: "100px",
    getValue: (item: FlightItem) =>
      isFlight(item) ? formatTimeString(item.scheduled_start) : null,
    hiddenByDefault: true,
  },
  {
    key: "scheduled_end",
    label: "Scheduled Landing",
    width: "100px",
    getValue: (item: FlightItem) =>
      isFlight(item) ? formatTimeString(item.scheduled_end) : null,
    hiddenByDefault: true,
  },
  {
    key: "duty_start",
    label: "Duty Start",
    width: "100px",
    getValue: (item: FlightItem) =>
      isFlight(item) ? formatTimeString(item.duty_start) : null,
    hiddenByDefault: true,
  },
  {
    key: "duty_end",
    label: "Duty End",
    width: "100px",
    getValue: (item: FlightItem) =>
      isFlight(item) ? formatTimeString(item.duty_end) : null,
    hiddenByDefault: true,
  },
  {
    key: "pic_name",
    label: "Pilot In Command",
    width: "120px",
    getValue: (item: FlightItem) =>
      isFlight(item) ? item.pic_name : item.instructor_name,
    hiddenByDefault: true,
  },
  {
    key: "takeoffs",
    label: "Take Offs",
    getValue: (item: FlightItem) =>
      isFlight(item)
        ? formatMovement(item.day_takeoffs, item.night_takeoffs)
        : null,
  },
  {
    key: "landings",
    label: "Landings",
    getValue: (item: FlightItem) =>
      isFlight(item)
        ? formatMovement(item.day_landings, item.night_landings)
        : null,
  },

  {
    key: "go_arounds",
    label: "Go Arounds",
    getValue: (item: FlightItem) => (isFlight(item) ? item.go_arounds : null),
    hiddenByDefault: true,
  },
  {
    key: "hobbs_start",
    label: "Duty Start",
    width: "100px",
    getValue: (item: FlightItem) => item.hobbs_start,
    hiddenByDefault: true,
  },
  {
    key: "hobbs_end",
    label: "Duty End",
    width: "100px",
    getValue: (item: FlightItem) => item.hobbs_end,
    hiddenByDefault: true,
  },
  {
    key: "tach_start",
    label: "Duty Start",
    width: "100px",
    getValue: (item: FlightItem) => (isFlight(item) ? item.tach_start : null),
    hiddenByDefault: true,
  },
  {
    key: "tach_end",
    label: "Duty End",
    width: "100px",
    getValue: (item: FlightItem) => (isFlight(item) ? item.tach_end : null),
    hiddenByDefault: true,
  },
  // Add time fields (night, IFR, XC, and function (PIC, CoPilot, Dual, Instructor, solo, spic, picus [special]))
  {
    key: "night_time_minutes",
    label: "Night Time",
    sortable: true,
    sortType: "time",
    width: "100px",
    getValue: (item: FlightItem) =>
      isFlight(item) ? formatTime(item.night_time_minutes || 0) : null,
  },
  {
    key: "ifr_time_minutes",
    label: "IFR Time",
    sortable: true,
    sortType: "time",
    width: "100px",
    getValue: (item: FlightItem) =>
      isFlight(item) ? formatTime(item.ifr_time_minutes || 0) : null,
  },
  {
    key: "xc_time_minutes",
    label: "XC Time",
    sortable: true,
    sortType: "time",
    width: "100px",
    getValue: (item: FlightItem) =>
      isFlight(item) ? formatTime(item.xc_time_minutes || 0) : null,
    hiddenByDefault: true,
  },
  {
    key: "function",
    label: "Function",
    sortable: true,
    width: "120px",
    getValue: (item: FlightItem) => {
      if (!isFlight(item)) return null;

      if (item.is_solo) return "SOLO";
      if (item.is_spic) return "SPIC";
      if (item.is_picus) return "PICUS";

      if (item.pic_time_minutes) return "PIC";
      if (item.dual_time_minutes) return "DUAL";
      if (item.copilot_time_minutes) return "COPILOT";
      if (item.instructor_time_minutes) return "INSTRUCTOR";

      return null;
    },
  },
  {
    key: "passengers",
    label: "Passengers",
    getValue: (item: FlightItem) => (isFlight(item) ? item.passengers : null),
    hiddenByDefault: true,
  },
  {
    key: "fuel",
    label: "Fuel",
    getValue: (item: FlightItem) => (isFlight(item) ? item.fuel : null),
    hiddenByDefault: true,
  },
  {
    key: "training_description",
    label: "Training Description",
    width: "200px",
    getValue: (item: FlightItem) => item.training_description,
  },
  {
    key: "remarks",
    label: "Remarks",
    width: "200px",
    getValue: (item: FlightItem) => item.remarks,
  },
];
