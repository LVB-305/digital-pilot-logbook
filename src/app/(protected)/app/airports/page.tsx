import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { AirportsList } from "@/components/pages/airports/airports-list";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Pilot Logbook - Airports",
  description: "Browse and search airports",
};

export default function AirportsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageHeader title="Airports" backHref="/" />
      <Suspense fallback={<AirportsLoadingSkeleton />}>
        <AirportsList />
      </Suspense>
    </div>
  );
}

function AirportsLoadingSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-[calc(100vh-150px)] w-full rounded-lg" />
    </div>
  );
}
