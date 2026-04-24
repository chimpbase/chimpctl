export interface Account {
  id: string;
  owner_user_id: string;
  name: string;
  tier: "free" | "pro" | "enterprise";
  created_at: string;
}

export interface Project {
  id: string;
  account_id: string;
  name: string;
  slug: string;
  subdomain: string;
  created_at: string;
}

export interface Service {
  id: string;
  project_id: string;
  name: string;
  image: string;
  replicas: number;
  target_port: number | null;
  published_port: number | null;
  subdomain: string;
  status: "provisioning" | "deploying" | "running" | "failed" | "removed";
  created_at: string;
}

export interface BootstrappedApiKey {
  id: string;
  name: string;
  tokenPrefix: string;
  token: string;
  createdAt: string;
}
