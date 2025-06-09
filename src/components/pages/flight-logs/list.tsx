import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  FlightItem,
  isFlight,
  isSimulatorSession,
  getDisplayTime,
} from "@/types/flight";
import { Aircraft } from "@/types/aircraft";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";
import { groupFlightsByMonth } from "@/actions/pages/flights/flight";

interface FlightListProps {
  loading?: boolean;
  flights: FlightItem[];
  aircraftMap: Record<string, Aircraft>;
}

export function FlightList({
  loading = false,
  flights,
  aircraftMap,
}: FlightListProps) {
  const router = useRouter();
  const groupedFlights = groupFlightsByMonth(flights);

  return (
    <div className="divide-y divide-gray-100">
      {loading ? (
        Array.from({ length: 2 }).map((_, monthIndex) => (
          <div
            key={`skeleton-month-${monthIndex}`}
            className="space-y-2 space-x-2"
          >
            {/* Month header skeleton */}
            <div className="px-6 pt-5 pb-2">
              <Skeleton className="h-5 w-24" />
            </div>

            <div className="divide-y divide-gray-100">
              {/* Generate 2-3 flight item skeletons per month */}
              {Array.from({ length: monthIndex === 1 ? 2 : 3 }).map(
                (_, flightIndex) => (
                  <div
                    key={`skeleton-flight-${monthIndex}-${flightIndex}`}
                    className="flex px-4 py-3 relative text-left"
                  >
                    {/* Blue vertical line */}
                    <div className="absolute left-0 top-2 bottom-2 w-1.5 rounded-sm bg-blue-600" />

                    <div className="flex justify-between w-full">
                      {/* Left section: Date, Route, Time */}
                      <div className="pl-3 space-y-2">
                        {/* Date */}
                        <Skeleton className="h-4 w-24" />

                        {/* Route */}
                        <Skeleton className="h-6 w-36" />

                        {/* Time */}
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>

                    {/* Duration and registration */}
                    <div className="absolute right-12 top-1/2 -translate-y-1/2 flex flex-col items-end">
                      <Skeleton className="h-4 w-16 mb-1" />
                      <Skeleton className="h-4 w-28" />
                    </div>

                    {/* Chevron */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Skeleton className="h-6 w-6 rounded-full" />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        ))
      ) : (
        <Suspense fallback={<div>Loading...</div>}>
          {groupedFlights.map(({ month, flights }) => (
            <div key={month} className="space-y-2 space-x-2">
              <h2 className="px-6 pt-5 pb-2 text-sm text-gray-500 font-normal">
                {month}
              </h2>
              <div className="divide-y divide-gray-100">
                {" "}
                {flights.map((flight) => {
                  const date = new Date(flight.date);

                  return (
                    <button
                      key={flight.id}
                      className="w-full px-2 group hover:bg-gray-50 focus:outline-none focus:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/app/flights/${flight.id}`)}
                    >
                      <div className="flex px-2 py-3 relative text-left">
                        {/* Line color based on type */}
                        <div
                          className={`absolute left-0 top-2 bottom-2 w-1.5 rounded-sm ${
                            isSimulatorSession(flight)
                              ? "bg-red-600"
                              : "bg-blue-600"
                          }`}
                        />

                        {/* Main content with left alignment */}
                        <div className="flex justify-between w-full">
                          {/* Left section: Date, Route/Simulator, Time - all aligned to the same left position */}
                          <div className="pl-3">
                            {/* Date */}
                            <div className="text-gray-500 text-sm">
                              {format(new Date(date), "dd MMM yyyy")}
                            </div>
                            {/* Route or Simulator type */}
                            <div className="text-black font-semibold text-base mt-1">
                              {isSimulatorSession(flight) ? (
                                <span className="text-black">
                                  {aircraftMap[flight.simulator_id]
                                    ?.registration || "Unknown Simulator"}
                                </span>
                              ) : (
                                <>
                                  {flight.departure_airport_code}{" "}
                                  <span className="inline-block transform translate-y-[-2px] font-extrabold">
                                    »
                                  </span>{" "}
                                  {flight.destination_airport_code}
                                </>
                              )}
                            </div>{" "}
                            {/* Time */}
                            {isFlight(flight) &&
                              flight.block_start &&
                              flight.block_end && (
                                <div className="text-sm text-gray-900 mt-1">
                                  {flight.block_start.substring(0, 5)}
                                  {"z "}
                                  <span className="inline-block transform translate-y-[-1px]">
                                    -
                                  </span>{" "}
                                  {flight.block_end.substring(0, 5)}
                                  {"z"}
                                </div>
                              )}
                          </div>
                        </div>

                        <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col items-end">
                          {/* Right section: Flight time and Registration */}
                          <div className="text-sm text-gray-900">
                            {getDisplayTime(flight)}
                          </div>

                          {isFlight(flight) &&
                            aircraftMap[flight.aircraft_id] && (
                              <div className="flex items-center text-blue-600 mt-1">
                                <span className="text-sm font-medium">
                                  {aircraftMap[flight.aircraft_id].registration}{" "}
                                  ({aircraftMap[flight.aircraft_id].model})
                                </span>
                              </div>
                            )}
                        </div>

                        {/* Chevron */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </Suspense>
      )}
    </div>
  );
}
