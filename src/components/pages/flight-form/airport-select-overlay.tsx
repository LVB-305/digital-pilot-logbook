import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Overlay } from "@/components/ui/overlay";
import { Skeleton } from "@/components/ui/skeleton";
import { AirportSchema } from "@/types/airport";
import type { Airport } from "@/types/airport";
import { Check, Search, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";

type Runway = NonNullable<z.infer<typeof AirportSchema>["runways"]>[number];

interface AirportSelectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: { airport: Airport; runway: Runway | null } | null) => void;
  selectedAirports: string | null;
  title?: string;
}

let airportCache: Airport[] | null = null;

const RECENT_AIRPORTS = "recent-airports";
const MAX_RECENT_AIRPORTS = 20;

export function AirportSelectDialog({
  isOpen,
  onClose,
  onSelect,
  selectedAirports,
}: AirportSelectDialogProps) {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Airport[]>([]);
  const [recent, setRecent] = useState<Airport[]>([]);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  useEffect(() => {
    // Reset selected airport when dialog opens
    if (isOpen) {
      setSelectedAirport(null);
    }
  }, [isOpen]);

  const loadAirports = async () => {
    if (!isOpen) return;
    if (airportCache) return;

    setLoading(true);
    try {
      const response = await fetch("/data/airports.json");
      const data = await response.json();

      const airports: Airport[] = Object.entries(data.airports).map(
        ([icao, details]: [string, any]) => ({
          icao,
          ...details,
          runways: Array.isArray(details.runways) ? details.runways : [],
        })
      );

      airportCache = airports;
      setLoading(false);
    } catch (error) {
      console.error("Error loading airports:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAirports();
    }
  }, [isOpen]);

  // Load recent airports
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_AIRPORTS);
    if (stored) {
      try {
        setRecent(JSON.parse(stored));
      } catch (error) {
        console.error("Error parsing recent airports:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (!searchTerm || !airportCache) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      if (!airportCache) return;
      const searchLower = searchTerm.toLowerCase();
      const results = airportCache
        .filter((airport) => {
          return (
            airport.icao?.toLowerCase().includes(searchLower) ||
            airport.iata?.toLowerCase().includes(searchLower) ||
            airport.name?.toLowerCase().includes(searchLower)
          );
        })
        .sort((a, b) => (a.icao || "").localeCompare(b.icao || ""))
        .slice(0, 50); // Limit results to improve performance
      setSearchResults(results);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setSelectedAirport(null);
  };

  const handleAirportSelect = (airport: Airport) => {
    setSelectedAirport(airport);
  };

  const handleRunwaySelect = (runway: Runway) => {
    if (!selectedAirport) return;
    onSelect({ airport: selectedAirport, runway });
    handleUpdateRecent(selectedAirport);
  };

  const handleUpdateRecent = (airport: Airport) => {
    const updatedRecent = [
      airport,
      ...recent.filter((a) => a.icao !== airport.icao),
    ].slice(0, MAX_RECENT_AIRPORTS);

    setRecent(updatedRecent);
    localStorage.setItem(RECENT_AIRPORTS, JSON.stringify(updatedRecent));
  };

  const handleClear = () => {
    onSelect(null);
    setSelectedAirport(null);
  };

  const handleBack = () => {
    setSelectedAirport(null);
  };

  const handleDone = () => {
    if (selectedAirport) {
      onSelect({ airport: selectedAirport, runway: null });
      handleUpdateRecent(selectedAirport);
    }
    onClose();
  };
  const renderRunways = () => {
    if (!selectedAirport?.runways) return null;

    console.log("Rendering runways for:", selectedAirport.runways);

    return (
      <div className="divide-y">
        <div className="px-4 py-2 text-sm font-medium text-muted-foreground">
          Select Runway ({selectedAirport.runways.length} available)
        </div>
        <div className="bg-background divide-y">
          {selectedAirport.runways.map((runway) => (
            <button
              key={runway.ident}
              className="w-full px-4 py-3 text-left hover:bg-input flex items-center justify-between cursor-pointer"
              onClick={() => handleRunwaySelect(runway)}
            >
              <div className="flex items-center space-x-3">
                <div className="font-medium">{runway.ident}</div>
                {runway.closed && (
                  <Badge variant="destructive" className="rounded">
                    Closed
                  </Badge>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderItem = (airport: Airport) => (
    <button
      key={airport.icao}
      className="w-full px-4 py-3 text-left hover:bg-input flex items-center justify-between cursor-pointer"
      onClick={() => handleAirportSelect(airport)}
    >
      <div className="flex items-center space-x-3">
        <div className="font-medium">{airport.icao}</div>
        {airport.name && (
          <Badge variant="outline" className="rounded">
            {airport.name}
          </Badge>
        )}
      </div>
      <div className="flex items-center">
        {selectedAirports === airport.icao && (
          <Check className="h-4 w-4 text-primary mr-2" />
        )}
        {airport.runways && airport.runways.length > 0 && (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </button>
  );

  return (
    <Overlay
      isOpen={isOpen}
      onClose={onClose}
      title={
        selectedAirport
          ? selectedAirport.icao || selectedAirport.name
          : "Select Airport"
      }
      leadingButton={
        selectedAirport
          ? { label: "Back", onClick: handleBack, variant: "ghost" }
          : { label: "Clear", onClick: handleClear, variant: "ghost" }
      }
      trailingButton={
        selectedAirport
          ? { label: "Done", onClick: handleDone, variant: "ghost" }
          : undefined
      }
      stickyHeader={
        !selectedAirport && (
          <div className="relative w-full">
            <Input
              type="text"
              placeholder="Search by ICAO, IATA or name"
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 rounded-none border-none focus-visible:ring-0"
              disabled={loading}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        )
      }
    >
      <div className="divide-y">
        {loading ? (
          <div className="p-4 space-y-3">
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-12" />
          </div>
        ) : selectedAirport ? (
          renderRunways()
        ) : searchTerm ? (
          searchResults.length > 0 ? (
            <div className="bg-background divide-y">
              {searchResults.map(renderItem)}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No airports found
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
