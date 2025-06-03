"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNavOverlay } from "@/components/nav/mobile-nav-overlay";

interface PageHeaderProps {
  title: string;
  backHref?: string;
  showBackButton?: boolean;
  isTopLevelPage?: boolean;
  actionButton?: React.ReactNode;
}

export function PageHeader({
  title,
  backHref = "/app/flighs",
  showBackButton = true,
  isTopLevelPage = false,
  actionButton,
}: PageHeaderProps) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [navOverlayOpen, setNavOverlayOpen] = useState(false);

  // Detect mobile devices
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint in Tailwind
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Clean up
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  return (
    <>
      <header className="flex items-center justify-between py-2 px-3 border-b">
        {/* Leading */}
        {isMobile && isTopLevelPage ? (
          <Button
            variant="ghost"
            size="icon"
            className="text-primary font-medium hover:bg-primary-foreground w-8 h-8"
            onClick={() => setNavOverlayOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        ) : !isTopLevelPage && showBackButton ? (
          <Button
            variant="ghost"
            size="icon"
            className="text-primary font-medium hover:bg-primary-foreground w-8 h-8"
            asChild
          >
            <Link href={backHref}>
              <ChevronLeft className="h-6 w-6" />
            </Link>
          </Button>
        ) : (
          <div className="w-8" /> /* Spacer when no action button */
        )}

        {/* Title */}
        <h1 className="text-lg font-medium">{title}</h1>

        {/* Trailing */}
        {actionButton ? (
          actionButton
        ) : (
          <div className="w-8" /> /* Spacer when no action button */
        )}
      </header>

      <MobileNavOverlay
        isOpen={navOverlayOpen}
        onClose={() => setNavOverlayOpen(false)}
      />
    </>
  );
}
