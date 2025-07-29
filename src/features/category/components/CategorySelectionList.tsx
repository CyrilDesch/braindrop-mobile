import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { Button, Text, Icon } from "@ui";
import { ActivityIndicator } from "@ui/base/ActivityIndicator";
import { router } from "expo-router";
import { UUIDTypes } from "uuid";

import PlusCircle from "../../../../assets/icons/plus-circle.svg";
import { Category } from "../types";

interface CategorySelectionListProps {
  /** Ordered categories to display */
  orderedCategories: Category[];
  /** Currently selected category */
  selectedCategory: UUIDTypes | "new" | null;
  /** Function to set the selected category */
  onSelectCategory: (categoryId: UUIDTypes | "new") => void;
  /** New category suggestion from AI */
  newCategorySuggestion: { title: string; description: string } | null;
  /** Whether categorization is in progress */
  isCategorizing: boolean;
  /** Whether categories are loading */
  categoriesIsLoading: boolean;
  /** Function to handle creating a new category */
  onCreateNewCategory?: (name: string, description: string) => void;
}

export function CategorySelectionList({
  orderedCategories,
  selectedCategory,
  onSelectCategory,
  newCategorySuggestion,
  isCategorizing,
  categoriesIsLoading,
  onCreateNewCategory,
}: CategorySelectionListProps) {
  const handleCreateNewCategory = (name: string, description: string) => {
    if (onCreateNewCategory) {
      onCreateNewCategory(name, description);
    } else {
      // Default behavior: navigate to create category page
      router.push({
        pathname: "/routes/create-category",
        params: {
          name,
          description,
        },
      });
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ gap: 10, paddingLeft: 10 }}
      showsHorizontalScrollIndicator={false}
      style={styles.categoriesContainer}
      horizontal
    >
      {/* Loading indicator for AI categorization */}
      {(isCategorizing || categoriesIsLoading) && <ActivityIndicator />}

      {/* New Category Suggestion */}
      {newCategorySuggestion && (
        <Button
          colorName={selectedCategory === "new" ? "secondary" : "border1"}
          icon={(color) => (
            <Icon colorOverride={color} size={16} svg={PlusCircle} />
          )}
          iconPosition={"left"}
          isOutline={selectedCategory !== "new"}
          onPress={() => {
            handleCreateNewCategory(
              newCategorySuggestion.title,
              newCategorySuggestion.description,
            );
          }}
          size={"small"}
          textColorName={selectedCategory === "new" ? "background" : "text"}
          textVariant={"body2"}
          title={newCategorySuggestion.title}
        />
      )}

      {/* Existing Categories */}
      {orderedCategories.map((category: Category) => {
        return (
          <Button
            key={category.id.toString()}
            colorName={
              selectedCategory === category.id ? "secondary" : "border1"
            }
            iconPosition={"left"}
            isOutline={selectedCategory !== category.id}
            onPress={() => {
              onSelectCategory(category.id);
            }}
            size={"small"}
            textColorName={
              selectedCategory === category.id ? "background" : "text"
            }
            textVariant={"body2"}
            title={category.name}
          />
        );
      })}

      {/* Empty State */}
      {orderedCategories.length === 0 &&
        !newCategorySuggestion &&
        !isCategorizing &&
        !categoriesIsLoading && (
          <Text colorName={"gray"} variant={"body2"}>
            You don't have any categories yet... Write your first note !
          </Text>
        )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  categoriesContainer: {
    gap: 8,
  },
});
