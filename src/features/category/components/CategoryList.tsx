import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import { View, Text } from "@ui";
import { ActivityIndicator } from "@ui/base/ActivityIndicator";
import { useCategory } from "../hooks/useCategory";
import { CategoryListItem } from "./CategoryListItem";
import { CategoryWithLatestNote } from "../types";

interface CategoryListProps {
  searchText?: string;
  onCategoryPress?: (category: CategoryWithLatestNote) => void;
}

export default function CategoryList({
  searchText = "",
  onCategoryPress,
}: CategoryListProps) {
  const { getCategoriesWithLatestNote } = useCategory();

  const { data: categories, error, isPending } = getCategoriesWithLatestNote();

  const filteredCategories = useMemo(() => {
    return categories
      ? categories.filter(
          (category) =>
            category.name.toLowerCase().includes(searchText.toLowerCase()) ||
            category.description
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            category.recentNotes.some((note) =>
              note.content.toLowerCase().includes(searchText.toLowerCase()),
            ),
        )
      : [];
  }, [categories, searchText]);

  if (isPending) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator colorName={"primary"} size={"large"} />
        <Text colorName={"text"} variant={"body1"}>
          Loading categories...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text colorName={"danger"} variant={"body1"}>
          Error loading categories: {error.message}
        </Text>
      </View>
    );
  }

  if (filteredCategories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text colorName={"text"} variant={"body1"}>
          {searchText
            ? "No categories found matching your search"
            : "No categories yet"}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.categoriesGrid}>
      {filteredCategories.map((category) => (
        <CategoryListItem
          key={category.id.toString()}
          category={category}
          onPress={() => onCategoryPress?.(category)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 6,
    columnGap: "4%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingVertical: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
});
