import { getVersion } from "../util/version.ts";

export function printVersion(): void {
  console.log(`chimpctl ${getVersion()}`);
}
