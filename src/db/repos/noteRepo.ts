import { db } from "../index";
import { noteEmbeddings, notes, categories } from "../schema";
import { isNull, eq, inArray, desc } from "drizzle-orm";
import { EmbeddingService } from "../../features/embedding/services/embeddingService";
import { Logger } from "../../core/logger";

export interface NoteCreateInput {
  content: string;
  categoryId: string;
}
export interface NoteUpdateInput {
  content?: string;
  categoryId?: string;
}

export const NoteRepo = {
  async create({ content, categoryId }: NoteCreateInput) {
    const now = Date.now();

    // Create the note first
    const [{ id }] = await db
      .insert(notes)
      .values({
        content,
        categoryId,
        createdAt: now,
        updatedAt: now,
        dirty: 1,
      })
      .returning({ id: notes.id });

    // Generate and store embeddings for the note
    try {
      const embeddingService = EmbeddingService.getInstance();
      await embeddingService.initialise();

      const embeddings = await embeddingService.generateEmbedding(
        content,
        "query",
      );
      await NoteEmbeddingRepo.insertMany(
        id,
        embeddings.map((e) => e.embedding),
      );

      Logger.debug(`Generated embeddings for note: ${content.slice(0, 50)}...`);
    } catch (error) {
      Logger.error("Failed to generate embeddings for note:", error);
      // Note: we don't fail the note creation if embedding generation fails
    }

    return id;
  },

  async update(id: string, fields: NoteUpdateInput) {
    if (!Object.keys(fields).length) return;
    await db
      .update(notes)
      .set({ ...fields, updatedAt: Date.now(), dirty: 1 })
      .where(eq(notes.id, id));
  },

  async remove(id: string) {
    await db
      .update(notes)
      .set({ deletedAt: Date.now(), dirty: 1 })
      .where(eq(notes.id, id));
  },

  /** Trouve même si soft‑deleted */
  async find(id: string) {
    const rows = await db.select().from(notes).where(eq(notes.id, id)).limit(1);
    return rows[0] ?? null;
  },

  async listByCategory(categoryId: string) {
    return db.select().from(notes).where(eq(notes.categoryId, categoryId));
  },

  async listAll() {
    return db.select().from(notes).where(isNull(notes.deletedAt));
  },

  async listRecent(limit: number = 10) {
    return db
      .select({
        id: notes.id,
        content: notes.content,
        categoryId: notes.categoryId,
        categoryName: categories.name,
        createdAt: notes.createdAt,
        updatedAt: notes.updatedAt,
        deletedAt: notes.deletedAt,
        dirty: notes.dirty,
      })
      .from(notes)
      .leftJoin(categories, eq(notes.categoryId, categories.id))
      .where(isNull(notes.deletedAt))
      .orderBy(desc(notes.updatedAt))
      .limit(limit);
  },

  async softDeleteMany(ids: string[]) {
    if (!ids.length) return;
    await db
      .update(notes)
      .set({ deletedAt: Date.now(), dirty: 0 })
      .where(inArray(notes.id, ids));
  },
};

export const NoteEmbeddingRepo = {
  async insertMany(noteId: string, embeddings: number[][]) {
    const now = Date.now();
    return Promise.all(
      embeddings.map((embedding, i) =>
        db.insert(noteEmbeddings).values({
          noteId,
          embedding: JSON.stringify(embedding),
          chunkIndex: i,
          createdAt: now,
        }),
      ),
    );
  },

  async getByNoteId(noteId: string) {
    const rows = await db
      .select()
      .from(noteEmbeddings)
      .where(eq(noteEmbeddings.noteId, noteId));
    return rows.map((row) => ({
      ...row,
      embedding: JSON.parse(row.embedding),
    }));
  },

  async getByCategoryId(categoryId: string) {
    // Get all note embeddings for notes in a specific category
    const rows = await db
      .select({
        id: noteEmbeddings.id,
        noteId: noteEmbeddings.noteId,
        embedding: noteEmbeddings.embedding,
        chunkIndex: noteEmbeddings.chunkIndex,
        createdAt: noteEmbeddings.createdAt,
      })
      .from(noteEmbeddings)
      .leftJoin(notes, eq(noteEmbeddings.noteId, notes.id))
      .where(eq(notes.categoryId, categoryId));

    return rows.map((row) => ({
      ...row,
      embedding: JSON.parse(row.embedding),
    }));
  },

  async getAll() {
    const rows = await db.select().from(noteEmbeddings);
    return rows.map((row) => ({
      ...row,
      embedding: JSON.parse(row.embedding),
    }));
  },

  async clearByNoteId(noteId: string) {
    await db.delete(noteEmbeddings).where(eq(noteEmbeddings.noteId, noteId));
  },
};
