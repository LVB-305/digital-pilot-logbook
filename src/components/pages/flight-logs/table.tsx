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
import { isFlight, FlightItem, columns } from "@/types/flight";
import { Aircraft } from "@/types/aircraft";
import { useRouter } from "next/navigation";
import { Columns } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { ColumnsVisibilityOverlay } from "./columns-visibility-overlay";

type SortDirection = "asc" | "desc" | null;

interface FlightTableProps {
  flights: FlightItem[];
  loading?: boolean;
  aircraftMap: Record<string, Aircraft>;
  visibleColumns: string[];
}

export function FlightTable({
  flights,
  loading = false,
  aircraftMap,
  visibleColumns,
}: FlightTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({
    column: null,
    direction: null,
  });

  const sortData = (columnKey: string, direction: SortDirection) => {
    // Only allow sorting on columns that are marked as sortable
    const column = columns.find((col) => col.key === columnKey);
    if (!column?.sortable) return;

    setSorting({ column: columnKey, direction });
  };
  const getFlightValue = useCallback(
    (flight: FlightItem, columnKey: string) => {
      const column = columns.find((col) => col.key === columnKey);
      if (!column?.getValue) return "";

      const value = column.getValue(flight, aircraftMap);

      // Handle special cases for sorting
      if (column.key === "aircraft_id" && typeof value === "object") {
        return value.registration || "";
      }

      return value;
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
      if (!columnDef?.sortType) return 0;

      // For time fields, convert HH:MM format to minutes for proper sorting
      const parseTimeValue = (value: any) => {
        if (typeof value === "string" && value.includes(":")) {
          const [hours, minutes] = value.split(":").map(Number);
          return hours * 60 + minutes;
        }
        return value;
      };

      const processValue = (value: any, type: string) => {
        switch (type) {
          case "time":
            return parseTimeValue(value);
          case "date":
            return new Date(value).getTime();
          case "number":
            return Number(value);
          default:
            return String(value);
        }
      };

      const processedA = processValue(valueA, columnDef.sortType);
      const processedB = processValue(valueB, columnDef.sortType);

      if (columnDef.sortType === "string") {
        return sorting.direction === "asc"
          ? String(processedA).localeCompare(String(processedB))
          : String(processedB).localeCompare(String(processedA));
      }

      return sorting.direction === "asc"
        ? processedA - processedB
        : processedB - processedA;
    });
  }, [flights, sorting.column, sorting.direction, getFlightValue]);

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
            {columns
              .filter((column) => visibleColumns.includes(column.key))
              .map((column) => (
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
                      else if (sorting.direction === "desc")
                        newDirection = null;
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
            Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index}>
                {columns
                  .filter((column) => visibleColumns.includes(column.key))
                  .map((column) => (
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
                    colSpan={visibleColumns.length}
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
                    {columns
                      .filter((column) => visibleColumns.includes(column.key))
                      .map((column) => (
                        <TableCell key={column.key}>
                          {(() => {
                            const value = column.getValue?.(
                              flight,
                              aircraftMap
                            );

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
