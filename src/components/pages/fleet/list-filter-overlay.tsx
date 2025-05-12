import { Overlay } from "@/components/ui/overlay";
import { ChevronsUpDown } from "lucide-react";
import { FloatingSelect } from "@/components/ui/floating-select";
import { useState, useRef } from "react";

const groupTypes = {
  operator: "operator",
  type: "type",
  icaoType: "icaoType",
} as const;

type GroupType = keyof typeof groupTypes;

interface SortFilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  groupBy: GroupType;
  onGroupChange: (group: GroupType) => void;
}

export function SortFilterDialog({
  isOpen,
  onClose,
  groupBy,
  onGroupChange,
}: SortFilterDialogProps) {
  const [showGroupSelect, setShowGroupSelect] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const groupOptions = [
    { label: "Operator", value: "operator" },
    { label: "Type", value: "type" },
    { label: "ICAO Type", value: "icaoType" },
  ];

  const handleGroupChange = (newGroup: string) => {
    onGroupChange(newGroup as GroupType);
    localStorage.setItem("fleetGroupBy", newGroup);
  };

  return (
    <Overlay isOpen={isOpen} onClose={onClose} title="Sort" showDoneButton>
      <div className="w-full divide-y">
        <button
          ref={buttonRef}
          onClick={() => setShowGroupSelect(true)}
          className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer"
        >
          <div className="pr-5">
            <div className="font-medium">Group</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Select the desired group of devices
            </div>
          </div>
          <div className="flex items-center text-gray-400">
            <span className="mr-2">
              {groupOptions.find((opt) => opt.value === groupBy)?.label}
            </span>
            <ChevronsUpDown className="h-4 w-4" />
          </div>
        </button>
      </div>

      <FloatingSelect
        isOpen={showGroupSelect}
        onClose={() => setShowGroupSelect(false)}
        options={groupOptions}
        value={groupBy}
        onChange={handleGroupChange}
        triggerRef={buttonRef}
      />
    </Overlay>
  );
}
