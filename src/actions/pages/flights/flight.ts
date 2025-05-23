import { format } from "date-fns";
import { FlightListItem, isFlight, isSimulatorSession } from "@/types/flight";
import { Aircraft } from "@/types/aircraft";
import { createClient } from "@/lib/supabase/client/client";

export interface FlightGroup {
  month: string;
  flights: FlightListItem[];
}

export async function fetchFlightData() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user.user) {
    throw new Error("User not authenticated");
  }

  const [{ data: flightData }, { data: simData }, { data: aircraftData }] =
    await Promise.all([
      supabase.from("flights").select("*").eq("user_id", user.user.id),
      supabase
        .from("simulator_sessions")
        .select("*")
        .eq("user_id", user.user.id),
      supabase.from("fleet").select("*").eq("user_id", user.user.id),
    ]);

  const aircraftById = (aircraftData || []).reduce(
    (acc: Record<string, Aircraft>, aircraft: Aircraft) => {
      acc[aircraft.id] = aircraft;
      return acc;
    },
    {}
  );

  return {
    flights: [...(flightData || []), ...(simData || [])],
    aircraftMap: aircraftById,
  };
}

export function groupFlightsByMonth(flights: FlightListItem[]): FlightGroup[] {
  const groups: Record<string, FlightListItem[]> = {};

  flights.forEach((flight) => {
    const [year, month, day] = flight.date.split("-");
    const date = new Date(+year, +month - 1, +day);
    const monthKey = format(date, "MMMM yyyy");

    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(flight);
  });

  return Object.entries(groups).map(([month, flights]) => ({
    month,
    flights: flights.sort((a, b) => {
      // First, compare by date
      const dateComparison =
        new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateComparison !== 0) return dateComparison;

      // If same date, simulators go last
      if (isSimulatorSession(a) && !isSimulatorSession(b)) return 1;
      if (!isSimulatorSession(a) && isSimulatorSession(b)) return -1;

      // If both are flights, sort by block_start time (latest first)
      if (isFlight(a) && isFlight(b)) {
        if (!a.block_start || !b.block_start) return 0;
        return b.block_start.localeCompare(a.block_start);
      }

      // If both are simulator sessions, keep their order as is
      return 0;
    }),
  }));
}
