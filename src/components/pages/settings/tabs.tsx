"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

export interface SettingsTab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface SettingsTabsProps {
  tabs: SettingsTab[];
  defaultTabId?: string;
}

export function SettingsTabs({ tabs, defaultTabId }: SettingsTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  // Find if the tab from URL exists in our tabs array
  const tabExists = tabs.some((tab) => tab.id === tabParam);

  // Use the URL parameter if it exists and is valid, otherwise use the default
  const [activeTab, setActiveTab] = useState<string>(
    tabExists ? tabParam! : defaultTabId || tabs[0]?.id || ""
  );

  // Update the URL when tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);

    // Create a new URLSearchParams object based on the current params
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);

    // Update the URL without refreshing the page
    router.push(`/app/settings?${params.toString()}`, { scroll: false });
  };

  // Sync with URL changes (e.g., when user uses browser back/forward)
  useEffect(() => {
    if (tabParam && tabExists) {
      setActiveTab(tabParam);
    }
  }, [tabParam, tabExists]);

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className="w-full space-y-6">
      <nav className="flex border-b overflow-x-auto scrollbar-hide">
        <div className="flex min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors hover:text-primary whitespace-nowrap cursor-pointer",
                activeTab === tab.id
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>
      <div className="mt-6">{activeTabContent}</div>
    </div>
  );
}
