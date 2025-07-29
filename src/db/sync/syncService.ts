import apiClient from "../../core/api/client";
import { db } from "../index";
import { categories, notes } from "../schema";
import { inArray, eq, sql } from "drizzle-orm";
import { ConfigRepo } from "../repos/configRepo";
import { buildSyncDto } from "./buildSyncDto";
import { SyncResponseDto, CategoryResponseDto, NoteResponseDto } from "./dto";

const mapCat = (dto: CategoryResponseDto): typeof categories.$inferInsert => ({
  id: dto.id,
  name: dto.name,
  description: dto.description,
  createdAt: Date.parse(dto.createdAt),
  updatedAt: Date.parse(dto.updatedAt),
  deletedAt: null,
  dirty: 0,
});

const mapNote = (dto: NoteResponseDto): typeof notes.$inferInsert => ({
  id: dto.id,
  content: dto.content,
  categoryId: dto.categoryId,
  createdAt: Date.parse(dto.createdAt),
  updatedAt: Date.parse(dto.updatedAt),
  deletedAt: null,
  dirty: 0,
});

export async function sync(token: string) {
  const payload = await buildSyncDto();

  // TODO : update the endpoint when add user handling
  const { data } = await apiClient.post<SyncResponseDto>("/sync", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  await db.transaction(async (tx) => {
    // Categories
    const catRows = [
      ...data.createdCategories.map(mapCat),
      ...data.updatedCategories.map(mapCat),
    ];

    if (catRows.length) {
      await tx
        .insert(categories)
        .values(catRows)
        .onConflictDoUpdate({
          target: categories.id,
          set: {
            name: sql`excluded.name`,
            description: sql`excluded.description`,
            updatedAt: sql`excluded.updated_at`,
            deletedAt: null,
            dirty: 0,
          },
        });
    }

    if (data.deletedCategories.length) {
      await tx
        .update(categories)
        .set({ deletedAt: Date.now(), dirty: 0 })
        .where(inArray(categories.id, data.deletedCategories));
    }

    // Notes
    const noteRows = [
      ...data.createdNotes.map(mapNote),
      ...data.updatedNotes.map(mapNote),
    ];

    if (noteRows.length) {
      await tx
        .insert(notes)
        .values(noteRows)
        .onConflictDoUpdate({
          target: notes.id,
          set: {
            content: sql`excluded.content`,
            updatedAt: sql`excluded.updated_at`,
            deletedAt: null,
            dirty: 0,
          },
        });
    }

    if (data.deletedNotes.length) {
      await tx
        .update(notes)
        .set({ deletedAt: Date.now(), dirty: 0 })
        .where(inArray(notes.id, data.deletedNotes));
    }

    await tx
      .update(categories)
      .set({ dirty: 0 })
      .where(eq(categories.dirty, 1));
    await tx.update(notes).set({ dirty: 0 }).where(eq(notes.dirty, 1));
  });

  await ConfigRepo.setLastSync(Date.parse(data.until));
}
