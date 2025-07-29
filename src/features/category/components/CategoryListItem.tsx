import React, { useMemo } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { View, Text, Card, Icon } from "@ui";
import { differenceInHours, formatDuration } from "date-fns";

import ArrowUpRightIcon from "../../../../assets/icons/arrow-up-right.svg";
import { CategoryWithLatestNote } from "src/features/category/types";

interface CategoryListItemProps {
  category: CategoryWithLatestNote;
  onPress?: () => void;
  displayMode?: "list" | "grid";
}

export function CategoryListItem({
  category,
  onPress,
  displayMode = "grid",
}: CategoryListItemProps) {
  const lastNoteUpdate = useMemo(() => {
    return category.recentNotes.length > 0
      ? formatDuration(
          {
            hours: differenceInHours(
              new Date(),
              category.recentNotes[0].updatedAt,
            ),
          },
          {
            format: ["hours", "minutes"],
          },
        )
      : "";
  }, [category]);

  const contentCategory = useMemo(() => {
    let content = "No notes yet";
    let i = 0;
    while (content.length < 60 && i < category.recentNotes.length) {
      const note = category.recentNotes[i];
      content += note.content;
      i++;
    }
    return content;
  }, [category]);

  if (displayMode === "grid") {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={styles.gridCardWrapper}
      >
        <Card borderColorName={"border1"} style={styles.gridCard}>
          <View style={styles.gridCardContent}>
            {/* Category Tag */}
            <View style={styles.categoryTag}>
              <Text colorName={"primary"} variant={"h4"}>
                {category.name}
              </Text>
            </View>

            {/* Note Content */}
            <Text
              colorName={"text"}
              numberOfLines={4}
              style={styles.gridNoteContent}
              variant={"body2"}
            >
              {contentCategory}
            </Text>

            {/* Bottom Info */}
            <View style={styles.gridBottomInfo}>
              <Text colorName={"gray"} variant={"caption"}>
                {lastNoteUpdate}
              </Text>
              <Icon colorName={"gray"} size={16} svg={ArrowUpRightIcon} />
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <Card>
        <View>
          {/* Main Content Area */}
          <View>
            {/* Category Badge */}
            <View>
              <Text colorName={"primary"} variant={"caption"}>
                {category.name.toUpperCase()}
              </Text>
            </View>

            {/* Note Text */}
            <Text colorName={"text"} numberOfLines={3} variant={"body1"}>
              {contentCategory}
            </Text>
          </View>

          {/* Footer with metadata */}
          <View>
            <View>
              <Text colorName={"gray"} variant={"caption"}>
                Updated {lastNoteUpdate}
              </Text>
            </View>
            <Icon colorName={"gray"} size={18} svg={ArrowUpRightIcon} />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gridCardWrapper: {
    width: "48%",
    height: 160,
    marginBottom: 12,
  },
  gridCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
  },
  gridCardContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  categoryTag: {
    marginBottom: 6,
  },
  gridNoteContent: {
    flex: 1,
    lineHeight: 18,
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  gridBottomInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },
});
