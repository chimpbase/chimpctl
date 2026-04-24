import { deploy } from "./deploy.ts";
import { printHelp } from "./help.ts";
import { login } from "./login.ts";
import { logout } from "./logout.ts";
import { projects } from "./projects.ts";
import { services } from "./services.ts";
import { printVersion } from "./version.ts";
import { whoami } from "./whoami.ts";

type CommandFn = (args: string[]) => Promise<number> | number;

const commands: Record<string, CommandFn> = {
  help: () => {
    printHelp();
    return 0;
  },
  version: () => {
    printVersion();
    return 0;
  },
  login,
  logout: () => logout(),
  whoami: () => whoami(),
  projects,
  deploy,
  services,
};

export async function run(argv: string[]): Promise<number> {
  const [first, ...rest] = argv;

  if (!first || first === "help" || first === "--help" || first === "-h") {
    printHelp();
    return 0;
  }
  if (first === "version" || first === "--version" || first === "-v") {
    printVersion();
    return 0;
  }

  const cmd = commands[first];
  if (!cmd) {
    console.error(`unknown command: ${first}`);
    printHelp();
    return 1;
  }
  return await cmd(rest);
}

export { commands };
