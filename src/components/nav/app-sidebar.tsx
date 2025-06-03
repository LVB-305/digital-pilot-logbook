import { Plane } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { navigation } from "@/lib/routes";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav/nav-user";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client/client";
import { logout } from "@/actions/auth/logout";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

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

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const email = user?.email || "";
  const avatarUrl = user?.user_metadata?.avatar_url;

  const data = {
    user: {
      name: displayName,
      email: email,
      avatar: avatarUrl,
    },
  };

  const handleLogout = async () => {
    try {
      // Server-side signout and get redirect info
      const data = await logout();
      setUser(null);
      // Use the redirect URL from server action
      if (data?.redirectTo) {
        window.location.href = data.redirectTo;
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-app-gradient-vertical text-icon-accent">
                  <Plane className="size-4" />{" "}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    Digital Pilot Logbook
                  </span>
                  <span className="truncate text-xs">Online</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {navigation.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      className="cursor-pointer font-medium"
                      size={"lg"}
                    >
                      <a href={item.href}>
                        <item.icon className="h-4 w-4 mr-2" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
