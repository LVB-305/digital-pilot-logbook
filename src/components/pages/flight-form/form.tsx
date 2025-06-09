import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Flight, FlightSchema } from "@/types/flight";
import { Aircraft } from "@/types/aircraft";

import { getAircraft } from "@/actions/pages/fleet/fleet";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import {
  PositionedGroup,
  PositionedItem,
} from "@/components/ui/positioned-group";
import { Skeleton } from "@/components/ui/skeleton";
import { AircraftRegistration } from "@/components/pages/fleet/aircraft-registration";
import { AircraftSelectDialog } from "@/components/pages/flight-form/aircraft-select-overlay";
import { FlightFormFields } from "@/components/pages/flight-form/flight-form-fields";
import { SimulatorFormFields } from "@/components/pages/flight-form/simulator-form-fields";

import { ChevronRight } from "lucide-react";

const STORAGE_KEY = "flight-form-draft";

// Format number of minutes into HH:mm format
export const formatMinutesToTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
};

// Convert HH:mm format to total minutes
export const timeToMinutes = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

export default function FlightForm({
  flight,
  isLoading,
}: {
  flight?: Flight;
  isLoading?: boolean;
}) {
  const [isAircraftSelectDialogOpen, setAircraftSelectDialogOpen] =
    useState(false);
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(
    null
  );

  const form = useForm<Flight>({
    resolver: zodResolver(FlightSchema),
  });

  const isEdit = !!flight;
  const hasFormData = Object.entries(form.getValues()).some(([key, value]) => {
    // Ignore date and aircraft_id fields
    if (key === "date" || key === "aircraft_id") return false;
    // Check if any other field has a value
    return value !== undefined && value !== null && value !== "";
  });

  // Load aircraft details when aircraft_id changes
  useEffect(() => {
    const aircraftId = form.watch("aircraft_id");
    if (aircraftId) {
      getAircraft(aircraftId).then(setSelectedAircraft);
    }
  }, [form.watch("aircraft_id")]);

  const handleDraftSave = () => {
    if (!isEdit) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form.getValues()));
    }
  };

  const resetForm = () => {
    localStorage.removeItem(STORAGE_KEY);
    form.reset();
  };

  const handleAircraftSelect = (aircraft: Aircraft | null) => {
    if (!aircraft) return;
    if (
      hasFormData &&
      selectedAircraft &&
      aircraft.is_simulator !== selectedAircraft.is_simulator
    ) {
      if (
        window.confirm(
          "Changing between aircraft and simulator will clear all entered data. Are you sure you want to continue?"
        )
      ) {
        form.reset({ date: form.getValues("date") }); // Keep only the date
        form.setValue("aircraft_id", aircraft.id);
        setSelectedAircraft(aircraft);
      }
      setAircraftSelectDialogOpen(false);
    } else {
      form.setValue("aircraft_id", aircraft.id);
      setSelectedAircraft(aircraft);
      setAircraftSelectDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="New Flight"
        backHref="/app/flights"
        showBackButton
        isTopLevelPage={false}
        actionButton={
          isLoading ? (
            <Skeleton className="h-10 w-10" />
          ) : (
            <Button
              variant="ghost"
              className="text-primary font-medium hover:bg-primary-foreground w-10 h-10"
            >
              Save
            </Button>
          )
        }
      />
      <div className="overflow-auto p-3">
        <Form {...form}>
          <form>
            <PositionedGroup>
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <PositionedItem
                      position="first"
                      className="p-3 flex items-center justify-between"
                    >
                      <span className="text-sm font-medium text-foreground">
                        Date
                      </span>
                      <div className="flex flex-col gap-1">
                        <input
                          type="date"
                          defaultValue={
                            field.value ||
                            new Date().toISOString().split("T")[0]
                          }
                          className="text-sm placeholder-muted-foreground"
                        />
                        <FormMessage />
                      </div>
                    </PositionedItem>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aircraft_id"
                render={({ field }) => (
                  <FormItem>
                    <button
                      type="button"
                      onClick={() => setAircraftSelectDialogOpen(true)}
                      className="w-full cursor-pointer"
                    >
                      <PositionedItem
                        position="last"
                        className="p-3 flex items-center justify-between"
                      >
                        <span className="text-sm font-medium text-foreground">
                          Aircraft
                        </span>
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground">
                              {field.value && (
                                <AircraftRegistration id={field.value} />
                              )}
                            </span>
                            <FormMessage />
                          </div>

                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </PositionedItem>
                    </button>
                  </FormItem>
                )}
              />
            </PositionedGroup>

            {/* Aircraft type specific forms */}
            {selectedAircraft &&
              (selectedAircraft.is_simulator ? (
                <SimulatorFormFields />
              ) : (
                <FlightFormFields />
              ))}
          </form>
        </Form>
      </div>

      <AircraftSelectDialog
        isOpen={isAircraftSelectDialogOpen}
        onClose={() => setAircraftSelectDialogOpen(false)}
        onSelect={handleAircraftSelect}
        selectedAircraft={form.watch("aircraft_id") || null}
      />
    </div>
  );
}
