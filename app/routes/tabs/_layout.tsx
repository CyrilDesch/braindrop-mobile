import { Icon, Text } from "@ui";
import { Tabs } from "expo-router";
import { TABS_HOME_ALIAS } from "src/routes/tabs/routes";

import SettingsIcon from "../../../assets/icons/settings.svg";
import NotesIcon from "../../../assets/icons/table-rows.svg";
import HomeIcon from "../../../assets/icons/home.svg";
import { useThemeColor } from "src/core/hooks/useThemeColor";

export default function TabsLayout() {
  const grayColor = useThemeColor("gray");
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { borderTopColor: grayColor },
      }}
    >
      <Tabs.Screen
        name={TABS_HOME_ALIAS}
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <Icon
              colorName={focused ? "text" : "gray"}
              size={30}
              svg={HomeIcon}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{ color: focused ? "black" : "gray" }}
              variant={"caption"}
            >
              Home
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name={"notes"}
        options={{
          title: "Notes",
          tabBarIcon: ({ focused }) => (
            <Icon
              colorName={focused ? "text" : "gray"}
              size={30}
              svg={NotesIcon}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{ color: focused ? "black" : "gray" }}
              variant={"caption"}
            >
              Notes
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name={"settings"}
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => (
            <Icon
              colorName={focused ? "text" : "gray"}
              size={30}
              svg={SettingsIcon}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{ color: focused ? "black" : "gray" }}
              variant={"caption"}
            >
              Settings
            </Text>
          ),
        }}
      />
    </Tabs>
  );
}
