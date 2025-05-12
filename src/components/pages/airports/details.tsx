"use client";

import { useState, useEffect } from "react";
import { getAirportWithVisits } from "@/actions/pages/airports/fetch-airports";
import type { AirportWithVisits } from "@/schemas/auth/airport";
import { formatDate } from "@/lib/date-utils";

import { AirportMap } from "@/components/pages/airports/map";
import { AirportRunways } from "@/components/pages/airports/runways";
import { AirportSunTimes } from "@/components/pages/airports/sunset-sunrise-times";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, MapPin, Plane } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AirportDetailProps {
  icao: string;
}

export function AirportDetail({ icao }: AirportDetailProps) {
  const [airport, setAirport] = useState<AirportWithVisits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAirport = async () => {
      try {
        setIsLoading(true);
        const data = await getAirportWithVisits(icao);
        setAirport(data);
      } catch (err) {
        setError("Failed to load airport data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAirport();
  }, [icao]);

  if (isLoading) {
    return <div className="p-4 text-center">Loading airport details...</div>;
  }

  if (error || !airport) {
    return (
      <div className="p-4 text-center text-red-500">
        {error || "Airport not found"}
      </div>
    );
  }

  // Calculate UTC offset for a given time zone
  const getUTCOffset = (timeZone: string): string => {
    try {
      // Create a date in the specified time zone
      const date = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone,
        timeZoneName: "short",
      };

      // Get the time zone offset in minutes
      const formatter = new Intl.DateTimeFormat("en-US", options);

      // Calculate the offset in hours
      const offsetInMinutes = -date.getTimezoneOffset();
      const offsetHours = Math.floor(Math.abs(offsetInMinutes) / 60);
      const offsetMinutes = Math.abs(offsetInMinutes) % 60;

      // Format the offset string
      const sign = offsetInMinutes >= 0 ? "+" : "-";
      const formattedOffset = `UTC${sign}${offsetHours}${
        offsetMinutes > 0 ? `:${offsetMinutes.toString().padStart(2, "0")}` : ""
      }`;

      return formattedOffset;
    } catch (error) {
      console.error("Error calculating UTC offset:", error);
      return "UTC±?";
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="h-[250px] rounded-lg overflow-hidden">
        <AirportMap lat={airport.lat} lon={airport.lon} name={airport.name} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
            <div>
              <CardTitle className="text-xl">{airport.name}</CardTitle>
              <div className="text-sm text-muted-foreground mt-1">
                {airport.city}, {airport.state && `${airport.state}, `}
                {airport.country}
              </div>
            </div>
            <div className="flex gap-2 self-start">
              <Badge
                variant="outline"
                className="text-blue-600 border-blue-600"
              >
                {airport.icao}
              </Badge>
              {airport.iata && (
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-600"
                >
                  {airport.iata}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Airport Details Section */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Elevation</div>
                <div>{airport.elevation} ft</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Time Zone</div>
                <div>
                  {airport.tz} ({getUTCOffset(airport.tz)})
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">Coordinates</div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {airport.lat.toFixed(6)}, {airport.lon.toFixed(6)}
              </div>
            </div>

            {/* Sunrise and Sunset Times */}
            <div className="mt-4">
              <AirportSunTimes lat={airport.lat} lon={airport.lon} />
            </div>

            {airport.runways && airport.runways.length > 0 && (
              <div className="mt-6">
                <AirportRunways runways={airport.runways} />
              </div>
            )}
          </div>

          {/* Separator */}
          <Separator className="my-4" />

          {/* Visit Information Section */}
          <div>
            <h3 className="text-lg font-medium mb-4">Your Visits</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 text-blue-800 p-3 rounded-full">
                  <Plane className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-lg font-medium">{airport.visits}</div>
                  <div className="text-sm text-muted-foreground">
                    Total Visits
                  </div>
                </div>
              </div>

              {airport.lastVisit ? (
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 text-green-800 p-3 rounded-full">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-lg font-medium">
                      {formatDate(new Date(airport.lastVisit), "long")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Last Visit
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  You haven't visited this airport yet
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
