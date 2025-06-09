import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Crew } from "@/types/crew";

import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  PositionedGroup,
  PositionedItem,
} from "@/components/ui/positioned-group";
import { CrewSelectDialog } from "@/components/pages/flight-form/crew-select-overlay";
import { CrewDisplay } from "@/components/pages/crew/crew-name";
import { ChevronRight } from "lucide-react";
import { formatMinutesToTime, timeToMinutes } from "./form";

export function SimulatorFormFields() {
  const { control, setValue } = useFormContext();
  const [isCrewSelectDialogOpen, setCrewSelectDialogOpen] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);

  useEffect(() => {
    // Set default value of 1 hour (60 minutes)
    setValue("session_minutes", 60);
  }, [setValue]);

  const handleCrewSelect = (crew: Crew | null) => {
    if (crew) {
      setValue("instructor_id", crew.id);
      setSelectedCrew(crew);
    }
    setCrewSelectDialogOpen(false);
  };

  return (
    <>
      {/* Session Duration */}
      <PositionedGroup className="mt-4">
        <FormField
          control={control}
          name="session_minutes"
          render={({ field }) => (
            <FormItem>
              <PositionedItem position="first" className="p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Session Time</span>
                  <Input
                    type="time"
                    value={formatMinutesToTime(field.value || 0)}
                    onChange={(e) => {
                      field.onChange(timeToMinutes(e.target.value));
                    }}
                    className="w-24 text-center h-fit py-0 border-none dark:bg-transparent focus-visible:border-none focus-visible:ring-0 shadow-none"
                  />
                </div>
                <FormMessage />
              </PositionedItem>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="hobbs_start"
          render={({ field }) => (
            <FormItem>
              <PositionedItem position="middle" className="p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Hobbs Start</span>
                  <Input
                    {...field}
                    value={field.value || ""}
                    type="number"
                    placeholder="0.0"
                    step="0.1"
                    className="w-24 text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none h-fit py-0 border-none dark:bg-transparent focus-visible:border-none focus-visible:ring-0 shadow-none"
                  />
                </div>
                <FormMessage />
              </PositionedItem>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="hobbs_end"
          render={({ field }) => (
            <FormItem>
              <PositionedItem position="last" className="p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Hobbs End</span>
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder="0.0"
                    type="number"
                    step="0.1"
                    className="w-24 text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none h-fit py-0 border-none dark:bg-transparent focus-visible:border-none focus-visible:ring-0 shadow-none"
                  />
                </div>
                <FormMessage />
              </PositionedItem>
            </FormItem>
          )}
        />
      </PositionedGroup>

      {/* Instructor */}
      <PositionedGroup className="mt-4">
        <FormField
          control={control}
          name="instructor_id"
          render={({ field }) => (
            <FormItem>
              <button
                type="button"
                onClick={() => {
                  setCrewSelectDialogOpen(true);
                }}
                className="w-full cursor-pointer"
              >
                <PositionedItem
                  position="single"
                  className="p-3 flex items-center justify-between"
                >
                  <span className="text-sm font-medium text-foreground">
                    Instructor
                  </span>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">
                        <CrewDisplay id={field.value} />
                      </span>
                      <FormMessage />
                    </div>

                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </PositionedItem>
              </button>
            </FormItem>
          )}
        />
      </PositionedGroup>

      {/* Remarks */}
      <PositionedGroup className="mt-4">
        <FormField
          control={control}
          name="remarks"
          render={({ field }) => (
            <FormItem>
              <PositionedItem
                position="first"
                className="p-3 flex items-center justify-between"
              >
                <span className="text-sm font-medium">Remarks</span>
                <div className="w-full ml-2 flex flex-col gap-1">
                  <Input
                    {...field}
                    className="w-full h-fit py-0 border-none dark:bg-transparent focus-visible:border-none focus-visible:ring-0 shadow-none text-right"
                  />
                  <FormMessage />
                </div>
              </PositionedItem>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="training_description"
          render={({ field }) => (
            <FormItem>
              <PositionedItem
                position="middle"
                className="p-3 flex items-center justify-between"
              >
                <span className="text-sm font-medium">Training</span>
                <div className="w-full ml-2 flex flex-col gap-1">
                  <Input
                    {...field}
                    className="w-full h-fit py-0 border-none dark:bg-transparent focus-visible:border-none focus-visible:ring-0 shadow-none text-right"
                  />
                  <FormMessage />
                </div>
              </PositionedItem>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <PositionedItem
                position="last"
                className="p-3 flex items-center justify-between"
              >
                <span className="text-sm font-medium">Endorsement</span>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Placeholder</span>
                    <FormMessage />
                  </div>

                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </PositionedItem>
            </FormItem>
          )}
        />
      </PositionedGroup>

      <CrewSelectDialog
        isOpen={isCrewSelectDialogOpen}
        onClose={() => setCrewSelectDialogOpen(false)}
        onSelect={handleCrewSelect}
        selectedCrew={selectedCrew?.id || null}
      />
    </>
  );
}
