"use client";

import { useState, useEffect } from "react";
import { getPreferenceCookie, setPreferenceCookie } from "@/lib/cookie-actions";
import type { Runway } from "@/schemas/auth/airport";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AirportRunwaysProps {
  runways: Runway[] | null;
}

export function AirportRunways({ runways }: AirportRunwaysProps) {
  const [useMetric, setUseMetric] = useState(false);

  // Load unit preference from cookie on mount
  useEffect(() => {
    const loadUnitPreference = async () => {
      const unitPref = await getPreferenceCookie("runway-units");
      if (unitPref) {
        setUseMetric(unitPref === "metric");
      }
    };

    loadUnitPreference();
  }, []);

  // Save unit preference to cookie when changed
  const toggleUnits = async () => {
    const newValue = !useMetric;
    setUseMetric(newValue);
    await setPreferenceCookie("runway-units", newValue ? "metric" : "imperial");
  };

  // Convert feet to meters
  const feetToMeters = (feet: string): number => {
    return Math.round(Number.parseFloat(feet) * 0.3048);
  };

  if (!runways || runways.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Runways</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            No runway information available for this airport
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Runways</CardTitle>
        <Tabs
          value={useMetric ? "metric" : "imperial"}
          onValueChange={async (value) => {
            const newValue = value === "metric";
            setUseMetric(newValue);
            await setPreferenceCookie(
              "runway-units",
              newValue ? "metric" : "imperial"
            );
          }}
          className="w-[160px]"
        >
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="imperial">Feet</TabsTrigger>
            <TabsTrigger value="metric">Meters</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {runways.map((runway, index) => (
            <div
              key={index}
              className="flex justify-between items-center border rounded-lg p-3"
            >
              <div className="flex gap-2">
                <Badge
                  variant="outline"
                  className="text-blue-600 border-blue-600"
                >
                  {runway.le_ident}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-blue-600 border-blue-600"
                >
                  {runway.he_ident}
                </Badge>
                {runway.closed && (
                  <Badge variant="destructive" className="text-xs ml-2">
                    Closed
                  </Badge>
                )}
              </div>
              <div className="text-sm font-medium">
                {useMetric
                  ? `${feetToMeters(runway.length_ft)}m × ${feetToMeters(
                      runway.width_ft
                    )}m`
                  : `${runway.length_ft}ft × ${runway.width_ft}ft`}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
