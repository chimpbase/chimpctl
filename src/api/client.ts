import { ApiError } from "./errors.ts";
import type {
  Account,
  Project,
  Service,
} from "./types.ts";

export interface ApiClientConfig {
  apiUrl: string;
  apiKey: string;
}

async function request<T>(
  cfg: ApiClientConfig,
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${cfg.apiUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  let parsed: unknown = null;
  const text = await res.text();
  if (text.length > 0) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!res.ok) {
    const message =
      parsed && typeof parsed === "object" && "error" in parsed
        ? String((parsed as { error: unknown }).error)
        : typeof parsed === "string"
          ? parsed
          : `api ${method} ${path} returned ${res.status}`;
    throw new ApiError(res.status, message, parsed);
  }

  return parsed as T;
}

export function createApi(cfg: ApiClientConfig) {
  return {
    listAccounts: () => request<Account[]>(cfg, "GET", "/accounts"),
    getAccount: (id: string) => request<Account>(cfg, "GET", `/accounts/${id}`),

    listProjects: () => request<Project[]>(cfg, "GET", "/projects"),
    createProject: (name: string, slug?: string) =>
      request<Project>(cfg, "POST", "/projects", { name, slug }),
    getProject: (id: string) => request<Project>(cfg, "GET", `/projects/${id}`),

    listServices: (projectId?: string) =>
      projectId
        ? request<Service[]>(cfg, "GET", `/projects/${projectId}/services`)
        : request<Service[]>(cfg, "GET", "/services"),
    createService: (
      projectId: string,
      body: { name: string; image: string; replicas?: number; targetPort?: number },
    ) =>
      request<Service>(cfg, "POST", `/projects/${projectId}/services`, body),
    removeService: (id: string) =>
      request<void>(cfg, "DELETE", `/services/${id}`),
  };
}

export type Api = ReturnType<typeof createApi>;
