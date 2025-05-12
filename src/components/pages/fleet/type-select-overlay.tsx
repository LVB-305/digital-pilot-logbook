import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Overlay } from "@/components/ui/overlay";
import { Search, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

  useEffect(() => {
    const stored = localStorage.getItem(RECENT_TYPES_KEY);
    if (stored) {
      setRecentTypes(JSON.parse(stored));
    }
  }, []);

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

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (!term) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual search logic here
      // For now, using mock data
      const results: AircraftType[] = [
        {
          model: "C172",
          type: "C172",
          manufacturer: "Cessna",
          category: "single-pilot",
          engine_count: 1,
          engine_type: "piston",
          passenger_seats: 3,
        },
        {
          model: "DA 40 D",
          type: "DA 40",
          manufacturer: "Diamond",
          category: "single-pilot",
          engine_count: 1,
          engine_type: "piston",
          passenger_seats: 3,
        },
      ].filter((type) => {
        const normalizedTerm = term.toLowerCase().replace(/\s+/g, "");
        const normalizedModel = type.model.toLowerCase().replace(/\s+/g, "");
        const normalizedManufacturer = type.manufacturer
          .toLowerCase()
          .replace(/\s+/g, "");

        return (
          normalizedModel.includes(normalizedTerm) ||
          normalizedManufacturer.includes(normalizedTerm)
        );
      });
      setSearchResults(results);
    } finally {
      setLoading(false);
    }
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
      key={type.model}
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
      title="Select Type"
      leadingButton={{ label: "Clear", onClick: handleClear, variant: "ghost" }}
      showDoneButton
    >
      <div className="relative w-full">
        <Input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 rounded-none border-none focus-visible:ring-0"
          disabled={loading}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      <div className="divide-y">
        {loading ? (
          // ADD SKELETON
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
            {/* Modify in the future to fetch recent types from supabase */}
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
