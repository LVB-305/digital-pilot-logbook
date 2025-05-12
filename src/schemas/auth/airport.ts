export interface Runway {
  le_ident: string;
  le_heading: string;
  he_ident: string;
  he_heading: string;
  length_ft: string;
  width_ft: string;
  surface: string;
  lighted: boolean;
  closed: boolean;
}

export interface Airport {
  icao: string;
  iata: string;
  name: string;
  city: string;
  state: string;
  country: string;
  elevation: number;
  lat: number;
  lon: number;
  tz: string;
  runways?: Runway[];
}

export interface AirportWithVisits extends Airport {
  visits: number;
  lastVisit: string | null;
}

export interface AirportData {
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
