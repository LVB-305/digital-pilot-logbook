import { Suspense, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { columns, CrewItem } from "@/types/crew";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

type SortDirection = "asc" | "desc" | null;

interface CrewTableProps {
  crew: CrewItem[];
  loading?: boolean;
}

export function CrewTable({ crew, loading = false }: CrewTableProps) {
  const router = useRouter();

  const [sorting, setSorting] = useState<{
    column: keyof CrewItem | null;
    direction: SortDirection;
  }>({
    column: null,
    direction: null,
  });

  const sortData = (column: keyof CrewItem, direction: SortDirection) => {
    setSorting({ column, direction });
  };

  const sortedCrew = useMemo(() => {
    if (!sorting.column || sorting.direction === null) return crew;

    return [...crew].sort((a, b) => {
      const columnDef = columns.find((col) => col.key === sorting.column);
      if (!columnDef) return 0;

      // Special handling for the name column
      if (sorting.column === "first_name" && columnDef.formatFn) {
        return sorting.direction === "asc"
          ? columnDef.formatFn(a).localeCompare(columnDef.formatFn(b))
          : columnDef.formatFn(b).localeCompare(columnDef.formatFn(a));
      }

      const valueA = a[sorting.column as keyof CrewItem];
      const valueB = b[sorting.column as keyof CrewItem];

      if (valueA === undefined || valueB === undefined) return 0;

      switch (columnDef.sortType) {
        case "string":
          if (columnDef.formatFn) {
            return sorting.direction === "asc"
              ? columnDef.formatFn(a).localeCompare(columnDef.formatFn(b))
              : columnDef.formatFn(b).localeCompare(columnDef.formatFn(a));
          }
          return sorting.direction === "asc"
            ? String(valueA).localeCompare(String(valueB))
            : String(valueB).localeCompare(String(valueA));
        case "number":
          return sorting.direction === "asc"
            ? Number(valueA) - Number(valueB)
            : Number(valueB) - Number(valueA);
        case "date":
          const parseDate = (dateStr: string) => {
            const [day, month, year] = dateStr.split("/").map(Number);
            return new Date(year, month - 1, day).getTime();
          };
          return sorting.direction === "asc"
            ? parseDate(String(valueA)) - parseDate(String(valueB))
            : parseDate(String(valueB)) - parseDate(String(valueA));
        default:
          return 0;
      }
    });
  }, [crew, sorting.column, sorting.direction]);

  return (
    <div className="max-w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={`${
                  column.sortable ? "cursor-pointer select-none" : ""
                } whitespace-nowrap`}
                style={{ minWidth: column.width, width: column.width }}
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
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {columns.map((columnKey) => (
                  <TableCell key={`${index}-${columnKey}`}>
                    <Skeleton className="h-6 w-[100px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <Suspense fallback={<div>Loading...</div>}>
              {sortedCrew.length > 0 ? (
                sortedCrew.map((crewMember) => (
                  <TableRow
                    key={crewMember.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      router.push(`/app/crew/${crewMember.id}`);
                    }}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className="whitespace-nowrap"
                        style={{ minWidth: column.width, width: column.width }}
                        dangerouslySetInnerHTML={
                          column.formatFn
                            ? { __html: column.formatFn(crewMember) }
                            : {
                                __html:
                                  crewMember[column.key]?.toString() || "",
                              }
                        }
                      />
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <div className="h-25 text-center">
                      <span>No crew members found.</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </Suspense>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
