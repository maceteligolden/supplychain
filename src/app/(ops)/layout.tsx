import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { PAGE_ROUTES } from "@/config/page-routes";
import { isAppError } from "@/lib/errors";
import { getCurrentUser } from "@/services/auth.service";
import type { UserInterface } from "@/types/user.interface";

async function resolveAuthenticatedUser(): Promise<UserInterface> {
  try {
    return await getCurrentUser();
  } catch (error) {
    if (isAppError(error) && error.statusCode === 401) {
      redirect(PAGE_ROUTES.login);
    }
    throw error;
  }
}

export default async function OpsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.JSX.Element> {
  const user = await resolveAuthenticatedUser();
  return <AppShell user={user}>{children}</AppShell>;
}
