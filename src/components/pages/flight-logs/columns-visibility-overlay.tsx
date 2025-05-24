import { Label } from "@/components/ui/label";
import { Overlay } from "@/components/ui/overlay";
import { Switch } from "@/components/ui/switch";
import { ColumnKey, columns } from "@/types/flight";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ColumnsVisibilityOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  visibleColumns: string[];
  onVisibilityChange: (columns: string[]) => void;
}

export function ColumnsVisibilityOverlay({
  isOpen,
  onClose,
  visibleColumns,
  onVisibilityChange,
}: ColumnsVisibilityOverlayProps) {
  const handleToggle = (columnKey: string) => {
    if (visibleColumns.includes(columnKey)) {
      // Don't allow hiding if this is the last visible column
      if (visibleColumns.length <= 1) {
        return;
      }
      onVisibilityChange(visibleColumns.filter((key) => key !== columnKey));
    } else {
      onVisibilityChange([...visibleColumns, columnKey]);
    }
  };

  return (
    <Overlay
      isOpen={isOpen}
      onClose={onClose}
      title="Columns"
      leadingButton={{
        label: "Back",
        onClick: onClose,
        variant: "ghost",
      }}
      showDoneButton={false}
    >
      <div className="w-full divide-y overflow-y-auto">
        {columns.map((column) => (
          <div
            key={column.key}
            className="flex items-center justify-between p-4 space-x-4 bg-white hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          >
            <div className="flex-1 min-w-0">
              <Label
                htmlFor={`column-${column.key}`}
                className="font-medium block truncate"
              >
                {column.label}
              </Label>
              {column.sortable && (
                <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                  <ArrowUpDown className="h-3 w-3 mr-1 inline" />
                  Sortable
                </div>
              )}
            </div>
            <Switch
              id={`column-${column.key}`}
              checked={visibleColumns.includes(column.key)}
              onCheckedChange={() => handleToggle(column.key)}
              // Disable the switch if this is the last visible column
              disabled={
                visibleColumns.length <= 1 &&
                visibleColumns.includes(column.key)
              }
            />
          </div>
        ))}
      </div>
    </Overlay>
  );
}
