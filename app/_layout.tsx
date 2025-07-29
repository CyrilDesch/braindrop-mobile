import { Slot, SplashScreen } from "expo-router";
import { useNavigationContainerRef } from "expo-router";
import { useEffect } from "react";
import * as Sentry from "@sentry/react-native";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useLoadFonts from "../src/core/hooks/useLoadFonts";
import { toastConfig } from "src/core/toast/config";
import "react-native-get-random-values";
import { LocalDatabaseProvider } from "src/db/LocalDatabaseProvider";
import { CategoryProvider } from "src/features/category/context/CategoryContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../src/core/api/queryClient";
import { DeviceIdProvider } from "../src/core/context/DeviceIdContext";
import { EmbeddingProvider } from "../src/features/embedding/context/EmbeddingContext";
import { NoteProvider } from "src/features/notes/context/NoteContext";
import { useEmbedding } from "src/features/embedding/hooks/useEmbedding";
import { Logger } from "../src/core/logger";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const insets = useSafeAreaInsets();
  const fontsLoaded = useLoadFonts();

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (fontsLoaded) {
      timeout = setTimeout(() => {
        SplashScreen.hideAsync();
      }, 500);
    }
    return () => clearTimeout(timeout);
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <Slot />
      <Toast config={toastConfig} topOffset={insets.top} />
    </>
  );
}

// Component to eagerly initialize embedding service
function EagerEmbeddingInitializer() {
  const { startBackgroundInitialization, status } = useEmbedding();

  useEffect(() => {
    if (status === "idle") {
      Logger.debug("Starting eager embedding initialization at app launch");
      startBackgroundInitialization();
    }
  }, [startBackgroundInitialization, status]);

  return null; // This component doesn't render anything
}

function RootLayout() {
  const ref = useNavigationContainerRef();

  useEffect(() => {
    if (ref?.current) {
      Sentry.setContext("navigation", {
        name: ref.current.getCurrentRoute()?.name,
      });
    }
  }, [ref]);

  return (
    <DeviceIdProvider>
      <LocalDatabaseProvider>
        <EmbeddingProvider>
          <EagerEmbeddingInitializer />
          <QueryClientProvider client={queryClient}>
            <CategoryProvider>
              <NoteProvider>
                <RootLayoutNav />
              </NoteProvider>
            </CategoryProvider>
          </QueryClientProvider>
        </EmbeddingProvider>
      </LocalDatabaseProvider>
    </DeviceIdProvider>
  );
}

function RootLayoutWithQueryClient() {
  return <RootLayout />;
}

const SentryWrappedRootLayout = Sentry.wrap(RootLayoutWithQueryClient);
export default SentryWrappedRootLayout;
