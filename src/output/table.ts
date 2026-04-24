// Minimal table printer: aligns columns, left-justified, single-space gutter.

export function printTable(headers: string[], rows: string[][]): void {
  if (rows.length === 0) {
    console.log("(none)");
    return;
  }
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] ?? "").length)),
  );
  const fmt = (cells: string[]) =>
    cells.map((c, i) => (c ?? "").padEnd(widths[i])).join("  ").trimEnd();
  console.log(fmt(headers));
  console.log(fmt(headers.map((_, i) => "-".repeat(widths[i]))));
  for (const row of rows) console.log(fmt(row));
}
