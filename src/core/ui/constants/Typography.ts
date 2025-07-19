import { Platform } from "react-native";

export const typography = {
  headline: {
    fontFamily: "Geist-Black",
    fontSize: Platform.OS === "android" ? 68 : 70,
    lineHeight: Platform.OS === "android" ? 68 : 70,
  },
  h1: {
    fontFamily: "Geist-SemiBold",
    fontSize: Platform.OS === "android" ? 30 : 32,
  },
  h2: {
    fontFamily: "Geist-Medium",
    fontSize: Platform.OS === "android" ? 26 : 28,
  },
  h3: {
    fontFamily: "Geist-SemiBold",
    fontSize: Platform.OS === "android" ? 15 : 16,
  },
  body1: {
    fontFamily: "Geist-Regular",
    fontSize: Platform.OS === "android" ? 15 : 16,
  },
  body2: {
    fontFamily: "Geist-Regular",
    fontSize: Platform.OS === "android" ? 13 : 14,
  },
  button: {
    fontFamily: "Geist-SemiBold",
    fontSize: Platform.OS === "android" ? 16 : 18,
    letterSpacing: 0.3,
  },
  mediumButton: {
    fontFamily: "Geist-Medium",
    fontSize: Platform.OS === "android" ? 14 : 15,
    letterSpacing: 0.2,
  },
  smallButton: {
    fontFamily: "Geist-SemiBold",
    fontSize: Platform.OS === "android" ? 11 : 12,
    letterSpacing: 0.1,
  },
  caption: {
    fontFamily: "Geist-Medium",
    fontSize: Platform.OS === "android" ? 11 : 12,
  },
};
