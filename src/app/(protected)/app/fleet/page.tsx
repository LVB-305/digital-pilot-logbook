"use client";

import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Fleet from "@/components/pages/fleet/fleet";

export default function FleetPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Fleet"
        backHref="/"
        showBackButton={false}
        isTopLevelPage={true}
        actionButton={
          <Button
            variant="ghost"
            className="text-primary font-medium hover:bg-primary-foreground w-10 h-10"
            asChild
          >
            <Link href="/app/fleet/new">
              <Plus className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="flex-1">
        <Fleet />
      </div>
    </div>
  );
}
