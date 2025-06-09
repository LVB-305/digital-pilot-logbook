import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Overlay } from "@/components/ui/overlay";
import { Skeleton } from "@/components/ui/skeleton";
import useLocalStorage from "@/hooks/useLocalStorage";
import { createClient } from "@/lib/supabase/client/client";
import { Crew } from "@/types/crew";
import { Check, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface CrewSelectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: Crew | null) => void;
  selectedCrew: string | null;
}

let crewCache: Crew[] | null = null;

const RECENT_CREW = "recent-crew";
const MAX_RECENT_CREW = 10;

export function CrewSelectDialog({
  isOpen,
  onClose,
  onSelect,
  selectedCrew,
}: CrewSelectDialogProps) {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Crew[]>([]);
  const [recent, setRecent] = useState<Crew[]>([]);
  const [nameOrder] = useLocalStorage("nameOrder", "firstNameFirst");
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    async function loadAircraft() {
      if (!isOpen) return;
      if (crewCache) {
        return;
      }

      setLoading(true);

      try {
        const { data: user } = await supabase.auth.getUser();
        const { data: crewData } = await supabase
          .from("pilots")
          .select("*")
          .eq("user_id", user.user?.id); // Add RLS policy to filter by user_id
        //   .order("first_name", { ascending: true }); // Add default sorting at database level
        crewCache = crewData || [];
      } catch (error) {
        console.error("Error loading crew data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAircraft();
  }, [supabase, isOpen]);

  // Load recent types
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_CREW);
    if (stored) {
      setRecent(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (!searchTerm || !crewCache) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      if (!crewCache) return;
      const results = crewCache
        .map((crew) => ({
          ...crew,
          display_name:
            nameOrder === "firstNameFirst"
              ? `${crew.first_name} ${crew.last_name}`
              : `${crew.last_name}, ${crew.first_name}`,
        }))
        .sort((a, b) => a.display_name.localeCompare(b.display_name))
        .filter(
          (crew) =>
            crew.display_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            crew.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            crew.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            crew.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            crew.company_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            crew.license_number
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())
        );

      setSearchResults(results);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSelect = (type: Crew) => {
    onSelect(type);

    // Update recent types
    const updatedRecent = [
      type,
      ...recent.filter((t) => t.id !== type.id),
    ].slice(0, MAX_RECENT_CREW);

    setRecent(updatedRecent);
    localStorage.setItem(RECENT_CREW, JSON.stringify(updatedRecent));
  };
  const handleClear = () => {
    onSelect(null);
  };

  const renderItem = (item: Crew) => (
    <button
      key={item.id}
      className="w-full px-4 py-3 text-left hover:bg-input flex items-center justify-between cursor-pointer"
      onClick={() => handleSelect(item)}
    >
      <div className="flex space-x-2">
        <div className="font-medium">
          {nameOrder === "firstNameFirst"
            ? `${item.first_name} ${item.last_name}`
            : `${item.last_name}, ${item.first_name}`}
        </div>

        <Badge variant="outline" className="rounded flex items-center">
          {item.company_id}
        </Badge>
      </div>
      {selectedCrew === item.id && <Check className="h-4 w-4 text-primary" />}
    </button>
  );

  return (
    <Overlay
      isOpen={isOpen}
      onClose={onClose}
      title="Select Crew Member"
      leadingButton={{ label: "Clear", onClick: handleClear, variant: "ghost" }}
      showDoneButton
      stickyHeader={
        <div className="relative w-full">
          <Input
            type="text"
            placeholder="Search by name, email, phone, or license"
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 rounded-none border-none focus-visible:ring-0"
            disabled={loading}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      }
    >
      <div className="divide-y">
        {loading ? (
          <div className="p-4 space-y-3">
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-12" />
          </div>
        ) : searchTerm ? (
          searchResults.length > 0 ? (
            <div className="bg-background divide-y">
              {searchResults.map(renderItem)}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No crew members found
            </div>
          )
        ) : (
          recent.length > 0 && (
            <div>
              <div className="px-4 py-2 text-sm font-medium text-muted-foreground">
                Recently Used
              </div>
              <div className="bg-background divide-y">
                {recent.map(renderItem)}
              </div>
            </div>
          )
        )}
      </div>
    </Overlay>
  );
}
