import React, { useEffect, useState, ReactNode } from "react";
import { getDeviceId } from "../utils/deviceId";
import { capturePrettyException } from "../sentry/config";
import { DeviceIdContext, DeviceIdContextType } from "./DeviceIdContextDef";

interface DeviceIdProviderProps {
  children: ReactNode;
}

export function DeviceIdProvider({ children }: DeviceIdProviderProps) {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeDeviceId = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const id = await getDeviceId();

        if (isMounted) {
          setDeviceId(id);
        }
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to get device ID");
        capturePrettyException(
          "Error initializing device ID in provider",
          error,
        );

        if (isMounted) {
          setError(error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeDeviceId();

    return () => {
      isMounted = false;
    };
  }, []);

  const value: DeviceIdContextType = {
    deviceId,
    isLoading,
    error,
    isReady: !isLoading && deviceId !== null,
  };

  return (
    <DeviceIdContext.Provider value={value}>
      {children}
    </DeviceIdContext.Provider>
  );
}
