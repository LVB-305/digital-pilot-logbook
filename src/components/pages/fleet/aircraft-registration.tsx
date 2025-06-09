"use client";
import { useState, useEffect } from "react";
import { getAircraft } from "@/actions/pages/fleet/fleet";
import { Aircraft } from "@/types/aircraft";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface AircraftRegistrationProps {
  id: string;
}

export function AircraftRegistration({ id }: AircraftRegistrationProps) {
  const [aircraft, setAircraft] = useState<Aircraft | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAircraft = async () => {
      try {
        setIsLoading(true);
        setError(null); // Reset error state on each attempt

        if (!id || id === "undefined") {
          setError(" ");
          return;
        }

        const data = await getAircraft(id);
        setAircraft(data);
      } catch (err) {
        console.error("Failed to load aircraft:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load aircraft"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadAircraft();
  }, [id]);

  if (isLoading) {
    return <Skeleton className="h-4 w-24" />;
  }

  if (error || !aircraft) {
    return <span className="text-muted-foreground">Unknown Aircraft</span>;
  }

  return (
    <div className="flex items-center gap-2 text-primary">
      <span>{aircraft.registration}</span>
      {aircraft.model && (
        <Badge variant="outline" className="rounded flex items-center">
          {aircraft.is_simulator ? "SIM" : aircraft.model}
        </Badge>
      )}
    </div>
  );
}
