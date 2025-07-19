import { Stack } from "expo-router";
import React from "react";
import { TABS_ALIAS } from "src/routes/routes";

export default function AppLayout() {
  return (
    <Stack
      initialRouteName={TABS_ALIAS}
      screenOptions={{ headerShown: false, presentation: "card" }}
    >
      <Stack.Screen name={TABS_ALIAS} />
    </Stack>
  );
}
