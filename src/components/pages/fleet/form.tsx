import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Aircraft,
  AircraftForm,
  AircraftFormSubmit,
  AircraftSchema,
} from "@/types/aircraft";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createAircraft,
  deleteAircraft,
  updateAircraft,
} from "@/actions/pages/fleet/fleet";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { Switch } from "@/components/ui/switch";
import { TypeSelectDialog } from "@/components/pages/fleet/type-select-overlay";
import { ChevronRight, ChevronsUpDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { FloatingSelect } from "@/components/ui/floating-select";

const STORAGE_KEY = "fleet-form-draft";

const emptyValues = {
  registration: "",
  is_simulator: false,
  type: "",
  model: "",
  manufacturer: "",
  category: "",
  engine_count: 0,
  engine_type: "",
  passenger_seats: 0,
  operator: "",
  status: "active",
  note: "",
};

export default function FleetForm({
  fleet,
  isLoading,
}: {
  fleet?: AircraftFormSubmit;
  isLoading?: boolean;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTypeSelectDialogOpen, setTypeSelectDialogOpen] = useState(false);

  const [showCategorySelect, setShowCategorySelect] = useState(false);
  const categoryRef = useRef<HTMLButtonElement | null>(null);
  const categoryOptions = [
    { label: "Single Pilot", value: "single-pilot" },
    { label: "Multi Pilot", value: "multi-pilot" },
  ];

  const [showEngineTypeSelect, setShowEngineTypeSelect] = useState(false);
  const engineTypeRef = useRef<HTMLButtonElement | null>(null);
  const enginetypeOptions = [
    { label: "Piston", value: "piston" },
    { label: "Turboprop", value: "turboprop" },
    { label: "Jet", value: "jet" },
    { label: "Helicopter", value: "helicopter" },
    { label: "Electric", value: "electric" },
    { label: "Unpowered", value: "unpowered" },
  ];

  const [showStatusSelect, setShowStatusSelect] = useState(false);
  const statusRef = useRef<HTMLButtonElement | null>(null);
  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Stored", value: "stored" },
    { label: "Scrapped", value: "Scrapped" },
    { label: "Sold", value: "sold" },
    { label: "", value: "" },
  ];

  const isEdit = !!fleet;

  const form = useForm<AircraftForm>({
    resolver: zodResolver(AircraftSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (fleet && !isLoading) {
      form.reset({
        registration: fleet.registration,
        is_simulator: fleet.is_simulator,
        type: fleet.type,
        model: fleet.model,
        manufacturer: fleet.manufacturer,
        category: fleet.category,
        engine_count: fleet.engine_count,
        engine_type: fleet.engine_type,
        passenger_seats: fleet.passenger_seats,
        operator: fleet.operator,
        status: fleet.status,
        note: fleet.note,
      });
    }
  }, [fleet, isLoading, form]);

  useEffect(() => {
    if (!isEdit && !isLoading) {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        form.reset(JSON.parse(savedData));
      }
    }
  }, [isEdit, isLoading, form]);
  const onSubmit = async (data: AircraftForm) => {
    try {
      setIsSubmitting(true);

      if (isEdit && fleet) {
        await updateAircraft({
          ...fleet,
          ...data,
          updated_at: new Date().toISOString(),
        });
        console.log(
          `${
            data.is_simulator ? "Simulator" : "Aircraft"
          } updated successfully.`
        );
      } else {
        await createAircraft(data);
        console.log(
          `${
            data.is_simulator ? "Simulator" : "Aircraft"
          } updated successfully.`
        );
      }

      localStorage.removeItem(STORAGE_KEY);
      router.push("/app/fleet");
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDraftSave = () => {
    if (!isEdit) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form.getValues()));
    }
  };

  const resetForm = () => {
    localStorage.removeItem(STORAGE_KEY);
    form.reset(emptyValues);
  };

  const handleDelete = async () => {
    if (!fleet?.id) return;

    if (
      !confirm(
        `Are you sure you want to delete this ${
          fleet.is_simulator ? "simulator" : "aircraft"
        }?`
      )
    ) {
      return;
    }

    try {
      setIsSubmitting(true);
      await deleteAircraft(fleet.id);
      router.push("/app/fleet");
    } catch (error) {
      console.error(
        error instanceof Error
          ? error.message
          : `Failed to delete ${fleet.is_simulator ? "simulator" : "aircraft"}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormField = (
    name: keyof AircraftForm,
    label: string,
    type: string = "text",
    required: boolean = false
  ) => {
    if (isLoading) {
      return (
        <FormItem className="py-2">
          <Skeleton className="h-12 w-full" />
        </FormItem>
      );
    }

    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem className="py-2">
            <FloatingLabelInput
              type={type}
              label={label}
              {...field}
              className="border-none rounded-sm"
              value={field.value?.toString() || ""}
              onChange={(e) => {
                const value =
                  type === "number"
                    ? parseFloat(e.target.value) || 0
                    : e.target.value;
                field.onChange(value);
              }}
              required={required}
            />
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title={isEdit ? "Edit" : "New"}
        backHref="/app/fleet"
        showBackButton={true}
        isTopLevelPage={false}
        actionButton={
          isLoading ? (
            <Skeleton className="h-10 w-10" />
          ) : (
            <Button
              variant="ghost"
              className="text-primary font-medium hover:bg-primary-foreground w-10 h-10"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? "..." : "Save"}
            </Button>
          )
        }
      />
      <div className="overflow-auto p-4">
        <Form {...form}>
          <form onChange={handleDraftSave} className="space-y-4">
            <div className="border-y divide-y">
              {renderFormField("registration", "Registration *", "text", true)}

              {/* SWITCH */}
              {isLoading ? (
                <FormItem className="py-2">
                  <Skeleton className="h-24 w-full" />
                </FormItem>
              ) : (
                <FormField
                  control={form.control}
                  name="is_simulator"
                  render={({ field }) => (
                    <FormItem className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="pr-5">
                          <div className="text-base">Simulator</div>
                        </div>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="cursor-pointer"
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {isLoading ? (
                <FormItem className="py-2">
                  <Skeleton className="h-24 w-full" />
                </FormItem>
              ) : (
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="p-4">
                      <button
                        type="button"
                        onClick={() => setTypeSelectDialogOpen(true)}
                        className="w-full cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="pr-5">
                            <div className="text-base">Type</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              {field.value}
                            </span>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </button>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {renderFormField("model", "Model", "text", false)}
              {renderFormField("manufacturer", "Manufacturer", "text", false)}

              {/* CATEGORY SELECT */}
              {isLoading ? (
                <FormItem className="py-2">
                  <Skeleton className="h-24 w-full" />
                </FormItem>
              ) : (
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="p-4">
                      {" "}
                      <button
                        type="button"
                        ref={categoryRef}
                        onClick={() =>
                          setShowCategorySelect(!showCategorySelect)
                        }
                        className="w-full cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="pr-5">
                            <div className="text-base">Category</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              {(field.value ?? "").charAt(0).toUpperCase() +
                                (field.value ?? "").slice(1)}
                            </span>
                            <ChevronsUpDown className="w-4 h-4" />
                          </div>
                        </div>
                      </button>
                      <FormMessage />
                      <FloatingSelect
                        isOpen={showCategorySelect}
                        onClose={() => setShowCategorySelect(false)}
                        options={categoryOptions}
                        value={field.value ?? undefined}
                        onChange={(value) => {
                          field.onChange(value);
                          setShowCategorySelect(false);
                        }}
                        triggerRef={categoryRef}
                      />
                    </FormItem>
                  )}
                />
              )}

              {renderFormField("engine_count", "Engine Count", "number", false)}

              {/* ENGINE TYPE SELECT */}
              {isLoading ? (
                <FormItem className="py-2">
                  <Skeleton className="h-24 w-full" />
                </FormItem>
              ) : (
                <FormField
                  control={form.control}
                  name="engine_type"
                  render={({ field }) => (
                    <FormItem className="p-4">
                      {" "}
                      <button
                        type="button"
                        ref={engineTypeRef}
                        onClick={() =>
                          setShowEngineTypeSelect(!showEngineTypeSelect)
                        }
                        className="w-full cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="pr-5">
                            <div className="text-base">Engine Type</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              {(field.value ?? "").charAt(0).toUpperCase() +
                                (field.value ?? "").slice(1)}
                            </span>
                            <ChevronsUpDown className="w-4 h-4" />
                          </div>
                        </div>
                      </button>
                      <FormMessage />
                      <FloatingSelect
                        isOpen={showEngineTypeSelect}
                        onClose={() => setShowEngineTypeSelect(false)}
                        options={enginetypeOptions}
                        value={field.value ?? undefined}
                        onChange={(value) => {
                          field.onChange(value);
                          setShowEngineTypeSelect(false);
                        }}
                        triggerRef={engineTypeRef}
                      />
                    </FormItem>
                  )}
                />
              )}

              {renderFormField(
                "passenger_seats",
                "Passenger Seats",
                "number",
                false
              )}

              {renderFormField("operator", "Operator", "text", false)}

              {/* STATUS SELECT */}
              {isLoading ? (
                <FormItem className="py-2">
                  <Skeleton className="h-24 w-full" />
                </FormItem>
              ) : (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="p-4">
                      {" "}
                      <button
                        type="button"
                        ref={statusRef}
                        onClick={() => setShowStatusSelect(!showStatusSelect)}
                        className="w-full cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="pr-5">
                            <div className="text-base">Status</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              {(field.value ?? "").charAt(0).toUpperCase() +
                                (field.value ?? "").slice(1)}
                            </span>
                            <ChevronsUpDown className="w-4 h-4" />
                          </div>
                        </div>
                      </button>
                      <FormMessage />
                      <FloatingSelect
                        isOpen={showStatusSelect}
                        onClose={() => setShowStatusSelect(false)}
                        options={statusOptions}
                        value={field.value ?? undefined}
                        onChange={(value) => {
                          field.onChange(value);
                          setShowStatusSelect(false);
                        }}
                        triggerRef={statusRef}
                      />
                    </FormItem>
                  )}
                />
              )}

              {isLoading ? (
                <FormItem className="py-2">
                  <Skeleton className="h-24 w-full" />
                </FormItem>
              ) : (
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem className="py-2">
                      <Textarea
                        placeholder="Note"
                        {...field}
                        className="text-sm font-medium border-none rounded-sm focus-visible:border-none focus-visible:ring-0 shadow-none placeholder:px-1"
                        rows={3}
                        value={field.value || ""}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            {!isEdit && !isLoading && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={resetForm}
              >
                Reset Form
              </Button>
            )}

            {isEdit && !isLoading && (
              <Button
                type="button"
                variant="destructive"
                className="w-full"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                Delete
              </Button>
            )}
          </form>
        </Form>
      </div>
      <TypeSelectDialog
        isOpen={isTypeSelectDialogOpen}
        onClose={() => setTypeSelectDialogOpen(false)}
        onSelect={(type) => {
          form.setValue("type", type.type);
          form.setValue("model", type.model);
          form.setValue("manufacturer", type.manufacturer);
          form.setValue("category", type.category);
          form.setValue("engine_count", type.engine_count);
          form.setValue("engine_type", type.engine_type);
          form.setValue("passenger_seats", type.passenger_seats);
          setTypeSelectDialogOpen(false);
        }}
        selectedType={form.getValues("type") || null}
      />
    </div>
  );
}
