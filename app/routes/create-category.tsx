import React, { useEffect } from "react";
import { StyleSheet, Dimensions, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { CategoryForm } from "src/features/category/components";
import { Card } from "@ui";
import { useCategory } from "src/features/category/hooks/useCategory";

const { width, height } = Dimensions.get("window");

export default function CreateCategoryModal() {
  const { name, description } = useLocalSearchParams<{
    name?: string;
    description?: string;
  }>();

  const { useCategorizeNote } = useCategory();

  // Animation values
  const backgroundOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.8);
  const modalOpacity = useSharedValue(0);

  useEffect(() => {
    // Entrance animation
    backgroundOpacity.value = withTiming(1, { duration: 300 });
    modalScale.value = withSpring(1, { damping: 15 });
    modalOpacity.value = withTiming(1, { duration: 300 });
  }, [backgroundOpacity, modalScale, modalOpacity]);

  const handleClose = () => {
    // Exit animation
    backgroundOpacity.value = withTiming(0, { duration: 200 });
    modalScale.value = withTiming(0.8, { duration: 200 });
    modalOpacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(router.back)();
    });
  };

  const animatedBackgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
    opacity: modalOpacity.value,
  }));

  return (
    <>
      <StatusBar style={"light"} />
      <Animated.View style={[styles.overlay, animatedBackgroundStyle]}>
        <Pressable onPress={handleClose} style={styles.backdrop} />

        <Animated.View style={[styles.modalContainer, animatedModalStyle]}>
          <Card
            borderColorName={"border2"}
            onClose={handleClose}
            style={styles.modalCard}
            title={"It's a new category!"}
          >
            <CategoryForm
              initialDescription={description}
              initialName={name}
              onSuccess={(category) => {
                handleClose();
                // Clear the new category suggestion since we just created it
                useCategorizeNote.clearNewCategorySuggestion();
                // Add the new category to the beginning of the suggested categories
                useCategorizeNote.unshiftCategory(category.id);
              }}
            />
          </Card>
        </Animated.View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContainer: {
    width: Math.min(width - 40, 400),
    maxHeight: height * 0.8,
  },
  modalCard: {
    padding: 24,
    borderRadius: 16,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontWeight: "600",
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  createButton: {
    backgroundColor: "#007AFF",
  },
});
