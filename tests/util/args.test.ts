import { describe, expect, test } from "bun:test";

import { parseArgs, requireFlag } from "../../src/util/args.ts";

describe("parseArgs", () => {
  test("positional args only", () => {
    expect(parseArgs(["rm", "svc_123"])).toEqual({
      flags: {},
      positional: ["rm", "svc_123"],
    });
  });

  test("--flag value pairs", () => {
    expect(parseArgs(["--name", "web", "--image", "nginx:1.27"])).toEqual({
      flags: { name: "web", image: "nginx:1.27" },
      positional: [],
    });
  });

  test("--flag=value form", () => {
    expect(parseArgs(["--port=8080", "--name=web"])).toEqual({
      flags: { port: "8080", name: "web" },
      positional: [],
    });
  });

  test("mixed positional + flags", () => {
    expect(parseArgs(["create", "My App", "--slug", "my-app"])).toEqual({
      flags: { slug: "my-app" },
      positional: ["create", "My App"],
    });
  });

  test("trailing --flag with no next token gets 'true'", () => {
    expect(parseArgs(["--follow"])).toEqual({
      flags: { follow: "true" },
      positional: [],
    });
  });

  test("non-terminal bare --flag greedily consumes the next non-flag", () => {
    // The MVP parser has no schema, so `--a b` treats b as a's value.
    // All v0 flags we accept take values, so this is fine. Users who
    // want boolean-style should use `--flag=true` explicitly.
    expect(parseArgs(["--a", "b"])).toEqual({
      flags: { a: "b" },
      positional: [],
    });
  });
});

describe("requireFlag", () => {
  test("returns value when present", () => {
    expect(requireFlag({ name: "web" }, "name")).toBe("web");
  });

  test("throws when missing", () => {
    expect(() => requireFlag({}, "image")).toThrow("--image is required");
  });
});
