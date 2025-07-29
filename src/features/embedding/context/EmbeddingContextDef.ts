import { createContext } from "react";
import {
  EmbeddingResult,
  EmbeddingService,
} from "../services/embeddingService";

export type Status = "idle" | "loading" | "ready" | "error";

export interface EmbeddingContextType {
  // Service state
  status: Status;
  error: Error | null;
  service: EmbeddingService;
  retryCount: number;

  // Embedding generation state
  isGenerating: boolean;
  lastError: Error | null;

  // Methods
  generateEmbedding: (
    text: string,
    kind?: "query" | "passage",
  ) => Promise<EmbeddingResult[]>;
  generateEmbeddings: (
    texts: string[],
    kind?: "query" | "passage",
  ) => Promise<EmbeddingResult[][]>;

  // Utility methods
  ensureInitialized: () => Promise<void>;
  startBackgroundInitialization: () => void;
  retry: () => Promise<void>;
  clearError: () => void;
}

export const EmbeddingContext = createContext<EmbeddingContextType | undefined>(
  undefined,
);
