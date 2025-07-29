import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { Button, Card, TextInput, Icon, View } from "@ui";
import Divider from "@ui/base/Divider";
import { UUIDTypes } from "uuid";

import CheckIcon from "../../../../assets/icons/check.svg";
import { useCategory } from "src/features/category/hooks/useCategory";
import { CategorySelectionList } from "src/features/category/components/CategorySelectionList";
import { useNote } from "src/features/notes/hooks/useNote";

interface NoteFormProps {
  initialNoteText?: string;
  onNoteCreated?: () => void;
}

export default function NoteForm({
  initialNoteText = "",
  onNoteCreated,
}: NoteFormProps) {
  const [noteText, setNoteText] = useState(initialNoteText);

  // Get category manager
  const { useCategorizeNote } = useCategory();

  // Get note manager
  const { createNoteInCategory } = useNote();

  // AI categorization hook - manages categories internally via manager
  const {
    categorizeNote,
    newCategorySuggestion,
    selectedCategory,
    setSelectedCategory,
    isLoading: isCategorizingNote,
    orderedCategories,
    setHasChosenCategory,
    categoriesIsLoading,
  } = useCategorizeNote;

  // Handle note text changes
  const handleNoteTextChange = (text: string) => {
    setNoteText(text);
    categorizeNote(text);
  };

  // Handle note creation
  const handleCreateNote = () => {
    if (!noteText.trim() || !selectedCategory) {
      return;
    }

    createNoteInCategory.mutate(
      {
        content: noteText.trim(),
        categoryId: selectedCategory.toString(),
      },
      {
        onSuccess: () => {
          // Clear the note text after successful creation
          setNoteText("");
          // Reset category selection
          setSelectedCategory("new");
          setHasChosenCategory(false);
          // Call the optional callback
          onNoteCreated?.();
        },
      },
    );
  };

  return (
    <Card style={{ ...styles.section, paddingVertical: 10 }}>
      {/* Category Tags */}
      <CategorySelectionList
        categoriesIsLoading={categoriesIsLoading}
        isCategorizing={isCategorizingNote}
        newCategorySuggestion={newCategorySuggestion}
        onSelectCategory={(categoryId: UUIDTypes | "new") => {
          setSelectedCategory(categoryId);
          setHasChosenCategory(false);
        }}
        orderedCategories={orderedCategories}
        selectedCategory={selectedCategory}
      />

      <Divider />

      <TextInput
        onChangeText={handleNoteTextChange}
        placeholder={"Braindrop your thoughts here..."}
        style={{ paddingHorizontal: 17, minHeight: 175, maxHeight: 250 }}
        textAlignVertical={"top"}
        value={noteText}
        variant={"body1"}
        multiline
      />

      <View style={{ paddingHorizontal: 10 }}>
        <Button
          colorName={"primary"}
          disabled={
            noteText.trim().length < 1 ||
            !selectedCategory ||
            createNoteInCategory.isPending
          }
          icon={(color) => (
            <Icon colorOverride={color} size={16} svg={CheckIcon} />
          )}
          iconPosition={"left"}
          onPress={handleCreateNote}
          size={"small"}
          style={{ marginTop: 10, alignSelf: "flex-end" }}
          textColorName={"textInverse"}
          textVariant={"smallButton"}
          title={"Save"}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
});
