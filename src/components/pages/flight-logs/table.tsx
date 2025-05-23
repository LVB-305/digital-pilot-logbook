import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { Suspense, useCallback, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  isFlight,
  isSimulatorSession,
  FlightListItem,
  columns,
} from "@/types/flight";
import { Aircraft } from "@/types/aircraft";
import { useRouter } from "next/navigation";

type SortDirection = "asc" | "desc" | null;

interface FlightTableProps {
  flights: FlightListItem[];
  loading?: boolean;
  aircraftMap: Record<string, Aircraft>;
}

// interface Column {
//   key: string;
//   label: string;
//   sortable: boolean;
//   sortType?: "string" | "number" | "date" | "time";
//   width?: string;
// }

// const columns: Column[] = [
//   {
//     key: "date",
//     label: "Date",
//     sortable: true,
//     sortType: "date",
//   },
//   {
//     key: "aircraft",
//     label: "Aircraft",
//     sortable: true,
//     sortType: "string",
//   },
//   {
//     key: "route",
//     label: "Route",
//     sortable: true,
//     sortType: "string",
//   },
//   {
//     key: "time",
//     label: "Time",
//     sortable: true,
//     sortType: "time",
//   },
// ];

export function FlightTable({
  flights,
  loading = false,
  aircraftMap,
}: FlightTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({
    column: null,
    direction: null,
  });

  const sortData = (column: string, direction: SortDirection) => {
    setSorting({ column, direction });
  };

  const getFlightValue = useCallback(
    (flight: FlightListItem, column: string) => {
      switch (column) {
        case "date":
          return flight.date;
        case "aircraft":
          if (isFlight(flight)) {
            return aircraftMap[flight.aircraft_id]?.registration || "";
          } else {
            return aircraftMap[flight.simulator_id]?.registration || "";
          }
        case "time":
          if (isFlight(flight)) {
            return flight.total_air_minutes || 0;
          }
          return flight.session_minutes || 0;
        default:
          return "";
      }
    },
    [aircraftMap]
  );

  const sortedFlights = useMemo(() => {
    if (!sorting.column || sorting.direction === null) {
      return [...flights];
    }

    return [...flights].sort((a, b) => {
      const valueA = getFlightValue(a, sorting.column!);
      const valueB = getFlightValue(b, sorting.column!);

      if (valueA === undefined || valueB === undefined) return 0;

      const columnDef = columns.find((col) => col.key === sorting.column);
      if (!columnDef) return 0;

      switch (columnDef.sortType) {
        case "string":
          return sorting.direction === "asc"
            ? String(valueA).localeCompare(String(valueB))
            : String(valueB).localeCompare(String(valueA));
        case "number":
          return sorting.direction === "asc"
            ? Number(valueA) - Number(valueB)
            : Number(valueB) - Number(valueA);
        case "date":
          return sorting.direction === "asc"
            ? new Date(valueA).getTime() - new Date(valueB).getTime()
            : new Date(valueB).getTime() - new Date(valueA).getTime();
        case "time":
          return sorting.direction === "asc"
            ? Number(valueA) - Number(valueB)
            : Number(valueB) - Number(valueA);
        default:
          return 0;
      }
    });
  }, [flights, sorting.column, sorting.direction, getFlightValue]);

  const formatTime = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, "0")}`;
  }, []);

  const formatDate = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, []);

  const formatLocation = useCallback((location: string, runway?: string) => {
    // Handle missing airport with runway
    if (!location && runway) {
      return `-/${runway}`;
    }
    // Only add the runway with separator if runway is provided
    return runway && runway.trim() ? `${location}/${runway}` : location || "-";
  }, []);

  const formatAircraft = useCallback((registration?: string, type?: string) => {
    if (registration && !type) {
      return (
        <span className="text-center truncate font-medium">{registration}</span>
      );
    }

    if (!registration && !type) {
      return <span>-</span>;
    }

    // Both registration and type are available
    return (
      <div>
        <span className="text-center truncate font-medium">{registration}</span>
        <Badge variant="outline" className="rounded ml-2">
          {type}
        </Badge>
      </div>
    );
  }, []);

  return (
    <div className="max-w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={`${
                  column.sortable ? "cursor-pointer select-none" : ""
                } whitespace-nowrap`}
                style={
                  column.width
                    ? { minWidth: column.width, width: column.width }
                    : undefined
                }
                onClick={() => {
                  if (!column.sortable) return;
                  let newDirection: SortDirection = "asc";
                  if (sorting.column === column.key) {
                    if (sorting.direction === "asc") newDirection = "desc";
                    else if (sorting.direction === "desc") newDirection = null;
                  }
                  sortData(column.key, newDirection);
                }}
              >
                <div className="flex items-center">
                  {column.label}
                  {column.sortable && (
                    <span className="ml-2">
                      {sorting.column === column.key ? (
                        sorting.direction === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : sorting.direction === "desc" ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 opacity-50" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                      )}
                    </span>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            // Display skeletons while loading
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={`${index}-${column.key}`}>
                    <Skeleton className="h-6 w-[100px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <Suspense fallback={<div>Loading...</div>}>
              {sortedFlights.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <span>No flights found.</span>
                  </TableCell>
                </TableRow>
              ) : (
                sortedFlights.map((flight) => (
                  <TableRow
                    key={flight.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700 text-center"
                    onClick={() => router.push(`/app/flights/${flight.id}`)}
                  >
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        {(() => {
                          const value = column.getValue?.(flight, aircraftMap);

                          if (column.key === "aircraft_id" && value) {
                            return formatAircraft(
                              value.registration,
                              value.model
                            );
                          }

                          return value || "-";
                        })()}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </Suspense>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
