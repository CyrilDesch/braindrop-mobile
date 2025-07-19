import { navigationIntegration } from "../src/core/sentry/config";
import { Slot, SplashScreen } from "expo-router";
import { useNavigationContainerRef } from "expo-router";
import { useEffect } from "react";
import * as Sentry from "@sentry/react-native";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useLoadFonts from "../src/core/hooks/useLoadFonts";
import { toastConfig } from "src/core/toast/config";

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

function RootLayout() {
  const ref = useNavigationContainerRef();

  useEffect(() => {
    if (ref?.current) {
      navigationIntegration.registerNavigationContainer(ref);
    }
  }, [ref]);

  return <RootLayoutNav />;
}

function RootLayoutWithQueryClient() {
  return <RootLayout />;
}

const SentryWrappedRootLayout = Sentry.wrap(RootLayoutWithQueryClient);
export default SentryWrappedRootLayout;
