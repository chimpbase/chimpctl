const supportsColor = process.stdout.isTTY && process.env.NO_COLOR !== "1";

function paint(code: string, s: string): string {
  return supportsColor ? `\x1b[${code}m${s}\x1b[0m` : s;
}

export const logger = {
  info: (msg: string) => console.log(msg),
  ok: (msg: string) => console.log(paint("32", "✓ ") + msg),
  warn: (msg: string) => console.warn(paint("33", "! ") + msg),
  error: (msg: string) => console.error(paint("31", "✗ ") + msg),
  dim: (msg: string) => paint("2", msg),
};
