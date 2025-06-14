import { Airport, Runway } from "@/types/airport";

// Update interface to new structure in types/airport.ts

interface AirportData {
  metadata: {
    last_updated: string;
    total_airports: number;
    airports_with_runways: number;
    sources: {
      airports: string;
      runways: string;
    };
  };
  airports: Record<string, Airport>;
}

interface AirportWithVisits extends Airport {
  visits: number;
  lastVisit: string | null;
}

// Cache for the airports data
let airportsCache: Airport[] | null = null;
let metadataCache: AirportData["metadata"] | null = null;

export async function fetchAirports(): Promise<Airport[]> {
  if (airportsCache) {
    return airportsCache;
  }

  try {
    // First try to fetch from local public directory
    console.log("Attempting to fetch from public directory...");
    const response = await fetch("/data/airports.json");

    if (!response.ok) {
      throw new Error(`Local fetch failed: ${response.status}`);
    }

    const data: AirportData = await response.json();
    metadataCache = data.metadata;
    const airports: Airport[] = Object.values(data.airports);
    airportsCache = airports;
    return airports;
  } catch (localError) {
    console.error("Local fetch failed:", localError);
    return [];
  }
}

export async function getAirportsByCountry(): Promise<
  Record<string, Airport[]>
> {
  const airports = await fetchAirports();

  return airports.reduce((acc, airport) => {
    if (!acc[airport.country]) {
      acc[airport.country] = [];
    }
    acc[airport.country].push(airport);
    return acc;
  }, {} as Record<string, Airport[]>);
}

export async function searchAirports(query: string): Promise<Airport[]> {
  const airports = await fetchAirports();

  if (!query) {
    return airports;
  }

  const lowerQuery = query.toLowerCase();

  return airports.filter(
    (airport) =>
      airport.icao.toLowerCase().includes(lowerQuery) ||
      (airport.iata && airport.iata.toLowerCase().includes(lowerQuery)) ||
      airport.name.toLowerCase().includes(lowerQuery) ||
      airport.city.toLowerCase().includes(lowerQuery) ||
      airport.country.toLowerCase().includes(lowerQuery)
  );
}

export async function getAirportByIcao(icao: string): Promise<Airport | null> {
  const airports = await fetchAirports();
  return airports.find((airport) => airport.icao === icao) || null;
}

// Mock function to get user visits for an airport
// In a real app, this would fetch from your database
export function getAirportVisits(icao: string): {
  visits: number;
  lastVisit: string | null;
} {
  // Mock data - in a real app, this would come from your database
  const mockVisits: Record<
    string,
    { visits: number; lastVisit: string | null }
  > = {
    KJFK: { visits: 5, lastVisit: "2023-12-15" },
    EGLL: { visits: 3, lastVisit: "2023-11-20" },
    EDDF: { visits: 2, lastVisit: "2023-10-05" },
    LFPG: { visits: 1, lastVisit: "2023-09-12" },
  };

  return mockVisits[icao] || { visits: 0, lastVisit: null };
}

export async function getAirportWithVisits(
  icao: string
): Promise<AirportWithVisits | null> {
  const airport = await getAirportByIcao(icao);

  if (!airport) {
    return null;
  }

  const { visits, lastVisit } = getAirportVisits(icao);

  return {
    ...airport,
    visits,
    lastVisit,
  };
}

/**
 * Get the metadata from the airports data file
 */
export async function getAirportsMetadata(): Promise<
  AirportData["metadata"] | null
> {
  if (metadataCache) {
    return metadataCache;
  }

  // If we don't have the metadata cached, fetch the airports data
  // This will populate the metadata cache
  await fetchAirports();

  return metadataCache;
}

/**
 * Get runway information for an airport
 */
export async function getAirportRunways(
  icao: string
): Promise<Runway[] | null> {
  const airport = await getAirportByIcao(icao);

  if (!airport || !airport.runways) {
    return null;
  }

  return airport.runways;
}
