"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchAirports } from "@/actions/pages/airports/fetch-airports";
import type { Airport } from "@/schemas/auth/airport";
import { AirportsErrorMessage } from "@/components/pages/airports/error-message";

export function AirportsList() {
  const router = useRouter();
  const [airports, setAirports] = useState<Airport[]>([]);
  const [filteredAirports, setFilteredAirports] = useState<Airport[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);

  const loadAirports = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAirports();
      setAirports(data);
      setFilteredAirports(data);

      // Extract unique countries
      const countries = [
        ...new Set(data.map((airport) => airport.country)),
      ].sort();
      setAvailableCountries(countries);
    } catch (err) {
      setError("Failed to load airports data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAirports();
  }, []);

  useEffect(() => {
    // Apply filters and search
    let results = airports;

    // Apply country filter if any countries are selected
    if (selectedCountries.length > 0) {
      results = results.filter((airport) =>
        selectedCountries.includes(airport.country)
      );
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (airport) =>
          airport.icao.toLowerCase().includes(query) ||
          (airport.iata && airport.iata.toLowerCase().includes(query)) ||
          airport.name.toLowerCase().includes(query) ||
          airport.city.toLowerCase().includes(query) ||
          airport.country.toLowerCase().includes(query)
      );
    }

    setFilteredAirports(results);
  }, [airports, searchQuery, selectedCountries]);

  const handleCountryToggle = (country: string) => {
    setSelectedCountries((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country]
    );
  };

  const clearFilters = () => {
    setSelectedCountries([]);
  };

  const handleAirportClick = (icao: string) => {
    router.push(`/app/airports/${icao}`);
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading airports...</div>;
  }

  if (error) {
    return (
      <div className="p-4">
        <AirportsErrorMessage
          onRetry={() => {
            setError(null);
            setIsLoading(true);
            loadAirports();
          }}
        />
      </div>
    );
  }

  // Group airports by country for display
  const airportsByCountry: Record<string, Airport[]> = {};

  filteredAirports.forEach((airport) => {
    if (!airportsByCountry[airport.country]) {
      airportsByCountry[airport.country] = [];
    }
    airportsByCountry[airport.country].push(airport);
  });

  // Sort countries alphabetically
  const sortedCountries = Object.keys(airportsByCountry).sort();

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search airports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Airports</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <h3 className="mb-2 text-sm font-medium">Countries</h3>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {availableCountries.map((country) => (
                    <div key={country} className="flex items-center space-x-2">
                      <Checkbox
                        id={`country-${country}`}
                        checked={selectedCountries.includes(country)}
                        onCheckedChange={() => handleCountryToggle(country)}
                      />
                      <Label htmlFor={`country-${country}`}>{country}</Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <SheetFooter>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <ScrollArea className="h-[calc(100vh-170px)]">
        <div className="space-y-6 pb-6">
          {sortedCountries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No airports found matching your criteria
            </div>
          ) : (
            sortedCountries.map((country) => (
              <div key={country}>
                <h2 className="text-lg font-semibold mb-2 sticky top-0 bg-gray-50 py-2 z-10">
                  {country}
                </h2>
                <div className="space-y-2">
                  {airportsByCountry[country].map((airport) => (
                    <div
                      key={airport.icao}
                      className="bg-white p-3 rounded-lg shadow-sm hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleAirportClick(airport.icao)}
                    >
                      <div className="flex justify-between">
                        <div className="font-medium">
                          {airport.icao}
                          {airport.iata && ` / ${airport.iata}`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {airport.city}
                        </div>
                      </div>
                      <div className="text-sm mt-1">{airport.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
