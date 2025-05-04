"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { z } from "zod";
import { getCrew } from "@/actions/pages/crew/crew";
import type { CrewSubmitSchema } from "@/types/crew";
import CrewForm from "@/components/pages/crew/form";

type CrewItem = z.infer<typeof CrewSubmitSchema>;

export default function CrewEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [crew, setCrew] = useState<CrewItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resolvedParams = use(params);

  useEffect(() => {
    async function loadCrew() {
      try {
        const data = await getCrew(resolvedParams.id);
        setCrew(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load crew member");
        router.push("/app/crew");
      }
    }
    loadCrew();
  }, [resolvedParams.id, router]);

  if (error) return null; // Router will handle redirect

  return <CrewForm crew={crew || undefined} isLoading={!crew} />;
}
