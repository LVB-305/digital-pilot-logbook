"use client";

import Link from "next/link";
import { Plane, User } from "lucide-react";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { logout } from "@/actions/auth/logout";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client/client";

interface UserMetadata {
  avatar_url?: string;
  display_name?: string;
}

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    // Client-side signout
    await supabase.auth.signOut();
    // Server-side cleanup
    await logout();
    // Force immediate user state update
    setUser(null);
    // Navigate and refresh
    router.push("/");
    router.refresh();
  };

  const displayName =
    user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";
  const avatarUrl = user?.user_metadata?.avatar_url;

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
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative flex items-center gap-2 h-auto p-1 cursor-pointer"
                >
                  <span className="text-sm">Hello, {displayName}</span>
                  <Avatar className="h-8 w-8">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={displayName} />
                    ) : (
                      <AvatarFallback>
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="text-sm font-medium">
                  {user.email}
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/app/flights">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-4">
              <Button variant="link">
                <Link
                  href="/login"
                  className="text-sm font-medium hover:underline underline-offset-4"
                >
                  Login
                </Link>
              </Button>

              <Button className="hidden md:inline-flex">
                <Link
                  href="/register"
                  className="text-sm font-medium hover:underline underline-offset-4"
                >
                  Register
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
