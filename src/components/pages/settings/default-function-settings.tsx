import { useDefaultFunction, PilotFunction } from "@/hooks/useDefaultFunction";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DefaultFunctionSettings() {
  const [defaultFunction, setDefaultFunction] = useDefaultFunction();

  const functionOptions: { label: string; value: PilotFunction }[] = [
    { label: "PIC", value: "PIC" },
    { label: "Co-Pilot", value: "Co-Pilot" },
    { label: "Dual", value: "Dual" },
    { label: "Instructor", value: "Instructor" },
    { label: "Solo", value: "Solo" },
    { label: "SPIC", value: "SPIC" },
    { label: "PICUS", value: "PICUS" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Default Function</h3>
          <p className="text-sm text-muted-foreground">
            Choose your default function for new flight entries
          </p>
        </div>
        <Select
          value={defaultFunction}
          onValueChange={(value) => setDefaultFunction(value as PilotFunction)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select function" />
          </SelectTrigger>
          <SelectContent>
            {functionOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
