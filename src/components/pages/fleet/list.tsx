import { Suspense, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Aircraft } from "@/types/aircraft";
import { Skeleton } from "@/components/ui/skeleton";
import { SortFilterDialog } from "@/components/pages/fleet/list-filter-overlay";

interface FleetListProps {
  aircraft: Aircraft[];
  loading?: boolean;
  filterDialogOpen: boolean;
  onFilterDialogClose: () => void;
}

export function FleetList({
  aircraft,
  loading = false,
  filterDialogOpen,
  onFilterDialogClose,
}: FleetListProps) {
  const router = useRouter();

  const groupTypes = {
    operator: "operator",
    type: "type",
    icaoType: "icaoType",
  } as const;

  type GroupType = keyof typeof groupTypes;

  const [groupBy, setGroupBy] = useState<GroupType>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("fleetGroupBy") as GroupType) || "operator";
    }
    return "operator";
  });

  const groupAircraft = (aircraft: Aircraft[], groupBy: GroupType) => {
    const groups: Record<string, Aircraft[]> = {};

    aircraft.forEach((item) => {
      let key = "";
      switch (groupBy) {
        case "operator":
          key = item.operator ?? "No Operator";
          break;
        case "type":
          key = item.is_simulator ? "Simulator" : "Aircraft";
          break;
        case "icaoType":
          key = item.type ?? "Unknown Type";
          break;
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });

    return Object.entries(groups).map(([key, aircraftGroup]) => ({
      groupName: key,
      aircraft: aircraftGroup.sort((a, b) =>
        (a.registration ?? "").localeCompare(b.registration ?? "")
      ),
    }));
  };

  const groupedAircraft = useMemo(
    () => groupAircraft(aircraft, groupBy),
    [aircraft, groupBy]
  );

  return (
    <div>
      {loading ? (
        Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="divide-y space-y-2">
            <div className="px-3 pt-5">
              <Skeleton className="h-5 w-1/2" />
            </div>

            <div className="divide-y divide-primary-foreground">
              {Array.from({ length: 2 }, (_, index) => (
                <div key={index} className="px-3 py-2">
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <Suspense fallback={<div>Loading...</div>}>
          {aircraft.length === 0 ? (
            <div className="text-center">No aircraft found.</div>
          ) : (
            groupedAircraft.map(({ groupName, aircraft: groupAircraft }) => (
              <div key={groupName} className="pb-6">
                <div className="divide-y">
                  <div className="px-3 py-2 text-sm font-bold sticky top-0 text-gray-500 dark:text-gray-200 z-10">
                    {groupName}
                  </div>
                  {groupAircraft.map((aircraft) => (
                    <div
                      key={aircraft.id}
                      className="px-3 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700"
                      onClick={() => {
                        router.push(`/app/fleet/${aircraft.id}`);
                      }}
                    >
                      {aircraft.registration}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </Suspense>
      )}
      <SortFilterDialog
        isOpen={filterDialogOpen}
        onClose={onFilterDialogClose}
        groupBy={groupBy}
        onGroupChange={setGroupBy}
      />
    </div>
  );
}
