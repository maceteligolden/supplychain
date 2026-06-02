import { env } from "@/config/env";

/** Returns session cookie header for server-side service calls. */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  if (typeof window !== "undefined") {
    return {};
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const session = cookieStore.get(env.sessionCookieName);

  if (!session) {
    return {};
  }

  return { Cookie: `${env.sessionCookieName}=${session.value}` };
}
