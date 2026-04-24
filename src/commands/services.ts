import { createApi, type Api } from "../api/client.ts";
import { loadAuth } from "../auth/store.ts";
import { logger } from "../output/logger.ts";
import { printTable } from "../output/table.ts";
import { parseArgs } from "../util/args.ts";

async function apiOrFail(): Promise<Api | null> {
  const auth = await loadAuth();
  if (!auth) {
    logger.error("not authenticated. run `chimpctl login`.");
    return null;
  }
  return createApi(auth);
}

export async function services(args: string[]): Promise<number> {
  const [sub, ...rest] = args;
  if (!sub || sub === "list") return listServices(rest);
  if (sub === "rm" || sub === "remove" || sub === "delete")
    return removeService(rest);
  logger.error(`unknown subcommand: services ${sub}`);
  logger.info("usage: chimpctl services [list [--project X] | rm <id>]");
  return 2;
}

async function listServices(rest: string[]): Promise<number> {
  const { flags } = parseArgs(rest);
  const api = await apiOrFail();
  if (!api) return 1;
  try {
    let projectId: string | undefined;
    if (flags.project) {
      if (flags.project.startsWith("prj_")) {
        projectId = flags.project;
      } else {
        const projects = await api.listProjects();
        projectId = projects.find(
          (p) => p.slug === flags.project || p.name === flags.project,
        )?.id;
        if (!projectId) {
          logger.error(`project "${flags.project}" not found`);
          return 1;
        }
      }
    }
    const rows = await api.listServices(projectId);
    printTable(
      ["id", "name", "image", "replicas", "status", "url"],
      rows.map((s) => [
        s.id,
        s.name,
        s.image,
        String(s.replicas),
        s.status,
        s.published_port ? `http://localhost:${s.published_port}` : "-",
      ]),
    );
    return 0;
  } catch (err) {
    logger.error((err as Error).message);
    return 1;
  }
}

async function removeService(rest: string[]): Promise<number> {
  const id = rest.find((t) => !t.startsWith("--"));
  if (!id) {
    logger.error("service id is required");
    logger.info("usage: chimpctl services rm <id>");
    return 2;
  }
  const api = await apiOrFail();
  if (!api) return 1;
  try {
    await api.removeService(id);
    logger.ok(`service ${id} removed`);
    return 0;
  } catch (err) {
    logger.error((err as Error).message);
    return 1;
  }
}
