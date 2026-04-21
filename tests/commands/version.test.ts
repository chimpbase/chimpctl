import { describe, expect, test } from "bun:test";
import pkg from "../../package.json" with { type: "json" };

import { getVersion } from "../../src/util/version.ts";
import { run } from "../../src/commands/index.ts";

describe("chimpctl --version", () => {
  test("getVersion matches package.json", () => {
    expect(getVersion()).toBe(pkg.version);
  });

  test("`chimpctl --version` exits 0", async () => {
    expect(await run(["--version"])).toBe(0);
  });

  test("`chimpctl version` exits 0", async () => {
    expect(await run(["version"])).toBe(0);
  });

  test("`chimpctl --help` exits 0", async () => {
    expect(await run(["--help"])).toBe(0);
  });

  test("unknown command exits 1", async () => {
    expect(await run(["not-a-real-command"])).toBe(1);
  });
});
