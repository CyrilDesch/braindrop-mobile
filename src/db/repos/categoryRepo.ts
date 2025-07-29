import { db } from "../index";
import { categories, notes } from "../schema";
import { eq, isNull, desc, max, sql } from "drizzle-orm";
import { categoryEmbeddings } from "../schema";

export const CategoryRepo = {
  async create(data: { name: string; description: string }) {
    const now = Date.now();
    const newCategory = await db
      .insert(categories)
      .values({
        ...data,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return newCategory[0];
  },

  async update(
    id: string,
    fields: Partial<{ name: string; description: string }>,
  ) {
    await db
      .update(categories)
      .set({ ...fields, updatedAt: Date.now(), dirty: 1 })
      .where(eq(categories.id, id));
  },

  /** Soft delete */
  async remove(id: string) {
    await db
      .update(categories)
      .set({ deletedAt: Date.now(), dirty: 1 })
      .where(eq(categories.id, id));
  },

  async removeByName(name: string) {
    await db.delete(categories).where(eq(categories.name, name));
  },

  async list() {
    return db.select().from(categories).where(isNull(categories.deletedAt));
  },

  async listWithLastUsed() {
    const lastUsedAt = sql`
      coalesce(${max(notes.updatedAt)}, ${categories.createdAt})
    `.as("lastUsedAt");

    return db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
        deletedAt: categories.deletedAt,
        dirty: categories.dirty,
        lastUsedAt,
      })
      .from(categories)
      .leftJoin(notes, eq(notes.categoryId, categories.id))
      .where(isNull(categories.deletedAt))
      .groupBy(
        categories.id,
        categories.name,
        categories.description,
        categories.createdAt,
        categories.updatedAt,
        categories.deletedAt,
        categories.dirty,
      )
      .orderBy(
        desc(
          sql`CASE WHEN ${max(notes.updatedAt)} IS NOT NULL THEN 1 ELSE 0 END`,
        ),
        desc(lastUsedAt),
      );
  },

  async listWithLatestNote() {
    // Get categories with their note count first
    const categoriesWithMeta = await db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
        deletedAt: categories.deletedAt,
        dirty: categories.dirty,
        noteCount: sql`(
          SELECT COUNT(*) 
          FROM ${notes} 
          WHERE ${notes.categoryId} = ${categories.id} 
          AND ${notes.deletedAt} IS NULL
        )`.as("noteCount"),
        latestNoteTime: sql`(
          SELECT MAX(${notes.updatedAt}) 
          FROM ${notes} 
          WHERE ${notes.categoryId} = ${categories.id} 
          AND ${notes.deletedAt} IS NULL
        )`.as("latestNoteTime"),
      })
      .from(categories)
      .where(isNull(categories.deletedAt));

    // Get top 3 recent notes for each category using a more compatible approach
    // Since we can't easily use window functions with WHERE directly, let's do this efficiently
    const categoryIds = categoriesWithMeta.map((cat) => cat.id);

    if (categoryIds.length === 0) {
      return [];
    }

    // Get recent notes for all categories efficiently
    const recentNotesPromises = categoryIds.map(async (categoryId) => {
      const categoryNotes = await db
        .select({
          content: notes.content,
          updatedAt: notes.updatedAt,
        })
        .from(notes)
        .where(
          sql`${notes.categoryId} = ${categoryId} AND ${notes.deletedAt} IS NULL`,
        )
        .orderBy(desc(notes.updatedAt))
        .limit(3);

      return {
        categoryId,
        notes: categoryNotes.map((note) => ({
          content: note.content,
          updatedAt: new Date(note.updatedAt),
        })),
      };
    });

    const recentNotesResults = await Promise.all(recentNotesPromises);

    // Create a map for efficient lookup
    const notesByCategory = new Map<
      string,
      Array<{ content: string; updatedAt: Date }>
    >();
    recentNotesResults.forEach(({ categoryId, notes }) => {
      notesByCategory.set(categoryId, notes);
    });

    // Combine and sort the final results
    const result = categoriesWithMeta.map((category) => ({
      ...category,
      noteCount: Number(category.noteCount),
      recentNotes: notesByCategory.get(category.id) || [],
    }));

    // Sort by categories with notes first, then by latest note time
    return result.sort((a, b) => {
      const aHasNotes = a.noteCount > 0;
      const bHasNotes = b.noteCount > 0;

      if (aHasNotes && !bHasNotes) return -1;
      if (!aHasNotes && bHasNotes) return 1;

      if (aHasNotes && bHasNotes) {
        const aLatestTime = Number(a.latestNoteTime || a.updatedAt);
        const bLatestTime = Number(b.latestNoteTime || b.updatedAt);
        return bLatestTime - aLatestTime;
      }

      return Number(b.updatedAt) - Number(a.updatedAt);
    });
  },
};

export const CategoryEmbeddingRepo = {
  async insertMany(categoryId: string, embeddings: number[][]) {
    const now = Date.now();
    return Promise.all(
      embeddings.map((embedding, i) =>
        db.insert(categoryEmbeddings).values({
          categoryId,
          embedding: JSON.stringify(embedding),
          chunkIndex: i,
          createdAt: now,
        }),
      ),
    );
  },

  async getByCategoryId(categoryId: string) {
    const rows = await db
      .select()
      .from(categoryEmbeddings)
      .where(eq(categoryEmbeddings.categoryId, categoryId));
    return rows.map((row) => ({
      ...row,
      embedding: JSON.parse(row.embedding),
    }));
  },

  async getAll() {
    const rows = await db.select().from(categoryEmbeddings);
    return rows.map((row) => ({
      ...row,
      embedding: JSON.parse(row.embedding),
    }));
  },

  async clearByCategoryId(categoryId: string) {
    await db
      .delete(categoryEmbeddings)
      .where(eq(categoryEmbeddings.categoryId, categoryId));
  },
};
