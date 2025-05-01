"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sunrise, Sunset, Loader2 } from "lucide-react";
import { format, addDays, subDays } from "date-fns";

interface SunTime {
  date: Date;
  sunrise: string;
  sunset: string;
}

interface AirportSunTimesProps {
  lat: number;
  lon: number;
}

export function AirportSunTimes({ lat, lon }: AirportSunTimesProps) {
  const [sunTimes, setSunTimes] = useState<SunTime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSunTimes = async () => {
      try {
        setIsLoading(true);

        // Get dates for yesterday, today, tomorrow, and day after tomorrow
        const today = new Date();
        const dates = [
          subDays(today, 2),
          subDays(today, 1),
          today,
          addDays(today, 1),
        ];

        // Fetch sun times for each date
        const sunTimePromises = dates.map(async (date) => {
          const formattedDate = format(date, "yyyy-MM-dd");
          const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=${formattedDate}&formatted=0`;

          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch sun times: ${response.status}`);
          }

          const data = await response.json();
          if (data.status !== "OK") {
            throw new Error("Invalid response from sunrise-sunset API");
          }

          return {
            date,
            sunrise: data.results.sunrise,
            sunset: data.results.sunset,
          };
        });

        const results = await Promise.all(sunTimePromises);
        setSunTimes(results);
      } catch (err) {
        console.error("Error fetching sun times:", err);
        setError("Failed to load sunrise and sunset times");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSunTimes();
  }, [lat, lon]);

  // Format the UTC time string to a more readable format
  const formatUTCTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return format(date, "HH:mm");
    } catch (err) {
      console.error("Error formatting time:", err);
      return "N/A";
    }
  };

  // Get day label
  const getDayLabel = (date: Date) => {
    const today = new Date();

    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return "Today";
    }

    if (
      date.getDate() === addDays(today, 1).getDate() &&
      date.getMonth() === addDays(today, 1).getMonth() &&
      date.getFullYear() === addDays(today, 1).getFullYear()
    ) {
      return "Tomorrow";
    }

    if (
      date.getDate() === subDays(today, 1).getDate() &&
      date.getMonth() === subDays(today, 1).getMonth() &&
      date.getFullYear() === subDays(today, 1).getFullYear()
    ) {
      return "Yesterday";
    }

    if (
      date.getDate() === subDays(today, 2).getDate() &&
      date.getMonth() === subDays(today, 2).getMonth() &&
      date.getFullYear() === subDays(today, 2).getFullYear()
    ) {
      return "2 Days Ago";
    }

    return format(date, "EEE, MMM d");
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 flex justify-center items-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
          <span className="text-muted-foreground">Loading sun times...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground text-center">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {sunTimes.map((sunTime, index) => (
            <div key={index} className="border rounded-lg p-3">
              <div className="text-sm font-medium mb-2">
                {getDayLabel(sunTime.date)}
              </div>
              <div className="flex items-center mb-2">
                <Sunrise className="h-4 w-4 text-orange-500 mr-2" />
                <span className="text-sm">
                  {formatUTCTime(sunTime.sunrise)} UTC
                </span>
              </div>
              <div className="flex items-center">
                <Sunset className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-sm">
                  {formatUTCTime(sunTime.sunset)} UTC
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
