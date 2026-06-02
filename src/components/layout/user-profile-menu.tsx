"use client";

import { LogOutIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/hooks/use-logout";
import type { UserInterface } from "@/types/user.interface";

export interface UserProfileMenuProps {
  /** Currently authenticated user displayed in the header. */
  user: UserInterface;
}

/**
 * UserProfileMenu
 *
 * Header dropdown showing the Super Admin name and a logout action.
 * Calls the auth service to clear the session cookie on logout.
 */
export function UserProfileMenu({ user }: UserProfileMenuProps): React.JSX.Element {
  const { isLoggingOut, error, performLogout } = useLogout();
  const initials =
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="gap-2 px-2" disabled={isLoggingOut}>
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline">{fullName}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span>{fullName}</span>
              <span className="text-muted-foreground text-xs font-normal">
                {user.email}
              </span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={performLogout} disabled={isLoggingOut}>
            <LogOutIcon className="size-4" />
            {isLoggingOut ? "Signing out…" : "Sign out"}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {error ? (
          <p className="text-destructive px-2 py-1 text-xs" role="alert">
            {error}
          </p>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
