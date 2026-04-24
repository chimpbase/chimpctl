import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { clearAuth, loadAuth, saveAuth } from "../../src/auth/store.ts";

describe("auth store", () => {
  let scratch: string;
  let originalXdg: string | undefined;
  let originalEnvUrl: string | undefined;
  let originalEnvKey: string | undefined;

  beforeEach(async () => {
    scratch = await mkdtemp(join(tmpdir(), "chimpctl-test-"));
    originalXdg = process.env.XDG_CONFIG_HOME;
    originalEnvUrl = process.env.CHIMPBASE_API_URL;
    originalEnvKey = process.env.CHIMPBASE_API_KEY;
    process.env.XDG_CONFIG_HOME = scratch;
    delete process.env.CHIMPBASE_API_URL;
    delete process.env.CHIMPBASE_API_KEY;
  });

  afterEach(async () => {
    if (originalXdg === undefined) delete process.env.XDG_CONFIG_HOME;
    else process.env.XDG_CONFIG_HOME = originalXdg;
    if (originalEnvUrl === undefined) delete process.env.CHIMPBASE_API_URL;
    else process.env.CHIMPBASE_API_URL = originalEnvUrl;
    if (originalEnvKey === undefined) delete process.env.CHIMPBASE_API_KEY;
    else process.env.CHIMPBASE_API_KEY = originalEnvKey;
    await rm(scratch, { recursive: true, force: true });
  });

  test("loadAuth returns null when nothing is stored", async () => {
    expect(await loadAuth()).toBeNull();
  });

  test("save + load round-trip", async () => {
    await saveAuth({
      apiUrl: "http://localhost:3100",
      apiKey: "cbk_test_token",
      userId: "usr_1",
      accountId: "acc_1",
    });
    const loaded = await loadAuth();
    expect(loaded).toEqual({
      apiUrl: "http://localhost:3100",
      apiKey: "cbk_test_token",
      userId: "usr_1",
      accountId: "acc_1",
    });
  });

  test("saved file is mode 0600", async () => {
    await saveAuth({
      apiUrl: "u",
      apiKey: "k",
      userId: "u1",
      accountId: "a1",
    });
    const filePath = join(scratch, "chimpbase", "auth.json");
    const info = await stat(filePath);
    // mask off file-type bits, compare permission bits
    expect(info.mode & 0o777).toBe(0o600);
  });

  test("clearAuth removes the file", async () => {
    await saveAuth({ apiUrl: "u", apiKey: "k", userId: "u", accountId: "a" });
    await clearAuth();
    expect(await loadAuth()).toBeNull();
    const filePath = join(scratch, "chimpbase", "auth.json");
    await expect(readFile(filePath, "utf8")).rejects.toThrow();
  });

  test("env vars take precedence over disk", async () => {
    await saveAuth({
      apiUrl: "disk",
      apiKey: "disk",
      userId: "u",
      accountId: "a",
    });
    process.env.CHIMPBASE_API_URL = "http://env";
    process.env.CHIMPBASE_API_KEY = "cbk_env";
    const loaded = await loadAuth();
    expect(loaded?.apiUrl).toBe("http://env");
    expect(loaded?.apiKey).toBe("cbk_env");
  });
});
