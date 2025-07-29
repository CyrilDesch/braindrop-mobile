import React from "react";
import { StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { LayoutView, Text, Card, Icon, View } from "@ui";
import { StatusBar } from "expo-status-bar";
import Divider from "@ui/base/Divider";

import SettingsIcon from "../../../assets/icons/settings.svg";
import GridIcon from "../../../assets/icons/grid.svg";
import ArrowUpRightIcon from "../../../assets/icons/arrow-up-right.svg";

export default function Settings() {
  const settingsItems = [
    {
      id: 1,
      title: "Preferences",
      subtitle: "Personnalisation et préférences de l'app",
      icon: SettingsIcon,
      isDisabled: false,
    },
    {
      id: 2,
      title: "Stockage",
      subtitle: "Gérer l'espace de stockage local",
      icon: GridIcon,
      isDisabled: false,
    },
    {
      id: 3,
      title: "Account",
      subtitle: "Gestion du compte utilisateur",
      icon: SettingsIcon,
      isDisabled: true,
    },
  ];

  const handleSettingPress = (item: (typeof settingsItems)[0]) => {
    if (item.isDisabled) return;
    // Handle navigation or action for each setting
    // TODO: Implement navigation to setting screens
  };

  return (
    <LayoutView containerStyle={styles.container}>
      <StatusBar style={"auto"} />
      <ScrollView
        contentContainerStyle={{ gap: 24, paddingVertical: 10 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Settings Header */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant={"h1"}>Settings</Text>
          </View>
        </View>

        {/* Settings List */}
        <View style={styles.section}>
          <Card style={styles.settingsCard}>
            {settingsItems.map((item, index) => (
              <View key={item.id}>
                <TouchableOpacity
                  disabled={item.isDisabled}
                  onPress={() => handleSettingPress(item)}
                  style={[
                    styles.settingItem,
                    item.isDisabled && styles.settingItemDisabled,
                  ]}
                >
                  <View style={styles.settingItemLeft}>
                    <View style={styles.iconContainer}>
                      <Icon
                        colorName={item.isDisabled ? "border1" : "primary"}
                        size={20}
                        svg={item.icon}
                      />
                    </View>
                    <View style={styles.settingTextContainer}>
                      <Text
                        colorName={item.isDisabled ? "border1" : "text"}
                        variant={"body1"}
                      >
                        {item.title}
                      </Text>
                      <Text
                        colorName={item.isDisabled ? "border1" : "gray"}
                        variant={"body2"}
                      >
                        {item.subtitle}
                      </Text>
                    </View>
                  </View>
                  {!item.isDisabled && (
                    <Icon colorName={"gray"} size={16} svg={ArrowUpRightIcon} />
                  )}
                </TouchableOpacity>
                {index < settingsItems.length - 1 && <Divider />}
              </View>
            ))}
          </Card>
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
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    paddingTop: 12,
    paddingBottom: 4,
  },
  settingsCard: {
    padding: 0,
    paddingVertical: 0,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingItemDisabled: {
    opacity: 0.5,
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
    gap: 2,
  },
});
