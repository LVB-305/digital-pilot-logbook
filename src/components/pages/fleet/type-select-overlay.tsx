import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Overlay } from "@/components/ui/overlay";
import { Search, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

let aircraftCache: any[] | null = null;

interface AircraftType {
  model: string;
  type: string;
  manufacturer: string;
  category: string;
  engine_count: number;
  engine_type: string;
  passenger_seats: number;
}

interface TypeSelectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: AircraftType) => void;
  selectedType: string | null;
}

const RECENT_TYPES_KEY = "recent-aircraft-types";
const MAX_RECENT_TYPES = 5;

export function TypeSelectDialog({
  isOpen,
  onClose,
  onSelect,
  selectedType,
}: TypeSelectDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [recentTypes, setRecentTypes] = useState<AircraftType[]>([]);
  const [searchResults, setSearchResults] = useState<AircraftType[]>([]);
  const [loading, setLoading] = useState(false);

  // Load aircraft data when overlay opens
  useEffect(() => {
    const loadAircraftData = async () => {
      if (!isOpen) return;
      if (aircraftCache) {
        return;
      }

      setLoading(true);
      try {
        const response = await fetch("/data/aircraft.json");
        const data = await response.json();
        aircraftCache = data;
      } catch (error) {
        console.error("Error loading aircraft data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadAircraftData();
  }, [isOpen]);

  // Load recent types
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_TYPES_KEY);
    if (stored) {
      setRecentTypes(JSON.parse(stored));
    }
  }, []);
  // Debounced search results
  useEffect(() => {
    if (!searchTerm || !aircraftCache) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      if (!aircraftCache) return;

      const results: AircraftType[] = (aircraftCache as AircraftType[])
        .filter((aircraft: any) => {
          const normalizedTerm = searchTerm.toLowerCase().replace(/\s+/g, "");
          const normalizedModel = aircraft.Model?.toLowerCase().replace(
            /\s+/g,
            ""
          );
          const normalizedType =
            aircraft.Type?.toLowerCase().replace(/\s+/g, "") || "";
          const normalizedManufacturer =
            aircraft.Manufacturer?.toLowerCase().replace(/\s+/g, "") || "";

          return (
            normalizedModel.includes(normalizedTerm) ||
            normalizedType.includes(normalizedTerm) ||
            normalizedManufacturer.includes(normalizedTerm)
          );
        })
        .map((aircraft: any) => ({
          model: aircraft.Model || "",
          type: aircraft.Type || "",
          manufacturer: aircraft.Manufacturer || "",
          category: aircraft.Category?.toLowerCase() || "",
          engine_count: aircraft.EngineCount || 0,
          engine_type: aircraft.EngineType?.toLowerCase() || "",
          passenger_seats: 0, // This field is not in the JSON data, defaulting to 0
        }));
      setSearchResults(results);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleTypeSelect = (type: AircraftType) => {
    onSelect(type);

    // Update recent types
    const updatedRecent = [
      type,
      ...recentTypes.filter((t) => t.model !== type.model),
    ].slice(0, MAX_RECENT_TYPES);

    setRecentTypes(updatedRecent);
    localStorage.setItem(RECENT_TYPES_KEY, JSON.stringify(updatedRecent));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClear = () => {
    onSelect({
      model: "",
      type: "",
      manufacturer: "",
      category: "", // Default value since it's required
      engine_count: 0,
      engine_type: "",
      passenger_seats: 0,
    });
  };
  const renderTypeItem = (type: AircraftType) => (
    <button
      key={type.type && "-" && type.model}
      className="w-full px-4 py-3 text-left hover:bg-input flex items-center justify-between cursor-pointer"
      onClick={() => handleTypeSelect(type)}
    >
      <div>
        <div className="font-medium">{type.type}</div>
        <div className="text-sm text-muted-foreground">{type.model}</div>
      </div>
      {selectedType === type.type && <Check className="h-4 w-4 text-primary" />}
    </button>
  );

  return (
    <Overlay
      isOpen={isOpen}
      onClose={onClose}
      title="Select Aircraft Type"
      leadingButton={{ label: "Clear", onClick: handleClear, variant: "ghost" }}
      showDoneButton
      stickyHeader={
        <div className="relative w-full">
          <Input
            type="text"
            placeholder="Search by model, type, or manufacturer"
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
              {searchResults.map(renderTypeItem)}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No results found
            </div>
          )
        ) : (
          <>
            {recentTypes.length > 0 && (
              <div>
                <div className="px-4 py-2 text-sm font-medium text-muted-foreground">
                  Recently Used
                </div>
                <div className="bg-background divide-y">
                  {recentTypes.map(renderTypeItem)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Overlay>
  );
}
