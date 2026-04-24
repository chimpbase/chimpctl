import { createApi, type Api } from "../api/client.ts";
import { loadAuth } from "../auth/store.ts";
import { logger } from "../output/logger.ts";
import { parseArgs, requireFlag } from "../util/args.ts";

async function resolveProjectId(api: Api, ref: string): Promise<string | null> {
  if (ref.startsWith("prj_")) return ref;
  const projects = await api.listProjects();
  return projects.find((p) => p.slug === ref || p.name === ref)?.id ?? null;
}

export async function deploy(args: string[]): Promise<number> {
  const { flags } = parseArgs(args);
  const auth = await loadAuth();
  if (!auth) {
    logger.error("not authenticated. run `chimpctl login`.");
    return 1;
  }
  const api = createApi(auth);

  let image: string;
  let name: string;
  try {
    image = requireFlag(flags, "image");
    name = requireFlag(flags, "name");
  } catch (err) {
    logger.error((err as Error).message);
    logger.info(
      "usage: chimpctl deploy --image <img> --name <svc> [--project <slug|id>] [--port <N>] [--replicas N]",
    );
    return 2;
  }

  const replicas = flags.replicas ? Number(flags.replicas) : 1;
  const port = flags.port ? Number(flags.port) : undefined;
  if (Number.isNaN(replicas) || replicas < 1) {
    logger.error("--replicas must be a positive integer");
    return 2;
  }
  if (port !== undefined && (Number.isNaN(port) || port < 1 || port > 65535)) {
    logger.error("--port must be 1..65535");
    return 2;
  }

  let projectRef = flags.project;
  if (!projectRef) {
    const projects = await api.listProjects();
    if (projects.length === 0) {
      logger.error("no projects found. run `chimpctl projects create <name>` first.");
      return 1;
    }
    if (projects.length > 1) {
      logger.error("multiple projects exist — pass --project <slug|id>");
      return 2;
    }
    projectRef = projects[0].slug;
  }
  const projectId = await resolveProjectId(api, projectRef);
  if (!projectId) {
    logger.error(`project "${projectRef}" not found`);
    return 1;
  }

  try {
    const svc = await api.createService(projectId, {
      name,
      image,
      replicas,
      targetPort: port,
    });
    const project = await api.getProject(projectId);
    logger.ok(`service "${svc.name}" deployed in project "${project.slug}"`);
    logger.info(`  image:     ${svc.image}`);
    logger.info(`  replicas:  ${svc.replicas}`);
    logger.info(`  subdomain: ${svc.subdomain}`);
    if (svc.published_port) {
      logger.info(`  reach it:  http://localhost:${svc.published_port}`);
      logger.info(
        logger.dim(
          "    (local swarm — real subdomain routing lands with edge-workers)",
        ),
      );
    } else {
      logger.info(
        logger.dim("  (no --port set — service is internal-only for now)"),
      );
    }
    return 0;
  } catch (err) {
    logger.error((err as Error).message);
    return 1;
  }
}
