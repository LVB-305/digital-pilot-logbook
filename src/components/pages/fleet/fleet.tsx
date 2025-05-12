import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client/client";

import { Aircraft } from "@/types/aircraft";

import { FleetTable } from "@/components/pages/fleet/table";
import { FleetList } from "@/components/pages/fleet/list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Table, List, ListFilter } from "lucide-react";

export default function Fleet() {
  const [viewMode, setViewMode] = useState<"list" | "table">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSortFilterDialogOpen, setSortFilterDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fleet, setFleet] = useState<Aircraft[]>([]);
  const [supabase] = useState(() => createClient());

  const filteredFleet = fleet
    .sort((a, b) => a.registration.localeCompare(b.registration))
    .filter((aircraft) => {
      const normalizedSearchTerm = searchTerm.toLowerCase().replace(/-/g, "");
      const normalizedRegistration = aircraft.registration
        .toLowerCase()
        .replace(/-/g, "");
      return (
        normalizedRegistration.includes(normalizedSearchTerm) ||
        aircraft.operator?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aircraft.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aircraft.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);

      try {
        const { data: user } = await supabase.auth.getUser();
        const { data: fleetData } = await supabase
          .from("fleet")
          .select("*")
          .eq("user_id", user.user?.id) // Add RLS policy to filter by user_id
          .order("registration", { ascending: true }); // Add default sorting at database level

        setFleet(fleetData || []);

        console.log(fleet, user.user?.id);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchInitialData();

    const crewsSubscription = supabase
      .channel("fleet-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "fleet" },
        () => fetchInitialData()
      )
      .subscribe();

    return () => {
      crewsSubscription.unsubscribe();
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
          {viewMode === "list" && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortFilterDialogOpen(true)}
            >
              <ListFilter className="w-4 h-4" />
            </Button>
          )}

          <Button variant="outline" size="icon" onClick={toggleViewMode}>
            {viewMode === "list" ? (
              <Table className="w-4 h-4" />
            ) : (
              <List className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 px-4">
        {viewMode === "list" ? (
          <FleetList
            aircraft={filteredFleet}
            loading={loading}
            filterDialogOpen={isSortFilterDialogOpen}
            onFilterDialogClose={() => setSortFilterDialogOpen(false)}
          />
        ) : (
          <FleetTable aircraft={filteredFleet} loading={loading} />
        )}
      </div>
    </div>
  );
}
