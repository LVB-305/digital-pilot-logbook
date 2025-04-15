"use client";

import Link from "next/link";
import { Plane } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-200",
        scrolled
          ? "bg-background/80 backdrop-blur-md shadow-sm"
          : "bg-background"
      )}
    >
      <div className="container flex h-20 items-center justify-between py-6">
        <div className="flex gap-2 items-center">
          <div className="relative h-10 w-10 overflow-hidden rounded-md bg-app-gradient-vertical">
            <Plane className="h-6 w-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white" />
          </div>
          <span className="font-bold text-xl">Pilot Logbook</span>
        </div>
        <div className="flex items-center">
          <div className="flex gap-4">
            <Link
              href="/login"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
