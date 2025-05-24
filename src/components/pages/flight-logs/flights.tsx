"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { List, Search, Table, Columns } from "lucide-react";
import { FlightList } from "./list";
import { FlightTable } from "./table";
import {
  FlightItem,
  isFlight,
  isSimulatorSession,
  columns,
} from "@/types/flight";
import { Aircraft } from "@/types/aircraft";
import { createClient } from "@/lib/supabase/client/client";
import { fetchFlightData } from "@/actions/pages/flights/flight";
import { ViewOptionsOverlay } from "./view-options-overlay";
import useLocalStorage from "@/hooks/useLocalStorage";

export default function Flights() {
  const [viewMode, setViewMode] = useState<"list" | "table">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState<FlightItem[]>([]);
  const [aircraftMap, setAircraftMap] = useState<Record<string, Aircraft>>({});
  const [supabase] = useState(() => createClient());
  const [visibleColumns, setVisibleColumns] = useLocalStorage<string[]>(
    "visibleColumns",
    columns.filter((col) => !col.hiddenByDefault).map((col) => col.key)
  );
  const [showViewOptions, setShowViewOptions] = useState(false);

  // Filter flights based on search term
  const filteredFlights = useMemo(() => {
    if (!searchTerm) return flights;

    const searchLower = searchTerm.toLowerCase();
    return flights.filter((flight) => {
      // For both flight and simulator sessions, search in:
      // - Date
      // - Remarks
      // - Training description
      const baseMatch = [
        flight.date,
        flight.remarks,
        flight.training_description,
      ].some((field) => field?.toLowerCase().includes(searchLower));

      if (baseMatch) return true;

      // Aircraft registration and model
      const aircraft = isFlight(flight)
        ? aircraftMap[flight.aircraft_id]
        : aircraftMap[flight.simulator_id];

      const aircraftMatch =
        aircraft &&
        (aircraft.registration.toLowerCase().includes(searchLower) ||
          aircraft.model?.toLowerCase().includes(searchLower));

      if (aircraftMatch) return true;

      // Flight-specific fields
      if (isFlight(flight)) {
        return [
          flight.departure_airport_code,
          flight.destination_airport_code,
          flight.pic_name,
        ].some((field) => field?.toLowerCase().includes(searchLower));
      }

      // Simulator-specific fields
      if (isSimulatorSession(flight)) {
        return flight.instructor_name?.toLowerCase().includes(searchLower);
      }

      return false;
    });
  }, [flights, searchTerm, aircraftMap]);

  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);

      try {
        const { flights: flightData, aircraftMap: aircraftData } =
          await fetchFlightData();
        setAircraftMap(aircraftData);
        setFlights(flightData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchInitialData();

    // Set up real-time subscriptions
    const flightsSubscription = supabase
      .channel("flights-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "flights" },
        () => fetchInitialData()
      )
      .subscribe();

    const simSubscription = supabase
      .channel("sim-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "simulator_sessions" },
        () => fetchInitialData()
      )
      .subscribe();

    const aircraftSubscription = supabase
      .channel("fleet-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "fleet" },
        () => fetchInitialData()
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      flightsSubscription.unsubscribe();
      simSubscription.unsubscribe();
      aircraftSubscription.unsubscribe();
    };
  }, [supabase]);

  const toggleViewMode = () => {
    setViewMode((current) => (current === "list" ? "table" : "list"));
  };

  return (
    <div>
      <div className="p-4 flex justify-between">
        <div className="relative w-48 md:w-64">
          <Input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            disabled={loading}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <div className="space-x-2">
          {" "}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowViewOptions(true)}
            disabled={loading}
          >
            <Columns className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleViewMode}
            disabled={loading}
          >
            {viewMode === "list" ? (
              <Table className="w-4 h-4" />
            ) : (
              <List className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>{" "}
      <div className="flex-1">
        {loading || filteredFlights.length > 0 ? (
          viewMode === "list" ? (
            <FlightList
              loading={loading}
              flights={filteredFlights}
              aircraftMap={aircraftMap}
            />
          ) : (
            <div className="px-4">
              <FlightTable
                loading={loading}
                flights={filteredFlights}
                aircraftMap={aircraftMap}
                visibleColumns={visibleColumns}
              />
            </div>
          )
        ) : (
          <div className="text-center py-8">
            <p>
              {searchTerm ? (
                <>
                  No result found for &quot;
                  <span className="font-medium">{searchTerm}</span>
                  &quot;.
                </>
              ) : (
                <>
                  No flight logs found.
                  <br />
                  In the future, the developer will add a button here. If not, I
                  forgot.
                </>
              )}
            </p>
          </div>
        )}
      </div>
      <ViewOptionsOverlay
        isOpen={showViewOptions}
        onClose={() => setShowViewOptions(false)}
        visibleColumns={visibleColumns}
        onVisibilityChange={setVisibleColumns}
      />
    </div>
  );
}
