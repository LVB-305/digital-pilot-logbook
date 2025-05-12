import { redirect } from "next/navigation";

export default function SettingsRedirect({
  params,
}: {
  params: { slug: string[] };
}) {
  // Get the first segment of the slug (e.g., "profile" from "settings/profile")
  const section = params.slug[0];

  // Redirect to the new URL format with query parameter
  redirect(`/app/settings?tab=${section}`);
}
