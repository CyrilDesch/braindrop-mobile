import * as SecureStore from "expo-secure-store";
import { capturePrettyException } from "../sentry/config";

const DEVICE_ID_KEY = "device_id";

/**
 * Generates a unique device ID using crypto.randomUUID if available,
 * or falls back to a timestamp-based UUID v4-like format
 */
function generateDeviceId(): string {
  // Use crypto.randomUUID if available (modern environments)
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback to manual UUID v4 generation
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Gets the device ID from secure storage or generates a new one if it doesn't exist
 */
export async function getDeviceId(): Promise<string> {
  try {
    // Try to get existing device ID from secure storage
    const existingDeviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);

    if (existingDeviceId) {
      return existingDeviceId;
    }

    // Generate a new device ID if none exists
    const newDeviceId = generateDeviceId();

    // Store it securely
    await SecureStore.setItemAsync(DEVICE_ID_KEY, newDeviceId);

    return newDeviceId;
  } catch (error) {
    capturePrettyException("Error getting/generating device ID", error);

    // Fallback: generate a new ID but don't store it if storage fails
    return generateDeviceId();
  }
}

/**
 * Manually set a device ID (useful for testing or migration)
 */
export async function setDeviceId(deviceId: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
  } catch (error) {
    capturePrettyException("Error setting device ID", error);
    throw error;
  }
}

/**
 * Clear the stored device ID (useful for testing or reset)
 */
export async function clearDeviceId(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(DEVICE_ID_KEY);
  } catch (error) {
    capturePrettyException("Error clearing device ID", error);
    throw error;
  }
}
