import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import Toast from "react-native-toast-message";
import { capturePrettyException } from "src/core/sentry/config";
import { Text } from "@ui";
import { db } from "./index";
import migrations from "./drizzle/migrations";

export function LocalDatabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    if (!success && error) {
      capturePrettyException("Migration error occured", error);
      setTimeout(() => {
        Toast.show({
          type: "error",
          text1: "Store Error",
          text2: "Your store cannot be updated. Contact support.",
        });
      }, 2000);
    }
  }, [success, error]);

  // Don't render children until migrations are complete
  if (!success && !error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size={"large"} />
        <Text style={{ marginTop: 16 }}>Setting up database...</Text>
      </View>
    );
  }

  // If there's an error, still render children but the error toast will show
  return <>{children}</>;
}
