import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Overlay } from "@/components/ui/overlay";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client/client";
import { Aircraft } from "@/types/aircraft";
import { Check, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface AircraftSelectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: Aircraft | null) => void;
  selectedAircraft: string | null;
}

let aircraftCache: Aircraft[] | null = null;

const RECENT_ARICRAFT = "recent-aircraft";
const MAX_RECENT_AIRCRAFT = 10;

export function AircraftSelectDialog({
  isOpen,
  onClose,
  onSelect,
  selectedAircraft,
}: AircraftSelectDialogProps) {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Aircraft[]>([]);
  const [recent, setRecent] = useState<Aircraft[]>([]);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    async function loadAircraft() {
      if (!isOpen) return;
      if (aircraftCache) {
        return;
      }

      setLoading(true);

      try {
        const { data: user } = await supabase.auth.getUser();
        const { data: fleetData } = await supabase
          .from("fleet")
          .select("*")
          .eq("user_id", user.user?.id) // Add RLS policy to filter by user_id
          .order("registration", { ascending: true }); // Add default sorting at database level
        aircraftCache = fleetData || [];
      } catch (error) {
        console.error("Error loading aircraft data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAircraft();
  }, [supabase, isOpen]);

  // Load recent types
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_ARICRAFT);
    if (stored) {
      setRecent(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (!searchTerm || !aircraftCache) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      if (!aircraftCache) return;
      const results = aircraftCache
        .filter((aircraft) => {
          const searchLower = searchTerm.toLowerCase();
          return (
            aircraft.registration?.toLowerCase().includes(searchLower) ||
            aircraft.model?.toLowerCase().includes(searchLower) ||
            aircraft.manufacturer?.toLowerCase().includes(searchLower) ||
            aircraft.type?.toLowerCase().includes(searchLower) ||
            aircraft.operator?.toLowerCase().includes(searchLower)
          );
        })
        .sort((a, b) => a.registration.localeCompare(b.registration));
      setSearchResults(results);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAircraftSelect = (type: Aircraft) => {
    onSelect(type);

    // Update recent types
    const updatedRecent = [
      type,
      ...recent.filter((t) => t.id !== type.id),
    ].slice(0, MAX_RECENT_AIRCRAFT);

    setRecent(updatedRecent);
    localStorage.setItem(RECENT_ARICRAFT, JSON.stringify(updatedRecent));
  };
  const handleClear = () => {
    onSelect(null);
  };

  const renderItem = (item: Aircraft) => (
    <button
      key={item.id}
      className="w-full px-4 py-3 text-left hover:bg-input flex items-center justify-between cursor-pointer"
      onClick={() => handleAircraftSelect(item)}
    >
      <div className="flex space-x-2">
        <div className="font-medium">{item.registration}</div>

        <Badge variant="outline" className="rounded flex items-center">
          {item.is_simulator ? "SIM" : item.model}
        </Badge>
      </div>{" "}
      {selectedAircraft === item.id && (
        <Check className="h-4 w-4 text-primary" />
      )}
    </button>
  );

  return (
    <Overlay
      isOpen={isOpen}
      onClose={onClose}
      title="Select Aircraft"
      leadingButton={{ label: "Clear", onClick: handleClear, variant: "ghost" }}
      showDoneButton
      stickyHeader={
        <div className="relative w-full">
          <Input
            type="text"
            placeholder="Search by registration, model, type or operator"
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 rounded-none border-none focus-visible:ring-0"
            disabled={loading}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      }
    >
      <div className="divide-y">
        {loading ? (
          <div className="p-4 space-y-3">
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-12" />
          </div>
        ) : searchTerm ? (
          searchResults.length > 0 ? (
            <div className="bg-background divide-y">
              {searchResults.map(renderItem)}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No aircraft found
            </div>
          )
        ) : (
          recent.length > 0 && (
            <div>
              <div className="px-4 py-2 text-sm font-medium text-muted-foreground">
                Recently Used
              </div>
              <div className="bg-background divide-y">
                {recent.map(renderItem)}
              </div>
            </div>
          )
        )}
      </div>
    </Overlay>
  );
}
