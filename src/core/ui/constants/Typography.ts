import { Platform } from "react-native";

export const typography = {
  headline: {
    fontFamily: "Geist-Black",
    fontSize: Platform.OS === "android" ? 68 : 70,
    lineHeight: Platform.OS === "android" ? 68 : 70,
  },
  h1: {
    fontFamily: "Geist-SemiBold",
    fontSize: Platform.OS === "android" ? 30 : 30,
  },
  h2: {
    fontFamily: "Geist-Medium",
    fontSize: Platform.OS === "android" ? 20 : 20,
  },
  h3: {
    fontFamily: "Geist-SemiBold",
    fontSize: Platform.OS === "android" ? 16 : 16,
  },
  h4: {
    fontFamily: "Geist-SemiBold",
    fontSize: Platform.OS === "android" ? 13 : 13,
  },
  body1: {
    fontFamily: "Geist-Regular",
    fontSize: Platform.OS === "android" ? 16 : 16,
  },
  body2: {
    fontFamily: "Geist-Regular",
    fontSize: Platform.OS === "android" ? 12 : 12,
  },
  button: {
    fontFamily: "Geist-SemiBold",
    fontSize: Platform.OS === "android" ? 17 : 17,
  },
  mediumButton: {
    fontFamily: "Geist-Medium",
    fontSize: Platform.OS === "android" ? 15 : 15,
  },
  smallButton: {
    fontFamily: "Geist-Medium",
    fontSize: Platform.OS === "android" ? 12 : 12,
  },
  caption: {
    fontFamily: "Geist-Medium",
    fontSize: Platform.OS === "android" ? 9 : 9,
  },
};
