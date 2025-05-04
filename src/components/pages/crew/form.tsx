import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { CrewFormSchema, CrewSubmitSchema } from "@/types/crew";

type CrewItem = z.infer<typeof CrewSubmitSchema>;
type CrewFormItem = z.infer<typeof CrewFormSchema>;

import { createCrew, updateCrew, deleteCrew } from "@/actions/pages/crew/crew";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

const STORAGE_KEY = "crew-form-draft";

const emptyValues = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  address: "",
  license_number: "",
  company: "",
  company_id: "",
  note: "",
};

export default function CrewForm({
  crew,
  isLoading,
}: {
  crew?: CrewItem;
  isLoading?: boolean;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!crew;

  const form = useForm<CrewFormItem>({
    resolver: zodResolver(CrewFormSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (crew && !isLoading) {
      form.reset({
        first_name: crew.first_name,
        last_name: crew.last_name,
        email: crew.email,
        phone: crew.phone,
        address: crew.address,
        license_number: crew.license_number,
        company: crew.company,
        company_id: crew.company_id,
        note: crew.note,
      });
    }
  }, [crew, isLoading, form]);

  useEffect(() => {
    if (!isEdit && !isLoading) {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        form.reset(JSON.parse(savedData));
      }
    }
  }, [isEdit, isLoading, form]);

  const onSubmit = async (data: CrewFormItem) => {
    try {
      setIsSubmitting(true);
      if (isEdit && crew) {
        await updateCrew({
          ...crew, // Keep existing system fields
          ...data, // Update with new form data
          updated_at: new Date().toISOString(),
        });
        console.log("Crew member updated successfully");
      } else {
        await createCrew(data);
        console.log("Crew member created successfully");
      }
      localStorage.removeItem(STORAGE_KEY);
      router.push("/app/crew");
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
    if (!crew?.id) return;

    if (!confirm("Are you sure you want to delete this crew member?")) {
      return;
    }

    try {
      setIsSubmitting(true);
      await deleteCrew(crew.id);
      router.push("/app/crew");
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : "Failed to delete crew member"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormField = (
    name: keyof CrewFormItem,
    label: string,
    type: string = "text"
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
              value={field.value || ""}
              required={name === "first_name" || name === "last_name"}
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
        title={isEdit ? "Edit Crew Member" : "New Crew Member"}
        backHref="/app/crew"
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
              {renderFormField("first_name", "First Name *")}
              {renderFormField("last_name", "Last Name *")}
              {renderFormField("email", "Email", "email")}
              {renderFormField("phone", "Phone", "tel")}
              {renderFormField("license_number", "License Number")}
              {renderFormField("company", "Company")}
              {renderFormField("company_id", "Company ID")}
              {renderFormField("address", "Address")}
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
    </div>
  );
}
