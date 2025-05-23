"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bolt, List, Search, Table } from "lucide-react";
import { FlightList } from "./list";
import { FlightTable } from "./table";
import { FlightListItem } from "@/types/flight";
import { Aircraft } from "@/types/aircraft";
import { createClient } from "@/lib/supabase/client/client";
import { fetchFlightData } from "@/actions/pages/flights/flight";

export default function Flights() {
  const [viewMode, setViewMode] = useState<"list" | "table">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState<FlightListItem[]>([]);
  const [aircraftMap, setAircraftMap] = useState<Record<string, Aircraft>>({});
  const [supabase] = useState(() => createClient());

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
          <Button
            variant="outline"
            size="icon"
            onClick={() => {}}
            // disabled={loading}
            disabled
          >
            <Bolt className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleViewMode}
            // disabled={loading}
            // disabled
          >
            {viewMode === "list" ? (
              <Table className="w-4 h-4" />
            ) : (
              <List className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1">
        {loading || flights.length > 0 ? (
          viewMode === "list" ? (
            <FlightList
              loading={loading}
              flights={flights}
              aircraftMap={aircraftMap}
            />
          ) : (
            <div className="px-4">
              <FlightTable
                loading={loading}
                flights={flights}
                aircraftMap={aircraftMap}
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
    </div>
  );
}
