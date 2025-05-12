import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { CrewItem } from "@/types/crew";
import { Skeleton } from "@/components/ui/skeleton";

interface CrewListProps {
  crew: CrewItem[];
  loading?: boolean;
}

export function CrewList({ crew, loading = false }: CrewListProps) {
  const router = useRouter();

  const groupCrewByFirstLetter = (crew: CrewItem[]) => {
    const groups: Record<string, CrewItem[]> = {};

    crew.forEach((member) => {
      const firstLetter = member.display_name.charAt(0).toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(member);
    });

    return Object.entries(groups).map(([letter, crew]) => ({
      letter,
      crew: crew.sort((a, b) => a.display_name.localeCompare(b.display_name)),
    }));
  };

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
          {crew.length === 0 ? (
            <div className="text-center">No crew members found.</div>
          ) : (
            groupCrewByFirstLetter(crew).map(({ letter, crew }) => (
              <div key={letter} className="pb-6">
                <div className="divide-y">
                  <div className="px-3 py-2 text-sm font-bold sticky top-0 text-gray-500 dark:text-gray-200 z-10">
                    {letter}
                  </div>
                  {crew.map((crewMember) => (
                    <div
                      key={crewMember.id}
                      className="px-3 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700"
                      onClick={() => {
                        router.push(`/app/crew/${crewMember.id}`);
                      }}
                    >
                      {crewMember.display_name}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </Suspense>
      )}
    </div>
  );
}
