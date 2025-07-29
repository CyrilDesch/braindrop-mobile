import React, { ReactNode, useState, useCallback, useRef } from "react";
import {
  embeddingService,
  EmbeddingService,
} from "../services/embeddingService";
import { EmbeddingContext, type Status } from "./EmbeddingContextDef";
import { EmbeddingResult } from "../services/embeddingService";
import { Logger } from "../../../core/logger";

interface EmbeddingProviderProps {
  children: ReactNode;
}

export function EmbeddingProvider({ children }: EmbeddingProviderProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const initializationRef = useRef<Promise<void> | null>(null);

  const MAX_RETRIES = 3;

  // Retry initialization with exponential backoff
  const retry = useCallback(async (): Promise<void> => {
    if (retryCount >= MAX_RETRIES) {
      throw new Error(`Failed to initialize after ${MAX_RETRIES} attempts`);
    }

    const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
    Logger.debug(
      `Retrying embedding initialization in ${delay}ms (attempt ${
        retryCount + 1
      }/${MAX_RETRIES})`,
    );

    await new Promise((resolve) => setTimeout(resolve, delay));
    setRetryCount((prev) => prev + 1);

    return ensureInitialized();
  }, [retryCount]);

  // Lazy initialization function that can be called when needed
  const ensureInitialized = useCallback(async (): Promise<void> => {
    if (embeddingService.ready) {
      if (status !== "ready") {
        setStatus("ready");
        setRetryCount(0); // Reset retry count on success
      }
      return;
    }

    // If already initializing, return the existing promise
    if (initializationRef.current) {
      return initializationRef.current;
    }

    // Start initialization
    Logger.debug("Initializing embedding service...");

    // Log cache info for debugging
    try {
      const cacheInfo = await EmbeddingService.getCacheInfo();
      const sizeMB = (cacheInfo.totalSize / (1024 * 1024)).toFixed(1);
      Logger.debug(
        `Cache status: ${sizeMB}MB, Model: ${
          cacheInfo.modelExists ? "OK" : "Missing"
        }`,
      );
    } catch (error) {
      Logger.warn("Could not get cache info:", error);
    }

    setStatus("loading");
    setError(null);

    initializationRef.current = (async () => {
      try {
        await embeddingService.initialise();
        setStatus("ready");
        setRetryCount(0); // Reset retry count on success
        Logger.debug("Embedding service initialized");
      } catch (err) {
        Logger.error("Failed to initialize embedding service:", err);
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        setStatus("error");
        initializationRef.current = null; // Allow retry
        throw error;
      }
    })();

    return initializationRef.current;
  }, [status]);

  // Clear error and reset state
  const clearError = useCallback(() => {
    setError(null);
    setLastError(null);
    setRetryCount(0);
    setStatus("idle");
    initializationRef.current = null;
  }, []);

  // Optional: Start background initialization (non-blocking)
  const startBackgroundInitialization = useCallback(() => {
    if (status === "idle" && !initializationRef.current) {
      // Start initialization in background without waiting
      ensureInitialized().catch(() => {
        // Error already handled in ensureInitialized
      });
    }
  }, [status, ensureInitialized]);

  // Generate single embedding
  const generateEmbedding = useCallback(
    async (
      text: string,
      kind: "query" | "passage" = "query",
    ): Promise<EmbeddingResult[]> => {
      // Ensure service is ready before generating
      await ensureInitialized();

      setIsGenerating(true);
      setLastError(null);

      try {
        const startTime = Date.now();
        const result = await embeddingService.generateEmbedding(text, kind);
        const duration = Date.now() - startTime;

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setLastError(error);
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    [ensureInitialized],
  );

  // Generate multiple embeddings
  const generateEmbeddings = useCallback(
    async (
      texts: string[],
      kind: "query" | "passage" = "query",
    ): Promise<EmbeddingResult[][]> => {
      // Ensure service is ready before generating
      await ensureInitialized();

      setIsGenerating(true);
      setLastError(null);

      try {
        const startTime = Date.now();
        const result = await embeddingService.generateEmbeddings(texts, kind);
        const duration = Date.now() - startTime;

        Logger.debug(`Generated ${texts.length} embeddings in ${duration}ms`);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setLastError(error);
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    [ensureInitialized],
  );

  const contextValue = {
    // Service state
    status,
    error,
    service: embeddingService,
    retryCount,

    // Embedding generation state
    isGenerating,
    lastError,

    // Methods
    generateEmbedding,
    generateEmbeddings,

    // Utility methods
    ensureInitialized,
    startBackgroundInitialization,
    retry,
    clearError,
  };

  return (
    <EmbeddingContext.Provider value={contextValue}>
      {children}
    </EmbeddingContext.Provider>
  );
}
