import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, check } from "drizzle-orm/sqlite-core";
import { v4 as uuid } from "uuid";

export const categories = sqliteTable(
  "categories",
  {
    id: text("id").primaryKey().$defaultFn(uuid),
    name: text("name").notNull(),
    description: text("description").notNull(),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
    deletedAt: integer("deleted_at"),
    /** local‑only */
    dirty: integer("dirty")
      .notNull()
      .$default(() => 1), // 1 = needs sync
  },
  (table) => [
    check("description_max_length", sql`length(${table.description}) <= 200`),
    check("name_max_length", sql`length(${table.name}) <= 64`),
  ],
);

export const notes = sqliteTable(
  "notes",
  {
    id: text("id").primaryKey().$defaultFn(uuid),
    content: text("content").notNull(),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
    deletedAt: integer("deleted_at"),
    dirty: integer("dirty")
      .notNull()
      .$default(() => 1),
  },
  (table) => [
    check("content_max_length", sql`length(${table.content}) <= 10000`),
  ],
);

export const documents = sqliteTable("documents", {
  id: text("id").primaryKey().$defaultFn(uuid),
  name: text("name").notNull(),
  blobUri: text("blob_uri").notNull(), // stored with expo‑file‑system
  checksum: text("checksum"),
  noteId: text("note_id").references(() => notes.id),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
  deletedAt: integer("deleted_at"),
  dirty: integer("dirty")
    .notNull()
    .$default(() => 1),
});

export const meta = sqliteTable("meta", {
  key: text("key").primaryKey(),
  value: text("value"),
});

export const categoryEmbeddings = sqliteTable("category_embeddings", {
  id: text("id").primaryKey().$defaultFn(uuid),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id),
  embedding: text("embedding").notNull(), // JSON.stringify of float array
  chunkIndex: integer("chunk_index").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const noteEmbeddings = sqliteTable("note_embeddings", {
  id: text("id").primaryKey().$defaultFn(uuid),
  noteId: text("note_id")
    .notNull()
    .references(() => notes.id),
  embedding: text("embedding").notNull(), // JSON.stringify of float array
  chunkIndex: integer("chunk_index").notNull(),
  createdAt: integer("created_at").notNull(),
});
