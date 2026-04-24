import { clearAuth } from "../auth/store.ts";
import { logger } from "../output/logger.ts";

export async function logout(): Promise<number> {
  await clearAuth();
  logger.ok("logged out (auth.json removed)");
  return 0;
}
