import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { LayoutView, Text, View, Icon } from "@ui";
import { StatusBar } from "expo-status-bar";
import Divider from "@ui/base/Divider";

import EditIcon from "../../../assets/icons/edit.svg";
import NoteForm from "src/features/notes/components/NoteForm";
import { NoteList } from "src/features/notes/components/NoteList";

export default function Home() {
  return (
    <LayoutView containerStyle={styles.container}>
      <StatusBar style={"auto"} />
      <ScrollView
        contentContainerStyle={{ gap: 22, paddingVertical: 10 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Notes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant={"h1"}>Quick Notes</Text>
            <Icon
              colorName={"text"}
              size={20}
              style={{ marginBottom: 3 }}
              svg={EditIcon}
            />
          </View>

          <NoteForm
            initialNoteText={
              "Préparer un workflow LG pour aider les makers à lancer leur SAAS."
            }
          />
        </View>

        <Divider />

        {/* Last Updated Notes Section */}
        <View style={styles.section}>
          <Text variant={"h2"}>View Last Updated Notes</Text>

          <NoteList
            displayMode={"grid"}
            recentNotesLimit={10}
            useRecentNotes={true}
          />
        </View>
      </ScrollView>
    </LayoutView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    paddingTop: 12,
  },
});
