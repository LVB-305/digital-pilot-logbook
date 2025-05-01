import {
  BookOpen,
  BarChartIcon as ChartSpline,
  Code,
  FileBadge,
  FileText,
  Map,
  Plane,
  PlaneTakeoffIcon,
  Settings,
  TowerControl,
  User,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navigation: NavSection[] = [
  {
    title: "Logbook",
    items: [
      {
        title: "Flights",
        href: "/app/flights",
        icon: PlaneTakeoffIcon,
      },
      {
        title: "Crew",
        href: "/crew",
        icon: Users,
      },
      {
        title: "Fleet",
        href: "/fleet",
        icon: Plane,
      },
      {
        title: "Airports",
        href: "/airports",
        icon: TowerControl,
      },
    ],
  },
  {
    title: "Tools",
    items: [
      {
        title: "Totals",
        href: "/totals",
        icon: ChartSpline,
      },
      {
        title: "Map",
        href: "/map",
        icon: Map,
      },
      {
        title: "Qualifications",
        href: "/qualifications",
        icon: FileBadge,
      },
    ],
  },
  {
    title: "TITLE",
    items: [
      {
        title: "Documentation",
        href: "/docs",
        icon: FileText,
      },
      {
        title: "Account",
        href: "/app/settings?tab=account",
        icon: User,
      },
      {
        title: "Settings",
        href: "/app/settings",
        icon: Settings,
      },
    ],
  },
];
