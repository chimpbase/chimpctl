import { createApi } from "../api/client.ts";
import { loadAuth } from "../auth/store.ts";
import { logger } from "../output/logger.ts";

export async function whoami(): Promise<number> {
  const auth = await loadAuth();
  if (!auth) {
    logger.error("not authenticated. run `chimpctl login`.");
    return 1;
  }
  const api = createApi(auth);
  try {
    const account = await api.getAccount(auth.accountId);
    logger.info(`account:  ${account.name} (${account.id})`);
    logger.info(`tier:     ${account.tier}`);
    logger.info(`user id:  ${auth.userId}`);
    logger.info(`api url:  ${auth.apiUrl}`);
    return 0;
  } catch (err) {
    logger.error((err as Error).message);
    return 1;
  }
}
