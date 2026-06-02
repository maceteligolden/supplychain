"use client";

import type { ReactNode } from "react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { UserProfileMenu } from "@/components/layout/user-profile-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import type { UserInterface } from "@/types/user.interface";

export interface AppShellProps {
  /** Authenticated user shown in the header profile menu. */
  user: UserInterface;
  /** Page content rendered in the main area. */
  children: ReactNode;
}

/**
 * AppShell
 *
 * Authenticated layout with collapsible sidebar navigation and header
 * profile menu. Sidebar links are driven by PAGE_ROUTES and ACTIVE_NAV_ROUTES.
 */
export function AppShell({ user, children }: AppShellProps): React.JSX.Element {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Traceability</span>
            <span className="text-muted-foreground text-xs">Platform POC</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-4">
          <p className="text-muted-foreground text-xs">Super Admin</p>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="border-border flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <div className="ml-auto">
            <UserProfileMenu user={user} />
          </div>
        </header>
        <main className="p-page flex flex-1 flex-col">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
