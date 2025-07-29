import * as FileSystem from "expo-file-system";
import { db } from "../index";
import { documents } from "../schema";
import { isNull, eq, inArray, and } from "drizzle-orm";

export interface DocumentCreateInput {
  name: string;
  localUri: string; // chemin temporaire du fichier
  checksum?: string;
  noteId: string;
}
export interface DocumentUpdateInput {
  name?: string;
  checksum?: string;
  localUri?: string;
}

const VAULT = FileSystem.documentDirectory + "attachments/";

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(VAULT);
  if (!info.exists)
    await FileSystem.makeDirectoryAsync(VAULT, { intermediates: true });
}

async function stashFile(src: string, finalName: string) {
  await ensureDir();
  const dest = VAULT + finalName;
  await FileSystem.copyAsync({ from: src, to: dest });
  return dest;
}

export const DocumentRepo = {
  async create({ name, localUri, checksum, noteId }: DocumentCreateInput) {
    const now = Date.now();
    const blobUri = await stashFile(localUri, `${now}-${name}`);

    const [{ id }] = await db
      .insert(documents)
      .values({
        name,
        blobUri,
        checksum,
        noteId,
        createdAt: now,
        updatedAt: now,
        dirty: 1,
      })
      .returning({ id: documents.id });

    return id;
  },

  async update(id: string, fields: DocumentUpdateInput) {
    if (!Object.keys(fields).length) return;

    let blobUri: string | undefined;
    if (fields.localUri) {
      blobUri = await stashFile(
        fields.localUri,
        `${Date.now()}-${fields.name ?? "file"}`,
      );
      delete fields.localUri;
    }

    await db
      .update(documents)
      .set({
        ...fields,
        ...(blobUri ? { blobUri } : {}),
        updatedAt: Date.now(),
        dirty: 1,
      })
      .where(eq(documents.id, id));
  },

  async remove(id: string, wipeFile = false) {
    if (wipeFile) {
      const row = await db
        .select({ uri: documents.blobUri })
        .from(documents)
        .where(eq(documents.id, id))
        .limit(1)
        .then((r) => r[0]);
      if (row?.uri) {
        const info = await FileSystem.getInfoAsync(row.uri);
        if (info.exists)
          await FileSystem.deleteAsync(row.uri, { idempotent: true });
      }
    }
    await db
      .update(documents)
      .set({ deletedAt: Date.now(), dirty: 1 })
      .where(eq(documents.id, id));
  },

  async listByNote(noteId: string) {
    return db
      .select()
      .from(documents)
      .where(and(isNull(documents.deletedAt), eq(documents.noteId, noteId)));
  },

  async softDeleteMany(ids: string[]) {
    if (!ids.length) return;
    await db
      .update(documents)
      .set({ deletedAt: Date.now(), dirty: 0 })
      .where(inArray(documents.id, ids));
  },
};
