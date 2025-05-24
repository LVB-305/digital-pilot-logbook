import { Overlay } from "@/components/ui/overlay";
import { ChevronRight } from "lucide-react";
import { ColumnsVisibilityOverlay } from "./columns-visibility-overlay";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { columns } from "@/types/flight";
import { useState } from "react";

interface ViewOptionsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  visibleColumns: string[];
  onVisibilityChange: (columns: string[]) => void;
}

export function ViewOptionsOverlay({
  isOpen,
  onClose,
  visibleColumns,
  onVisibilityChange,
}: ViewOptionsOverlayProps) {
  const [showColumnsOverlay, setShowColumnsOverlay] = useState(false);

  return (
    <>
      <Overlay
        isOpen={isOpen && !showColumnsOverlay}
        onClose={onClose}
        title="View Options"
        showDoneButton
      >
        <div className="divide-y">
          <button
            onClick={() => setShowColumnsOverlay(true)}
            className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <div className="pr-5">
              <div className="font-medium">Columns</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Select the desired table columns
              </div>
            </div>
            <div className="flex items-center text-gray-400">
              <span className="mr-2">{visibleColumns.length}</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </button>
        </div>
      </Overlay>

      <ColumnsVisibilityOverlay
        isOpen={isOpen && showColumnsOverlay}
        onClose={() => setShowColumnsOverlay(false)}
        visibleColumns={visibleColumns}
        onVisibilityChange={onVisibilityChange}
      />
    </>
  );
}
