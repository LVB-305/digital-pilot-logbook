import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client/client";
import useLocalStorage from "@/hooks/useLocalStorage";

import { CrewItem } from "@/types/crew";

import { Input } from "@/components/ui/input";
import { List, Search, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CrewTable } from "@/components/pages/crew/table";
import { CrewList } from "@/components/pages/crew/list";

export default function Crew() {
  const [viewMode, setViewMode] = useState<"list" | "table">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [crews, setCrews] = useState<CrewItem[]>([]);
  const [supabase] = useState(() => createClient());
  const [nameOrder] = useLocalStorage("nameOrder", "firstNameFirst");

  const filteredCrews = crews
    .map((crew) => ({
      ...crew,
      display_name:
        nameOrder === "firstNameFirst"
          ? `${crew.first_name} ${crew.last_name}`
          : `${crew.last_name}, ${crew.first_name}`,
    }))
    .sort((a, b) => a.display_name.localeCompare(b.display_name))
    .filter(
      (crew) =>
        crew.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crew.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crew.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crew.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crew.company_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crew.license_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);

      try {
        const { data: user } = await supabase.auth.getUser();
        const { data: crewData } = await supabase
          .from("pilots")
          .select("*")
          .eq("user_id", user.user?.id) // Add RLS policy to filter by user_id
          .order("first_name", { ascending: true }); // Add default sorting at database level

        setCrews(crewData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchInitialData();

    const crewsSubscription = supabase
      .channel("pilots-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pilots" },
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
          <CrewList crew={filteredCrews} loading={loading} />
        ) : (
          <CrewTable crew={filteredCrews} loading={loading} />
        )}
      </div>
    </div>
  );
}
