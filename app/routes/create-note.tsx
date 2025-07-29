import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
} from "react-native";
import { View, Text, TextInput, Button, Card } from "@ui";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

interface NoteData {
  title: string;
  content: string;
  categoryId?: string;
}

export default function CreateNoteModal() {
  const { noteId } = useLocalSearchParams<{ noteId?: string }>();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!noteId;

  // Animation values
  const translateY = useSharedValue(height);

  useEffect(() => {
    // Entrance animation - slide up from bottom
    translateY.value = withSpring(0, {
      damping: 15,
      stiffness: 150,
    });

    // Load note data if editing
    if (isEditing) {
      // TODO: Load note data by ID
      // For now, using placeholder data
      setTitle("Sample Note Title");
      setContent("Sample note content...");
    }
  }, [translateY, isEditing]);

  const handleClose = () => {
    // Exit animation - slide down
    translateY.value = withTiming(height, { duration: 300 }, () => {
      runOnJS(router.back)();
    });
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Note title is required");
      return;
    }

    if (!content.trim()) {
      Alert.alert("Error", "Note content is required");
      return;
    }

    try {
      setIsLoading(true);

      // TODO: Implement note creation/update logic
      // const noteData: NoteData = {
      //   title: title.trim(),
      //   content: content.trim(),
      // };

      // if (isEditing) {
      //   await updateNote(noteId, noteData);
      // } else {
      //   await createNote(noteData);
      // }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      handleClose();
    } catch (error) {
      Alert.alert("Error", `Failed to ${isEditing ? "update" : "create"} note`);
    } finally {
      setIsLoading(false);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <>
      <StatusBar style={"light"} />
      <View style={styles.overlay}>
        <Pressable onPress={handleClose} style={styles.backdrop} />

        <Animated.View style={[styles.modalContainer, animatedStyle]}>
          <Card
            borderColorName={"border2"}
            style={StyleSheet.flatten([
              styles.modalCard,
              { paddingTop: insets.top + 20 },
            ])}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Pressable onPress={handleClose} style={styles.closeButton}>
                  <Text colorName={"gray"} variant={"body1"}>
                    Cancel
                  </Text>
                </Pressable>
              </View>

              <Text colorName={"text"} variant={"h3"}>
                {isEditing ? "Edit Note" : "New Note"}
              </Text>

              <View style={styles.headerRight}>
                <Button
                  disabled={isLoading}
                  onPress={handleSave}
                  style={styles.saveButton}
                  textColorName={"background"}
                  title={isLoading ? "Saving..." : "Save"}
                />
              </View>
            </View>

            {/* Content */}
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Title Input */}
              <View style={styles.inputGroup}>
                <TextInput
                  onChangeText={setTitle}
                  placeholder={"Note title"}
                  style={styles.titleInput}
                  value={title}
                  autoFocus
                />
              </View>

              {/* Content Input - Rich text editor placeholder */}
              <View style={styles.contentContainer}>
                <TextInput
                  onChangeText={setContent}
                  placeholder={"Start writing your note..."}
                  style={styles.contentInput}
                  value={content}
                  multiline
                />

                {/* Rich text editor will replace this TextInput */}
                <View style={styles.editorPlaceholder}>
                  <Text colorName={"gray"} variant={"body2"}>
                    📝 Rich text editor will be implemented here
                  </Text>
                  <Text colorName={"gray"} variant={"caption"}>
                    For now, use the text area above for content
                  </Text>
                </View>
              </View>
            </ScrollView>
          </Card>
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    flex: 1,
    marginTop: 50, // Leave some space at the top
  },
  modalCard: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scrollContent: {
    flexGrow: 1,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: "bold",
    borderWidth: 0,
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingVertical: 12,
  },
  contentContainer: {
    flex: 1,
    gap: 20,
  },
  contentInput: {
    flex: 1,
    minHeight: 200,
    borderWidth: 0,
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingVertical: 12,
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: "top",
  },
  editorPlaceholder: {
    padding: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e9ecef",
    borderStyle: "dashed",
    alignItems: "center",
    gap: 8,
  },
});
