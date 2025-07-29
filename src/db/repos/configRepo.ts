import { db } from "../index";
import { meta } from "../schema";
import { eq } from "drizzle-orm";

const LAST_SYNC_KEY = "last_sync";

export const ConfigRepo = {
  async getLastSync(): Promise<number> {
    const rows = await db
      .select()
      .from(meta)
      .where(eq(meta.key, LAST_SYNC_KEY))
      .limit(1);

    return rows.length > 0 ? Number(rows[0].value) : 0;
  },

  async setLastSync(ts: number) {
    await db
      .insert(meta)
      .values({ key: LAST_SYNC_KEY, value: String(ts) })
      .onConflictDoUpdate({ target: meta.key, set: { value: String(ts) } });
  },
};
