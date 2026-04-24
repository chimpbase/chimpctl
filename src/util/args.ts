// Minimal `--flag value` / `--flag=value` parser. Positional args come back
// in `positional`; known flags in `flags`. Unknown --flags also land in
// `flags` so commands can decide whether to reject them.

export interface ParsedArgs {
  flags: Record<string, string>;
  positional: string[];
}

export function parseArgs(argv: string[]): ParsedArgs {
  const flags: Record<string, string> = {};
  const positional: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const tok = argv[i];
    if (tok.startsWith("--")) {
      const eq = tok.indexOf("=");
      if (eq >= 0) {
        flags[tok.slice(2, eq)] = tok.slice(eq + 1);
      } else {
        const name = tok.slice(2);
        const next = argv[i + 1];
        if (next && !next.startsWith("--")) {
          flags[name] = next;
          i++;
        } else {
          flags[name] = "true";
        }
      }
    } else {
      positional.push(tok);
    }
  }

  return { flags, positional };
}

export function requireFlag(
  flags: Record<string, string>,
  name: string,
): string {
  const v = flags[name];
  if (!v) throw new Error(`--${name} is required`);
  return v;
}
