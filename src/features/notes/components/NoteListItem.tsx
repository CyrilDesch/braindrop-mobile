import React, { useMemo } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { View, Text, Card, Icon } from "@ui";
import { Note, NoteWithCategory } from "../types";
import { differenceInHours, formatDuration } from "date-fns";

import ArrowUpRightIcon from "../../../../assets/icons/arrow-up-right.svg";

interface NoteListItemProps {
  note: NoteWithCategory | Note;
  onPress?: () => void;
  displayMode?: "list" | "grid";
}

export function NoteListItem({
  note,
  onPress,
  displayMode = "list",
}: NoteListItemProps) {
  const lastNoteUpdate = useMemo(() => {
    return formatDuration(
      {
        hours: differenceInHours(new Date(), note.updatedAt),
      },
      {
        format: ["hours", "minutes"],
      },
    );
  }, [note]);

  if (displayMode === "grid") {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={styles.gridCardWrapper}
      >
        <Card borderColorName={"border1"} style={styles.gridCard}>
          <View style={styles.gridCardContent}>
            {"categoryName" in note && (
              <>
                {/* Category Tag */}
                <View style={styles.categoryTag}>
                  <Text colorName={"primary"} variant={"h4"}>
                    {note.categoryName}
                  </Text>
                </View>
              </>
            )}

            {/* Note Content */}
            <Text
              colorName={"text"}
              numberOfLines={4}
              style={styles.gridNoteContent}
              variant={"body2"}
            >
              {note.content}
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
            {"categoryName" in note && (
              <View>
                <Text colorName={"primary"} variant={"caption"}>
                  {note.categoryName}
                </Text>
              </View>
            )}

            {/* Note Text */}
            <Text colorName={"text"} numberOfLines={3} variant={"body1"}>
              {note.content}
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
