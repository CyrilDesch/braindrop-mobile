import React, { useState } from "react";
import { StyleSheet, ScrollView } from "react-native";
import { LayoutView, Text, Icon, View, CreateNoteFAB } from "@ui";
import { StatusBar } from "expo-status-bar";
import { Theme } from "@ui/constants/Colors";
import Divider from "@ui/base/Divider";
import { CategoryProvider } from "../../../src/features/category/context/CategoryContext";
import CategoryList from "../../../src/features/category/components/CategoryList";

import TableRowsIcon from "../../../assets/icons/table-rows.svg";

export default function Notes() {
  const [searchText, setSearchText] = useState("");

  const handleCategoryPress = (category: any) => {
    // Handle category press - could navigate to category details
  };

  const handleFormSuccess = () => {
    // Handle successful category creation
  };

  return (
    <CategoryProvider>
      <LayoutView containerStyle={styles.container}>
        <StatusBar style={"auto"} />
        <ScrollView
          contentContainerStyle={{ gap: 24, paddingVertical: 10 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Search */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant={"h1"}>Notes Explorer</Text>
              <Icon
                colorName={"text"}
                size={20}
                style={{ marginBottom: 6 }}
                svg={TableRowsIcon}
              />
            </View>
          </View>
          <Divider />

          {/* Categories */}
          <View style={styles.section}>
            <CategoryList
              onCategoryPress={handleCategoryPress}
              searchText={searchText}
            />
          </View>
        </ScrollView>

        {/* Create Note Floating Action Button */}
        <CreateNoteFAB />
      </LayoutView>
    </CategoryProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    paddingTop: 12,
  },
  searchInput: {
    backgroundColor: Theme.light.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Theme.light.border1,
  },
});
