import { Stack } from "expo-router";
import React from "react";
import {
  TABS_ALIAS,
  CREATE_CATEGORY_MODAL_ALIAS,
  CREATE_NOTE_MODAL_ALIAS,
  EDIT_NOTE_MODAL_ALIAS,
} from "src/routes/routes";

export default function AppLayout() {
  return (
    <Stack
      initialRouteName={TABS_ALIAS}
      screenOptions={{ headerShown: false, presentation: "card" }}
    >
      <Stack.Screen name={TABS_ALIAS} />
      <Stack.Screen
        name={CREATE_CATEGORY_MODAL_ALIAS}
        options={{
          presentation: "transparentModal",
          animation: "fade",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={CREATE_NOTE_MODAL_ALIAS}
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={EDIT_NOTE_MODAL_ALIAS}
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
