import { useState, useRef, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  PositionedGroup,
  PositionedItem,
} from "@/components/ui/positioned-group";
import { formatMinutesToTime, timeToMinutes } from "./form";
import { ChevronRight, ChevronsUpDown } from "lucide-react";
import { FloatingSelect } from "@/components/ui/floating-select";
import { useDefaultFunction } from "@/hooks/useDefaultFunction";
import { AirportSelectDialog } from "./airport-select-overlay";
// import { Airport, Runway } from "@/schemas/auth/airport";
import { Airport, Runway } from "@/types/airport";
import { formatLocation } from "@/types/flight";
import { CrewDisplay } from "../crew/crew-name";
import { Crew } from "@/types/crew";
import { CrewSelectDialog } from "./crew-select-overlay";
import { Switch } from "@/components/ui/switch";

type AirportSelectType = "departure" | "destination" | null;

export function FlightFormFields() {
  const { control, setValue, watch } = useFormContext();
  const [showFunctionSelect, setShowFunctionSelect] = useState(false);
  const [isCrewSelectDialogOpen, setCrewSelectDialogOpen] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const [airportSelectType, setAirportSelectType] =
    useState<AirportSelectType>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const total_block_minutes = watch("total_block_minutes") || 0;
  const [defaultFunction] = useDefaultFunction();

  const departure_airport_code = watch("departure_airport_code");
  const destination_airport_code = watch("destination_airport_code");

  // Set the default function when the form mounts
  useEffect(() => {
    if (defaultFunction) {
      setValue("function", defaultFunction);
      handleFunctionChange(defaultFunction);
    }
  }, [defaultFunction, setValue]);

  const functionOptions = [
    { label: "PIC", value: "PIC" },
    { label: "Co-Pilot", value: "Co-Pilot" },
    { label: "Dual", value: "Dual" },
    { label: "Instructor", value: "Instructor" },
    { label: "Solo", value: "Solo" },
    { label: "SPIC", value: "SPIC" },
    { label: "PICUS", value: "PICUS" },
  ];

  const handleFunctionChange = (value: string) => {
    // Reset all function-related fields first
    setValue("pic_time_minutes", 0);
    setValue("dual_time_minutes", 0);
    setValue("copilot_time_minutes", 0);
    setValue("instructor_time_minutes", 0);
    setValue("is_solo", false);
    setValue("is_spic", false);
    setValue("is_picus", false);

    // Set the appropriate field based on function
    switch (value) {
      case "PIC":
        setValue("pic_time_minutes", total_block_minutes);
        break;
      case "Co-Pilot":
        setValue("copilot_time_minutes", total_block_minutes);
        break;
      case "Dual":
        setValue("dual_time_minutes", total_block_minutes);
        break;
      case "Instructor":
        setValue("instructor_time_minutes", total_block_minutes);
        break;
      case "Solo":
        setValue("is_solo", true);
        setValue("pic_time_minutes", total_block_minutes);
        break;
      case "SPIC":
        setValue("is_spic", true);
        setValue("pic_time_minutes", total_block_minutes);
        break;
      case "PICUS":
        setValue("is_picus", true);
        setValue("pic_time_minutes", total_block_minutes);
        break;
    }
  };

  const handleAirportSelect = (
    selection: { airport: Airport; runway: Runway | null } | null
  ) => {
    if (!selection) {
      if (airportSelectType === "departure") {
        setValue("departure_airport_code", "");
        setValue("departure_runway", null);
      } else {
        setValue("destination_airport_code", "");
        setValue("destination_runway", null);
      }
      setAirportSelectType(null);
      return;
    }
    const { airport, runway } = selection;
    if (airportSelectType === "departure") {
      setValue("departure_airport_code", airport.icao);
      setValue("departure_runway", runway?.ident || null);
    } else {
      setValue("destination_airport_code", airport.icao);
      setValue("destination_runway", runway?.ident || null);
    }
    setAirportSelectType(null);
  };

  const handleCrewSelect = (crew: Crew | null) => {
    if (crew) {
      setValue("pic_id", crew.id);
      setSelectedCrew(crew);
    }
    setCrewSelectDialogOpen(false);
  };

  return (
    <>
      {/* Route Information */}
      <PositionedGroup className="mt-4">
        <FormField
          name="departure_airport_code"
          render={({ field }) => (
            <FormItem>
              <button
                type="button"
                onClick={() => setAirportSelectType("departure")}
                className="w-full cursor-pointer"
              >
                <PositionedItem
                  position="first"
                  className="p-3 flex items-center justify-between"
                >
                  <span className="text-sm font-medium">Departure</span>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <div className="flex flex-col gap-1">
                      <span
                        className={field.value ? "" : "text-muted-foreground"}
                      >
                        {formatLocation(
                          field.value || "",
                          watch("departure_runway")
                        ) || "Select"}
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

        <FormField
          name="destination_airport_code"
          render={({ field }) => (
            <FormItem>
              <button
                type="button"
                onClick={() => setAirportSelectType("destination")}
                className="w-full cursor-pointer"
              >
                <PositionedItem
                  position="last"
                  className="p-3 flex items-center justify-between"
                >
                  <span className="text-sm font-medium">Destination</span>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <div className="flex flex-col gap-1">
                      <span
                        className={field.value ? "" : "text-muted-foreground"}
                      >
                        {formatLocation(
                          field.value || "",
                          watch("destination_runway")
                        ) || "Select"}
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

      {/* Single Airport Selection Overlay */}
      <AirportSelectDialog
        isOpen={airportSelectType !== null}
        onClose={() => setAirportSelectType(null)}
        onSelect={handleAirportSelect}
        selectedAirports={
          airportSelectType === "departure"
            ? departure_airport_code
            : destination_airport_code
        }
      />

      {/* START & END */}
      <PositionedGroup className="mt-4">
        <FormField
          name="block_start"
          render={({ field }) => (
            <FormItem>
              <PositionedItem position="first" className="p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Block Start</span>
                  <Input
                    {...field}
                    type="time"
                    className="w-24 text-center h-fit py-0 border-none dark:bg-transparent focus-visible:border-none focus-visible:ring-0 shadow-none"
                  />
                </div>
                <FormMessage />
              </PositionedItem>
            </FormItem>
          )}
        />

        <FormField
          name="flight_start"
          render={({ field }) => (
            <FormItem>
              <PositionedItem position="middle" className="p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Take Off</span>
                  <Input
                    {...field}
                    type="time"
                    className="w-24 text-center h-fit py-0 border-none dark:bg-transparent focus-visible:border-none focus-visible:ring-0 shadow-none"
                  />
                </div>
                <FormMessage />
              </PositionedItem>
            </FormItem>
          )}
        />

        <FormField
          name="flight_end"
          render={({ field }) => (
            <FormItem>
              <PositionedItem position="middle" className="p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Landing</span>
                  <Input
                    {...field}
                    type="time"
                    className="w-24 text-center h-fit py-0 border-none dark:bg-transparent focus-visible:border-none focus-visible:ring-0 shadow-none"
                  />
                </div>
                <FormMessage />
              </PositionedItem>
            </FormItem>
          )}
        />

        <FormField
          name="block_end"
          render={({ field }) => (
            <FormItem>
              <PositionedItem position="last" className="p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Block End</span>
                  <Input
                    {...field}
                    type="time"
                    className="w-24 text-center h-fit py-0 border-none dark:bg-transparent focus-visible:border-none focus-visible:ring-0 shadow-none"
                  />
                </div>
                <FormMessage />
              </PositionedItem>
            </FormItem>
          )}
        />
      </PositionedGroup>

      {/* HOBBS & TACH */}
      <PositionedGroup className="mt-4">
        <FormField
          name="hobbs_start"
          render={({ field }) => (
            <FormItem>
              <PositionedItem position="first" className="p-3">
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
          name="hobbs_end"
          render={({ field }) => (
            <FormItem>
              <PositionedItem position="middle" className="p-3">
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

        <FormField
          name="tach_start"
          render={({ field }) => (
            <FormItem>
              <PositionedItem position="middle" className="p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tach Start</span>
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
          name="tach_end"
          render={({ field }) => (
            <FormItem>
              <PositionedItem position="last" className="p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tach End</span>
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

      {/* TIMES */}
      <PositionedGroup className="mt-4">
        <FormField
          name="total_block_minutes"
          render={({ field }) => (
            <FormItem>
              <PositionedItem position="first" className="p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Time</span>
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
          name="total_air_minutes"
          render={({ field }) => (
            <FormItem>
              <PositionedItem position="middle" className="p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Air Time</span>
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
          name="night_time_minutes"
          render={({ field }) => (
            <FormItem>
              <PositionedItem position="middle" className="p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Night Time</span>
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
          name="ifr_time_minutes"
          render={({ field }) => (
            <FormItem>
              <PositionedItem position="middle" className="p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">IFR Time</span>
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
          name="xc_time_minutes"
          render={({ field }) => (
            <FormItem>
              <PositionedItem position="middle" className="p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">XC Time</span>
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
          name="function"
          render={({ field }) => (
            <>
              <PositionedItem position="middle" className="p-3">
                <button
                  type="button"
                  ref={(el) => {
                    buttonRef.current = el;
                    if (typeof field.ref === "function") field.ref(el);
                  }}
                  onClick={() => setShowFunctionSelect(!showFunctionSelect)}
                  className="w-full cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Function</span>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col gap 1">
                        <span className="text-muted-foreground">
                          {field.value}
                        </span>
                        <FormMessage />
                      </div>
                      <ChevronsUpDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </button>
              </PositionedItem>
              <FloatingSelect
                isOpen={showFunctionSelect}
                onClose={() => setShowFunctionSelect(false)}
                options={functionOptions}
                value={field.value ?? undefined}
                onChange={(value) => {
                  field.onChange(value);
                  handleFunctionChange(value);
                  setShowFunctionSelect(false);
                }}
                triggerRef={buttonRef}
              />
            </>
          )}
        />

        <FormField
          name="pilot_flying"
          render={({ field }) => (
            <PositionedItem position="last" className="p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Pilot Flying</span>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap 1">
                    <Switch
                      checked={field.value ?? true}
                      onCheckedChange={field.onChange}
                      className="cursor-pointer"
                    />
                    <FormMessage />
                  </div>
                </div>
              </div>
            </PositionedItem>
          )}
        />
      </PositionedGroup>

      {/* PIC */}
      <PositionedGroup className="mt-4">
        <FormField
          control={control}
          name="pic_id"
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
                    PIC
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

      <CrewSelectDialog
        isOpen={isCrewSelectDialogOpen}
        onClose={() => setCrewSelectDialogOpen(false)}
        onSelect={handleCrewSelect}
        selectedCrew={selectedCrew?.id || null}
      />

      {/* Takeoffs & Landings & Go-arounds & autolands & approaches */}
      <PositionedGroup className="mt-4">
        <FormField
          name="day_takeoffs"
          render={({ field }) => (
            <FormItem>
              <PositionedItem position="first" className="p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Day T/O</span>
                  <Input {...field} type="number" className="w-32 text-right" />
                </div>
                <FormMessage />
              </PositionedItem>
            </FormItem>
          )}
        />

        <FormField
          name="night_takeoffs"
          render={({ field }) => (
            <FormItem>
              <PositionedItem position="middle" className="p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Night T/O</span>
                  <Input {...field} type="number" className="w-32 text-right" />
                </div>
                <FormMessage />
              </PositionedItem>
            </FormItem>
          )}
        />

        <FormField
          name="day_landings"
          render={({ field }) => (
            <FormItem>
              <PositionedItem position="middle" className="p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Day LDG</span>
                  <Input {...field} type="number" className="w-32 text-right" />
                </div>
                <FormMessage />
              </PositionedItem>
            </FormItem>
          )}
        />

        <FormField
          name="night_landings"
          render={({ field }) => (
            <FormItem>
              <PositionedItem position="last" className="p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Night LDG</span>
                  <Input {...field} type="number" className="w-32 text-right" />
                </div>
                <FormMessage />
              </PositionedItem>
            </FormItem>
          )}
        />
      </PositionedGroup>
    </>
  );
}
