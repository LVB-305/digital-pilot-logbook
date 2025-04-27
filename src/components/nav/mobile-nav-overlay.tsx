"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Plane, Plus } from "lucide-react";
import { navigation } from "@/lib/routes";

interface MobileNavOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavOverlay({ isOpen, onClose }: MobileNavOverlayProps) {
  const router = useRouter();

  // Prevent scrolling when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNavigation = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-sidebar flex flex-col">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-app-gradient-vertical text-white mr-3">
            <Plane className="size-4" />
          </div>
          <h1 className="text-xl font-medium">Digital Pilot Logbook</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="cursor-pointer"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {navigation.map((section) => (
          <div key={section.title} className="mb-6">
            <h2 className="text-sm font-semibold text-sidebar-foreground/70 mb-2">
              {section.title}
            </h2>
            <div className="space-y-1">
              {section.items.map((item) => (
                <button
                  key={item.title}
                  className="flex items-center w-full p-3 rounded-md hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleNavigation(item.href)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span className="font-medium">{item.title}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <Button
          className="w-full bg-light-blue text-white hover:bg-dark-blue cursor-pointer"
          onClick={() => handleNavigation("/flights/new")}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Flight
        </Button>
      </div>
    </div>
  );
}
