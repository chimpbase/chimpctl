import { createApi } from "../api/client.ts";
import { ApiError } from "../api/errors.ts";
import { saveAuth } from "../auth/store.ts";
import { logger } from "../output/logger.ts";
import { parseArgs, requireFlag } from "../util/args.ts";

export async function login(args: string[]): Promise<number> {
  const { flags } = parseArgs(args);
  let apiUrl: string;
  let apiKey: string;
  try {
    apiUrl = requireFlag(flags, "api-url").replace(/\/+$/, "");
    apiKey = requireFlag(flags, "api-key");
  } catch (err) {
    logger.error((err as Error).message);
    logger.info("usage: chimpctl login --api-url <url> --api-key <cbk_...>");
    return 2;
  }

  const api = createApi({ apiUrl, apiKey });
  let accounts;
  try {
    accounts = await api.listAccounts();
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      logger.error("api rejected the provided key (401)");
      return 1;
    }
    logger.error(`could not reach ${apiUrl}: ${(err as Error).message}`);
    return 1;
  }

  if (accounts.length === 0) {
    logger.error("no account associated with this api key");
    return 1;
  }
  const account = accounts[0];
  await saveAuth({
    apiUrl,
    apiKey,
    userId: account.owner_user_id,
    accountId: account.id,
  });

  logger.ok(`logged in as account "${account.name}" (${account.id})`);
  logger.info(`  api url: ${apiUrl}`);
  logger.info(`  tier:    ${account.tier}`);
  return 0;
}
