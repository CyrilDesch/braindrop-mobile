import React from "react";
import { StyleSheet, FlatList, View as RNView } from "react-native";
import { View, Text } from "@ui";
import { useNote } from "../hooks/useNote";
import { NoteListItem } from "./NoteListItem";
import { Note, NoteWithCategory } from "../types";

interface NoteListProps<T extends Note | NoteWithCategory> {
  categoryId?: string;
  onNotePress?: (note: T) => void;
  useRecentNotes?: boolean;
  recentNotesLimit?: number;
  displayMode?: "list" | "grid";
}

export function NoteList<T extends Note | NoteWithCategory>({
  categoryId,
  onNotePress,
  useRecentNotes = false,
  recentNotesLimit = 10,
  displayMode = "list",
}: NoteListProps<T>) {
  const { getNotes, getRecentNotes, getNotesByCategory } = useNote();

  const query = useRecentNotes
    ? getRecentNotes(recentNotesLimit)
    : categoryId
    ? getNotesByCategory(categoryId)
    : getNotes();

  if (query.isLoading) {
    return (
      <View style={styles.container}>
        <Text colorName={"text"} variant={"body1"}>
          Loading notes...
        </Text>
      </View>
    );
  }

  if (query.isError) {
    return (
      <View style={styles.container}>
        <Text colorName={"danger"} variant={"body1"}>
          Error loading notes: {query.error?.message}
        </Text>
      </View>
    );
  }

  const notes = query.data || [];

  if (notes.length === 0) {
    return (
      <View style={styles.container}>
        <Text colorName={"gray"} variant={"body2"}>
          No notes found...
        </Text>
      </View>
    );
  }

  if (displayMode === "grid") {
    return (
      <RNView style={styles.gridContainer}>
        {notes.map((note) => (
          <NoteListItem
            key={note.id}
            displayMode={"grid"}
            note={note}
            onPress={() => onNotePress?.(note as T)}
          />
        ))}
      </RNView>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.listContent}
      data={notes}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <NoteListItem
          displayMode={"list"}
          note={item}
          onPress={() => onNotePress?.(item as T)}
        />
      )}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 8,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 6,
    columnGap: "4%",
  },
});
