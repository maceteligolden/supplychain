"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BoxesIcon,
  Building2Icon,
  LayoutDashboardIcon,
  PackageIcon,
  RouteIcon,
  SproutIcon,
} from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  ACTIVE_NAV_ROUTES,
  PAGE_ROUTES,
  type PageRouteKey,
} from "@/config/page-routes";

const NAV_ITEMS: Record<
  PageRouteKey,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  login: { label: "Login", icon: LayoutDashboardIcon },
  dashboard: { label: "Dashboard", icon: LayoutDashboardIcon },
  commodities: { label: "Commodities", icon: PackageIcon },
  farms: { label: "Farms", icon: SproutIcon },
  actors: { label: "Actors", icon: Building2Icon },
  batches: { label: "Batches", icon: BoxesIcon },
  supplyChains: { label: "Supply Chains", icon: RouteIcon },
  events: { label: "Events", icon: LayoutDashboardIcon },
  traceability: { label: "Traceability", icon: LayoutDashboardIcon },
  reports: { label: "Reports", icon: LayoutDashboardIcon },
};

/**
 * SidebarNav
 *
 * Renders navigation links from PAGE_ROUTES for the current POC phase.
 * Only routes listed in ACTIVE_NAV_ROUTES are shown; others are added in
 * future phases without changing this component's structure.
 */
export function SidebarNav(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {ACTIVE_NAV_ROUTES.map((key) => {
            const route = PAGE_ROUTES[key];
            const item = NAV_ITEMS[key];
            const Icon = item.icon;
            const isActive = pathname === route;

            return (
              <SidebarMenuItem key={key}>
                <SidebarMenuButton render={<Link href={route} />} isActive={isActive}>
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
