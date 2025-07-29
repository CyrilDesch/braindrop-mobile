import React, { useState } from "react";
import { StyleSheet, Alert } from "react-native";
import { View, Text, TextInput, Button } from "@ui";
import { useCategory } from "../hooks/useCategory";
import { Category } from "../types";

interface CategoryFormProps {
  onSuccess?: (category: Category) => void;
  initialName?: string;
  initialDescription?: string;
}

export default function CategoryForm({
  onSuccess,
  initialName = "",
  initialDescription = "",
}: CategoryFormProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const { createCategory } = useCategory();

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Category name is required");
      return;
    }

    createCategory.mutate(
      {
        name: name.trim(),
        description: description.trim(),
      },
      {
        onSuccess: (category) => {
          setName("");
          setDescription("");
          onSuccess?.(category);
        },
      },
    );
  };

  return (
    <View style={styles.formContainer}>
      <View style={styles.inputContainer}>
        <Text colorName={"text"} variant={"body2"}>
          Name *
        </Text>
        <TextInput
          maxLength={64}
          onChangeText={setName}
          placeholder={"Enter category name..."}
          style={styles.input}
          value={name}
          variant={"body1"}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text colorName={"text"} variant={"body2"}>
          Description *
        </Text>
        <TextInput
          maxLength={200}
          numberOfLines={6}
          onChangeText={setDescription}
          placeholder={"Enter category description..."}
          style={[styles.input, styles.textArea]}
          value={description}
          variant={"body1"}
          multiline
        />
      </View>

      <Button
        colorName={"primary"}
        disabled={
          createCategory.isPending || !name.trim() || !description.trim()
        }
        onPress={handleSubmit}
        title={"Create Folder"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  formCard: {
    padding: 16,
  },
  formContainer: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  textArea: {
    textAlignVertical: "top",
  },
});
