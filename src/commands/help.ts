export function printHelp(): void {
  const lines = [
    "chimpctl — Customer CLI for Chimpbase Cloud",
    "",
    "Usage:",
    "  chimpctl <command> [options]",
    "",
    "Commands:",
    "  help       Show this help",
    "  version    Show chimpctl version",
    "",
    "More commands (login, deploy, logs, env, secrets, domains, scale,",
    "rollback, status, projects) will land as chimpbase/cloud's API stabilizes.",
    "",
    "Docs: https://chimpbase.app/docs/cli",
  ];
  console.log(lines.join("\n"));
}
