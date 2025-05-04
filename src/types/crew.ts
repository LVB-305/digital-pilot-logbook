import { z } from "zod";

const CrewBaseSchema = z.object({
  first_name: z.string().min(1, "First Name is required."),
  last_name: z.string().min(1, "Last Name is required."),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  license_number: z.string().nullable(),
  company: z.string().nullable(),
  company_id: z.string().nullable(),
  note: z.string().nullable(),
});

export const CrewFormSchema = CrewBaseSchema;

export const CrewSubmitSchema = CrewBaseSchema.extend({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CrewSchema = CrewSubmitSchema.extend({
  display_name: z.string(),
});

export type CrewItem = z.infer<typeof CrewSchema>;

interface Column {
  key: keyof CrewItem;
  label: string;
  sortable?: boolean;
  sortType?: "string" | "number" | "date";
  width?: string;
  formatFn?: (item: CrewItem) => string;
}

export const columns: Column[] = [
  {
    key: "display_name",
    label: "Name",
    sortable: true,
    sortType: "string",
  },
  {
    key: "email",
    label: "Email",
    formatFn: (item: CrewItem) =>
      item.email
        ? `<a href="mailto:${item.email}" class="text-blue-600 hover:underline">${item.email}</a>`
        : "",
  },
  {
    key: "phone",
    label: "Phone",
    formatFn: (item: CrewItem) =>
      item.phone
        ? `<a href="tel:${item.phone}" class="text-blue-600 hover:underline">${item.phone}</a>`
        : "",
  },
  { key: "company", label: "Company" },
  { key: "company_id", label: "Company ID" },
  { key: "license_number", label: "License" },
];
