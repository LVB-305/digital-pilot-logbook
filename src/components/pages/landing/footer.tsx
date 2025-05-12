import Link from "next/link";

import { Plane } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex items-center gap-2">
          <div className="relative h-8 w-8 overflow-hidden rounded-md bg-app-gradient-vertical">
            <Plane className="h-5 w-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white" />
          </div>
          <span className="text-sm font-medium">Pilot Logbook</span>
        </div>
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <nav className="flex gap-4 sm:gap-6">
            <Link
              href="/terms"
              className="text-sm font-medium text-muted-foreground hover:underline underline-offset-4"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="text-sm font-medium text-muted-foreground hover:underline underline-offset-4"
            >
              Privacy Policy
            </Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
