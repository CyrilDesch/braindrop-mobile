import { useMutation, useQuery } from "@tanstack/react-query";
import { noteService } from "../services/noteService";
import Toast from "react-native-toast-message";
import { Note } from "src/features/notes/types";
import { capturePrettyException } from "src/core/sentry/config";
import { queryClient } from "src/core/api/queryClient";

export function useNoteManager() {
  const getNotes = () =>
    useQuery({
      queryKey: ["notes"],
      queryFn: () =>
        noteService.getAllNotes().catch((error) => {
          capturePrettyException("Error fetching notes", error);
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "An error occurred while fetching notes",
          });
          throw error;
        }),
    });

  const getNotesByCategory = (categoryId: string) =>
    useQuery({
      queryKey: ["notes", "category", categoryId],
      queryFn: () =>
        noteService.getNotesByCategory(categoryId).catch((error) => {
          capturePrettyException("Error fetching notes by category", error);
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "An error occurred while fetching notes",
          });
          throw error;
        }),
    });

  const getRecentNotes = (limit: number = 10) =>
    useQuery({
      queryKey: ["notes", "recent", limit],
      queryFn: () =>
        noteService.getRecentNotes(limit).catch((error) => {
          capturePrettyException("Error fetching recent notes", error);
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "An error occurred while fetching recent notes",
          });
          throw error;
        }),
    });

  const getNoteById = (id: string) =>
    useQuery({
      queryKey: ["notes", id],
      queryFn: () =>
        noteService.getNoteById(id).catch((error) => {
          capturePrettyException("Error fetching note", error);
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "An error occurred while fetching note",
          });
          throw error;
        }),
    });

  // Helper function to invalidate related queries
  const invalidateNoteQueries = () => {
    queryClient.invalidateQueries({
      queryKey: ["notes"],
    });
    // Also invalidate categories with latest note since note changes affect them
    queryClient.invalidateQueries({
      queryKey: ["categories", "with-latest-note"],
    });
  };

  const createNote = useMutation({
    mutationFn: (
      noteData: Omit<
        Note,
        | "id"
        | "createdAt"
        | "updatedAt"
        | "deletedAt"
        | "dirty"
        | "afterConstruct"
      >,
    ) => noteService.createNote(noteData),
    onSuccess: () => {
      invalidateNoteQueries();
    },
    onError: (error: Error) => {
      Toast.show({
        type: "error",
        text1: "Error creating note",
        text2: error.message,
      });
    },
  });

  const createNoteInCategory = useMutation({
    mutationFn: ({
      content,
      categoryId,
    }: {
      content: string;
      categoryId: string;
    }) => noteService.createNoteInCategory(content, categoryId),
    onSuccess: () => {
      invalidateNoteQueries();
    },
    onError: (error: Error) => {
      Toast.show({
        type: "error",
        text1: "Error creating note",
        text2: error.message,
      });
    },
  });

  const updateNote = useMutation({
    mutationFn: ({
      id,
      noteData,
    }: {
      id: string;
      noteData: Partial<Pick<Note, "content" | "categoryId">>;
    }) => noteService.updateNote(id, noteData),
    onSuccess: () => {
      invalidateNoteQueries();
      Toast.show({
        type: "success",
        text1: "Note updated successfully",
      });
    },
    onError: (error: Error) => {
      Toast.show({
        type: "error",
        text1: "Error updating note",
        text2: error.message,
      });
    },
  });

  const deleteNote = useMutation({
    mutationFn: (id: string) => noteService.deleteNote(id),
    onSuccess: () => {
      invalidateNoteQueries();
      Toast.show({
        type: "success",
        text1: "Note deleted successfully",
      });
    },
    onError: (error: Error) => {
      Toast.show({
        type: "error",
        text1: "Error deleting note",
        text2: error.message,
      });
    },
  });

  return {
    getNotes,
    getNotesByCategory,
    getRecentNotes,
    getNoteById,
    createNote,
    createNoteInCategory,
    updateNote,
    deleteNote,
  };
}
