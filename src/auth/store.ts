import { chmod, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { authFilePath, configDir } from "../util/paths.ts";
import type { StoredAuth } from "./types.ts";

// Read the stored auth, preferring env vars so CI / demo scripts don't need
// to touch the filesystem. Returns null if neither source is populated.
export async function loadAuth(): Promise<StoredAuth | null> {
  const envUrl = process.env.CHIMPBASE_API_URL;
  const envKey = process.env.CHIMPBASE_API_KEY;
  if (envUrl && envKey) {
    return {
      apiUrl: envUrl,
      apiKey: envKey,
      userId: process.env.CHIMPBASE_USER_ID ?? "",
      accountId: process.env.CHIMPBASE_ACCOUNT_ID ?? "",
    };
  }
  try {
    const raw = await readFile(authFilePath(), "utf8");
    const parsed = JSON.parse(raw) as StoredAuth;
    if (!parsed.apiUrl || !parsed.apiKey) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function saveAuth(auth: StoredAuth): Promise<void> {
  const path = authFilePath();
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(auth, null, 2) + "\n", { mode: 0o600 });
  // On platforms that ignore `mode` on existing files, force the permission.
  await chmod(path, 0o600);
}

export async function clearAuth(): Promise<void> {
  await rm(authFilePath(), { force: true });
}

export function authDir(): string {
  return configDir();
}
