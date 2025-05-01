import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { AirportDetail } from "@/components/pages/airports/details";
import { Skeleton } from "@/components/ui/skeleton";
import { getAirportByIcao } from "@/actions/pages/airports/fetch-airports";

interface AirportDetailPageProps {
  params: {
    icao: string;
  };
}

export async function generateMetadata({ params }: AirportDetailPageProps) {
  const airport = await getAirportByIcao(params.icao);

  if (!airport) {
    return {
      title: "Airport Not Found",
    };
  }

  return {
    title: `${airport.icao} - ${airport.name}`,
    description: `Details for ${airport.name} airport in ${airport.city}, ${airport.country}`,
  };
}

export default function AirportDetailPage({ params }: AirportDetailPageProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageHeader title={params.icao} backHref="/airports" />
      <Suspense fallback={<AirportDetailSkeleton />}>
        <AirportDetail icao={params.icao} />
      </Suspense>
    </div>
  );
}

function AirportDetailSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-[200px] w-full rounded-lg" />
      <Skeleton className="h-8 w-3/4 rounded-lg" />
      <Skeleton className="h-4 w-1/2 rounded-lg" />
      <Skeleton className="h-[200px] w-full rounded-lg" />
    </div>
  );
}
