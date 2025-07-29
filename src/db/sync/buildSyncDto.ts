// src/db/sync/buildSyncDto.ts
import { db } from "../index";
import { categories, notes } from "../schema";
import { eq } from "drizzle-orm";
import { ConfigRepo } from "../repos/configRepo";
import type { SyncDto } from "./dto";

export async function buildSyncDto(): Promise<SyncDto> {
  const since = await ConfigRepo.getLastSync();

  const dirtyCats = await db
    .select()
    .from(categories)
    .where(eq(categories.dirty, 1));

  const dirtyNotes = await db.select().from(notes).where(eq(notes.dirty, 1));

  /* Helpers ------------------------------------------------------------- */
  const toIso = (ms: number) => new Date(ms).toISOString();
  const same = <T extends { createdAt: number; updatedAt: number }>(r: T) =>
    r.createdAt === r.updatedAt;
  const notDeleted = <T extends { deletedAt: number | null }>(r: T) =>
    r.deletedAt === null;
  const deleted = <T extends { deletedAt: number | null }>(r: T) =>
    r.deletedAt !== null;

  /* Build DTO ----------------------------------------------------------- */
  return {
    since: new Date(since).toISOString(),

    categoriesToCreate: dirtyCats
      .filter((c) => same(c) && notDeleted(c))
      .map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        createdAt: toIso(c.createdAt),
        updatedAt: toIso(c.updatedAt),
      })),

    categoriesToUpdate: dirtyCats
      .filter((c) => !same(c) && notDeleted(c))
      .map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        createdAt: toIso(c.createdAt),
        updatedAt: toIso(c.updatedAt),
      })),

    categoriesToDelete: dirtyCats.filter(deleted).map((c) => c.id),

    notesToCreate: dirtyNotes
      .filter((n) => same(n) && notDeleted(n))
      .map((n) => ({
        id: n.id,
        content: n.content,
        categoryId: n.categoryId,
        createdAt: toIso(n.createdAt),
        updatedAt: toIso(n.updatedAt),
      })),

    notesToUpdate: dirtyNotes
      .filter((n) => !same(n) && notDeleted(n))
      .map((n) => ({
        id: n.id,
        content: n.content,
        categoryId: n.categoryId,
        createdAt: toIso(n.createdAt),
        updatedAt: toIso(n.updatedAt),
      })),

    notesToDelete: dirtyNotes.filter(deleted).map((n) => n.id),
  };
}
