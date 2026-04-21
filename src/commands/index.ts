import { printHelp } from "./help.ts";
import { printVersion } from "./version.ts";

type Command = {
  name: string;
  description: string;
  run: (args: string[]) => Promise<number> | number;
};

const commands: Command[] = [
  {
    name: "help",
    description: "Show help",
    run: () => {
      printHelp();
      return 0;
    },
  },
  {
    name: "version",
    description: "Show chimpctl version",
    run: () => {
      printVersion();
      return 0;
    },
  },
];

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

  const cmd = commands.find((c) => c.name === first);
  if (!cmd) {
    console.error(`unknown command: ${first}`);
    printHelp();
    return 1;
  }
  return cmd.run(rest);
}

export { commands };
