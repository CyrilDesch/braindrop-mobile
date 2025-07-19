import { Icon } from "@ui";
import { Tabs } from "expo-router";
import { TABS_HOME_ALIAS } from "src/routes/tabs/routes";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name={TABS_HOME_ALIAS}
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <Icon
              colorName={focused ? "secondary" : "primary"}
              name={"home"}
              size={30}
            />
          ),
          tabBarLabelStyle: {
            color: "black",
          },
        }}
      />
    </Tabs>
  );
}
