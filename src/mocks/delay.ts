import { env } from "@/config/env";

/** Simulates network latency for mock API responses. */
export async function mockDelay(): Promise<void> {
  if (env.mockDelayMs <= 0) {
    return;
  }
  await new Promise<void>((resolve) => {
    setTimeout(resolve, env.mockDelayMs);
  });
}
