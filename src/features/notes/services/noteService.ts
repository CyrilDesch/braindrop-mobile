import { Note, NoteWithCategory } from "../types";
import { capturePrettyException } from "../../../core/sentry/config";
import { NoteRepo } from "src/db/repos";
import { transformToClass } from "src/core/utils/class-transformer";

export const noteService = {
  /**
   * Get all notes
   */
  getAllNotes: async (): Promise<Note[]> => {
    try {
      const notes = await NoteRepo.listAll();
      return notes.map((note: any) => transformToClass(Note, note));
    } catch (error) {
      capturePrettyException("Error getting all notes", error);
      throw error;
    }
  },

  /**
   * Get recent notes
   */
  getRecentNotes: async (limit: number = 10): Promise<NoteWithCategory[]> => {
    try {
      const notes = await NoteRepo.listRecent(limit);
      return notes.map((note: any) => transformToClass(NoteWithCategory, note));
    } catch (error) {
      capturePrettyException("Error getting recent notes", error);
      throw error;
    }
  },

  /**
   * Get notes by category
   */
  getNotesByCategory: async (categoryId: string): Promise<Note[]> => {
    try {
      const notes = await NoteRepo.listByCategory(categoryId);
      return notes.map((note) => transformToClass(Note, note));
    } catch (error) {
      capturePrettyException("Error getting notes by category", error);
      throw error;
    }
  },

  /**
   * Get a single note by ID
   */
  getNoteById: async (id: string): Promise<Note | null> => {
    try {
      const note = await NoteRepo.find(id);
      return note ? transformToClass(Note, note) : null;
    } catch (error) {
      capturePrettyException("Error getting note by ID", error);
      throw error;
    }
  },

  /**
   * Create a new note
   */
  createNote: async (
    noteData: Omit<
      Note,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "deletedAt"
      | "dirty"
      | "afterConstruct"
    >,
  ): Promise<Note> => {
    try {
      const newNoteId = await NoteRepo.create({
        content: noteData.content,
        categoryId: noteData.categoryId,
      });
      const newNote = await NoteRepo.find(newNoteId);
      return transformToClass(Note, newNote);
    } catch (error) {
      capturePrettyException("Error creating note", error);
      throw error;
    }
  },

  /**
   * Update an existing note
   */
  updateNote: async (
    id: string,
    noteData: Partial<Pick<Note, "content" | "categoryId">>,
  ): Promise<void> => {
    try {
      await NoteRepo.update(id, {
        content: noteData.content,
        categoryId: noteData.categoryId,
      });
    } catch (error) {
      capturePrettyException("Error updating note", error);
      throw error;
    }
  },

  /**
   * Delete a note (soft delete)
   */
  deleteNote: async (id: string): Promise<void> => {
    try {
      await NoteRepo.remove(id);
    } catch (error) {
      capturePrettyException("Error deleting note", error);
      throw error;
    }
  },

  /**
   * Create a note in a specific category
   */
  createNoteInCategory: async (
    content: string,
    categoryId: string,
  ): Promise<Note> => {
    try {
      const newNoteId = await NoteRepo.create({
        content,
        categoryId,
      });
      const newNote = await NoteRepo.find(newNoteId);
      return transformToClass(Note, newNote);
    } catch (error) {
      capturePrettyException("Error creating note in category", error);
      throw error;
    }
  },
};
