import React, { useState } from "react";
import { StyleSheet, ScrollView } from "react-native";
import { LayoutView, Text, Button, Card, TextInput, Icon, View } from "@ui";
import { StatusBar } from "expo-status-bar";
import { Theme } from "@ui/constants/Colors";

import EditIcon from "@assets/icons/edit.svg";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("Idées SmartFoundr");
  const [noteText, setNoteText] = useState(
    'Préparer un workflow LG pour aider les makers à lancer leur SAAS.\n"Constrain is good. It\'s help creativity. Less people, less costs, etc..."\nProto sur N8N et passe sur Python pour ...',
  );

  const categories = [
    "Idées SmartFoundr",
    "Notes Rework",
    "Citations",
    "Idées",
  ];

  const recentNotes = [
    {
      id: 1,
      tag: "MEETINGS",
      title: "Meeting with Alex...",
      description: "Discuss API endpoints and timelines for V2.",
      placeholder: "qsdqsdqsdqsd.",
    },
    {
      id: 2,
      tag: "MEETINGS",
      title: "Meeting with Alex...",
      description: "Discuss API endpoints and timelines for V2.",
      placeholder: "qsdqsdqsdqsd.",
    },
    {
      id: 3,
      tag: "MEETINGS",
      title: "Meeting with Alex...",
      description: "Discuss API endpoints and timelines for V2.",
      placeholder: "qsdqsdqsdqsd.",
    },
    {
      id: 4,
      tag: "MEETINGS",
      title: "Meeting with Alex...",
      description: "Discuss API endpoints and timelines for V2.",
      placeholder: "qsdqsdqsdqsd.",
    },
  ];

  return (
    <LayoutView containerStyle={styles.container}>
      <StatusBar style={"auto"} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Quick Notes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant={"h1"}>Quick Notes</Text>
            <Icon
              colorName={"text"}
              size={20}
              style={{ marginBottom: 6 }}
              svg={EditIcon}
            />
          </View>

          {/* Category Tags */}
          <ScrollView
            contentContainerStyle={{ gap: 8 }}
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            horizontal
          >
            {categories.map((category) => (
              <Button
                key={category}
                colorName={
                  selectedCategory === category ? "text" : "background"
                }
                onPress={() => setSelectedCategory(category)}
                size={"small"}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.selectedCategory,
                ]}
                textColorName={
                  selectedCategory === category ? "background" : "text"
                }
                textVariant={"smallButton"}
                title={category}
              />
            ))}
          </ScrollView>

          {/* Note Input Area */}
          <View style={styles.noteInputContainer}>
            <TextInput
              numberOfLines={6}
              onChangeText={setNoteText}
              placeholder={"Enter your note here..."}
              style={styles.noteInput}
              value={noteText}
              multiline
            />
            <Button
              colorName={"primary"}
              icon={(color) => (
                <Icon
                  colorName={"textInverse"}
                  iconFamily={"MaterialIcons"}
                  name={"check"}
                  size={16}
                />
              )}
              iconPosition={"left"}
              size={"medium"}
              style={styles.validateButton}
              textColorName={"textInverse"}
              textVariant={"mediumButton"}
              title={"Valider"}
            />
          </View>
        </View>

        {/* Last Updated Notes Section */}
        <View style={styles.section}>
          <Text variant={"h2"}>Last Updated Notes</Text>

          {/* Notes Grid */}
          <View style={styles.notesGrid}>
            {recentNotes.map((note) => (
              <Card key={note.id} style={styles.noteCard}>
                <View style={styles.noteCardContent}>
                  <View style={styles.noteCardHeader}>
                    <Text
                      colorName={"secondary"}
                      style={styles.noteTag}
                      variant={"caption"}
                    >
                      {note.tag}
                    </Text>
                    <Icon
                      colorName={"text"}
                      iconFamily={"MaterialIcons"}
                      name={"open-in-new"}
                      size={16}
                    />
                  </View>
                  <Text style={styles.noteTitle} variant={"h3"}>
                    {note.title}
                  </Text>
                  <Text
                    colorName={"text"}
                    style={styles.noteDescription}
                    variant={"body2"}
                  >
                    {note.description}
                  </Text>
                  <Text
                    colorName={"secondary"}
                    style={styles.notePlaceholder}
                    variant={"caption"}
                  >
                    {note.placeholder}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <View style={styles.navItem}>
          <View style={styles.navIconContainer}>
            <Icon
              colorName={"text"}
              iconFamily={"MaterialIcons"}
              name={"home"}
              size={24}
            />
          </View>
          <Text style={styles.navText} variant={"caption"}>
            Home
          </Text>
        </View>
        <View style={styles.navItem}>
          <Icon
            colorName={"secondary"}
            iconFamily={"MaterialIcons"}
            name={"description"}
            size={24}
          />
          <Text
            colorName={"secondary"}
            style={styles.navText}
            variant={"caption"}
          >
            Notes
          </Text>
        </View>
        <View style={styles.navItem}>
          <Icon
            colorName={"secondary"}
            iconFamily={"MaterialIcons"}
            name={"settings"}
            size={24}
          />
          <Text
            colorName={"secondary"}
            style={styles.navText}
            variant={"caption"}
          >
            Settings
          </Text>
        </View>
      </View>
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
  },
  categoriesContainer: {
    gap: 8,
  },
  categoryButton: {
    borderRadius: 15,
  },
  selectedCategory: {
    borderWidth: 0,
  },
  noteInputContainer: {
    position: "relative",
  },
  noteInput: {
    backgroundColor: Theme.light.white,
    borderRadius: 15,
    padding: 12,
    minHeight: 120,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: Theme.light.border1,
  },
  validateButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    borderRadius: 20,
  },
  notesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  noteCard: {
    width: "47%",
    minHeight: 140,
  },
  noteCardContent: {
    flex: 1,
    gap: 6,
  },
  noteCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  noteTag: {
    textTransform: "uppercase",
  },
  noteTitle: {
    flex: 1,
  },
  noteDescription: {
    flex: 1,
  },
  notePlaceholder: {
    fontStyle: "italic",
  },
  bottomNavigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Theme.light.white,
    borderTopWidth: 1,
    borderTopColor: Theme.light.border1,
    marginTop: 16,
  },
  navItem: {
    alignItems: "center",
    gap: 4,
  },
  navIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.light.border1,
    alignItems: "center",
    justifyContent: "center",
  },
  navText: {
    textAlign: "center",
  },
});
