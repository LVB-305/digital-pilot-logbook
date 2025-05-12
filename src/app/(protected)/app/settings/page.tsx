"use client";

import { GeneralForm } from "@/components/pages/settings/general-form";
import { AccountForm } from "@/components/pages/settings/account-form";
// import { SecurityForm } from "@/components/settings/security-form";
// import { NotificationsForm } from "@/components/settings/notifications-form";
// import { AppearanceForm } from "@/components/settings/appearance-form";
// import { ProfileForm } from "@/components/settings/profile-form";
import {
  SettingsTabs,
  type SettingsTab,
} from "@/components/pages/settings/tabs";
import { useSearchParams } from "next/navigation";
// import { UserNav } from "@/components/settings/user-nav";

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const tabs: SettingsTab[] = [
    {
      id: "general",
      label: "General",
      content: <GeneralForm />,
    },
    {
      id: "account",
      label: "Account",
      content: <AccountForm />,
    },
    // {
    //   id: "notifications",
    //   label: "Notifications",
    //   content: <NotificationsForm />,
    // },
    // {
    //   id: "appearance",
    //   label: "Appearance",
    //   content: <AppearanceForm />,
    // },
    // {
    //   id: "preferences",
    //   label: "Preferences",
    //   content: <PreferencesForm />,
    // },
    {
      id: "appearance",
      label: "Appearance",
      content: (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Appearance</h3>
          <p className="text-sm">
            Appearance features coming soon. Light/Dark/System UI; Default list
            or table view for flights
          </p>
        </div>
      ),
    },
  ];

  // Find if the tab from URL exists in our tabs array
  const tabExists = tabs.some((tab) => tab.id === tabParam);

  // Use the URL parameter if it exists and is valid, otherwise use the default
  const defaultTabId = tabExists ? tabParam! : "general";

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">John Doe</h1>
            <p className="text-muted-foreground">
              Manage your details and personal preferences here.
            </p>
          </div>
          {/* <div className="flex items-center space-x-2">
            <UserNav />
          </div> */}
        </div>
        <SettingsTabs tabs={tabs} defaultTabId={defaultTabId} />
      </div>
    </div>
  );
}
