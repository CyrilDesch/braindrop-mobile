import axios from "axios";
import { Platform } from "react-native";
import * as Device from "expo-device";

export const baseURL =
  process.env.NODE_ENV === "development" && !Device.isDevice
    ? Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_LOCAL_API_HOST_ANDROID
      : process.env.EXPO_PUBLIC_LOCAL_API_HOST
    : process.env.EXPO_PUBLIC_API_HOST;

export const apiClient = axios.create({
  baseURL,
  url: "/",
  headers: {
    "ngrok-skip-browser-warning": "flop",
  },
  timeout: 15000,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default apiClient;
