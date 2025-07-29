import { useContext } from "react";
import { EmbeddingContext } from "../context/EmbeddingContextDef";

export function useEmbedding() {
  const context = useContext(EmbeddingContext);
  if (context === undefined) {
    throw new Error("useEmbedding must be used within an EmbeddingProvider");
  }
  return context;
}
