import { homedir } from "node:os";
import { join } from "node:path";

// Resolve the XDG config directory for chimpctl state (auth token, future
// project defaults). Honors XDG_CONFIG_HOME; falls back to ~/.config.
export function configDir(): string {
  const xdg = process.env.XDG_CONFIG_HOME;
  if (xdg && xdg.length > 0) return join(xdg, "chimpbase");
  return join(homedir(), ".config", "chimpbase");
}

export function authFilePath(): string {
  return join(configDir(), "auth.json");
}
