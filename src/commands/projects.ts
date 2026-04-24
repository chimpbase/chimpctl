import { createApi } from "../api/client.ts";
import { loadAuth } from "../auth/store.ts";
import { logger } from "../output/logger.ts";
import { printTable } from "../output/table.ts";

async function clientOrFail() {
  const auth = await loadAuth();
  if (!auth) {
    logger.error("not authenticated. run `chimpctl login`.");
    return null;
  }
  return createApi(auth);
}

export async function projects(args: string[]): Promise<number> {
  const [sub, ...rest] = args;
  if (!sub || sub === "list") return listProjects();
  if (sub === "create") return createProject(rest);
  logger.error(`unknown subcommand: projects ${sub}`);
  logger.info("usage: chimpctl projects [list | create <name>]");
  return 2;
}

async function listProjects(): Promise<number> {
  const api = await clientOrFail();
  if (!api) return 1;
  try {
    const rows = await api.listProjects();
    printTable(
      ["id", "name", "slug", "subdomain", "created"],
      rows.map((p) => [p.id, p.name, p.slug, p.subdomain, p.created_at]),
    );
    return 0;
  } catch (err) {
    logger.error((err as Error).message);
    return 1;
  }
}

async function createProject(rest: string[]): Promise<number> {
  const name = rest.find((t) => !t.startsWith("--"));
  if (!name) {
    logger.error("name is required");
    logger.info("usage: chimpctl projects create <name>");
    return 2;
  }
  const api = await clientOrFail();
  if (!api) return 1;
  try {
    const p = await api.createProject(name);
    logger.ok(`project "${p.name}" created`);
    logger.info(`  id:        ${p.id}`);
    logger.info(`  slug:      ${p.slug}`);
    logger.info(`  subdomain: ${p.subdomain}`);
    return 0;
  } catch (err) {
    logger.error((err as Error).message);
    return 1;
  }
}
