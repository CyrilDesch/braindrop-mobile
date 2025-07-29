import { createContext } from "react";

export interface DeviceIdContextType {
  deviceId: string | null;
  isLoading: boolean;
  error: Error | null;
  isReady: boolean;
}

export const DeviceIdContext = createContext<DeviceIdContextType | undefined>(
  undefined,
);
