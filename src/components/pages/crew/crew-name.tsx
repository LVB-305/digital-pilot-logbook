"use client";
import { useState, useEffect } from "react";
import { getCrew } from "@/actions/pages/crew/crew";
import { Crew } from "@/types/crew";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import useLocalStorage from "@/hooks/useLocalStorage";

interface CrewRegistrationProps {
  id: string;
}

export function CrewDisplay({ id }: CrewRegistrationProps) {
  const [crew, setCrew] = useState<Crew | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nameOrder] = useLocalStorage("nameOrder", "firstNameFirst");

  useEffect(() => {
    const loadCrew = async () => {
      try {
        setIsLoading(true);
        setError(null); // Reset error state on each attempt

        if (!id || id === "undefined") {
          setError(" ");
          return;
        }

        const data = await getCrew(id);
        setCrew(data);
      } catch (err) {
        console.error("Failed to load crew:", err);
        setError(err instanceof Error ? err.message : "Failed to load crew");
      } finally {
        setIsLoading(false);
      }
    };

    loadCrew();
  }, [id]);

  if (isLoading) {
    return <Skeleton className="h-4 w-24" />;
  }

  if (error || !crew) {
    return (
      <span className="text-muted-foreground">{error || "Unknown Crew"}</span>
    );
  }

  return (
    <div className="flex items-center gap-2 text-primary">
      <div className="font-medium">
        {nameOrder === "firstNameFirst"
          ? `${crew.first_name} ${crew.last_name}`
          : `${crew.last_name}, ${crew.first_name}`}
      </div>

      <Badge variant="outline" className="rounded flex items-center">
        {crew.company_id}
      </Badge>
    </div>
  );
}
