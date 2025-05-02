import { z } from "zod";

export const CrewScehma = z.object({
  id: z.string().uuid(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  company: z.string().nullable(),
  company_id: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  display_name: z.string(),
});

export type CrewItem = z.infer<typeof CrewScehma>;

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
  { key: "address", label: "Address" },
  { key: "company", label: "Company" },
  { key: "company_id", label: "Company ID" },
];
