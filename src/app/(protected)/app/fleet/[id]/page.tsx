"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FleetForm from "@/components/pages/fleet/form";
import { AircraftFormSubmit } from "@/types/aircraft";
import { getAircraft } from "@/actions/pages/fleet/fleet";

export default function FleetEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [fleet, setFleet] = useState<AircraftFormSubmit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resolvedParams = use(params);

  useEffect(() => {
    async function loadCrew() {
      try {
        const data = await getAircraft(resolvedParams.id);
        setFleet(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load fleet");
        router.push("/app/fleet");
      }
    }
    loadCrew();
  }, [resolvedParams.id, router]);

  if (error) return null; // Router will handle redirect

  return <FleetForm fleet={fleet || undefined} isLoading={!fleet} />;
}
