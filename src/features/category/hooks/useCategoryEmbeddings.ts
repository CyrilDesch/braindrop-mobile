import { useCallback, useEffect, useState } from "react";
import { useEmbedding } from "../../embedding/hooks/useEmbedding";
import { CategoryEmbeddingRepo } from "src/db/repos/categoryRepo";
import { CategoryRepo } from "src/db/repos/categoryRepo";
import { EmbeddingService } from "../../embedding/services/embeddingService";
import { Logger } from "../../../core/logger";

export function useCategoryEmbeddings() {
  const { generateEmbedding, status, startBackgroundInitialization } =
    useEmbedding();
  const [isChecking, setIsChecking] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Note: Initialization is handled by useCategorizeNote to prevent duplicate attempts

  const ensureEmbeddings = useCallback(
    async (force = false) => {
      if (status !== "ready") {
        Logger.debug("Embedding service not ready, skipping embedding check");
        return;
      }

      setIsChecking(true);
      try {
        const categories = await CategoryRepo.list();

        for (const cat of categories) {
          const idStr =
            typeof cat.id === "string"
              ? cat.id
              : Buffer.from(cat.id).toString();

          if (force) {
            await CategoryEmbeddingRepo.clearByCategoryId(idStr);
          }

          const existing = await CategoryEmbeddingRepo.getByCategoryId(idStr);
          if (!existing.length) {
            Logger.debug(`Generating embeddings for category: ${cat.name}`);
            const text = `${cat.name} ${cat.description}`;
            const embeddings = await generateEmbedding(text, "passage");
            await CategoryEmbeddingRepo.insertMany(
              idStr,
              embeddings.map((e) => e.embedding),
            );
          }
        }

        setIsComplete(true);
        Logger.debug("Category embeddings check completed");

        // Test prefix differences to verify the fix
        try {
          await EmbeddingService.testPrefixDifferences();
        } catch (error) {
          Logger.warn("Failed to run prefix test:", error);
        }
      } catch (error) {
        Logger.error("Error ensuring category embeddings:", error);
      } finally {
        setIsChecking(false);
      }
    },
    [status, generateEmbedding],
  );

  useEffect(() => {
    if (status === "ready" && !isComplete && !isChecking) {
      ensureEmbeddings();
    }
  }, [status, isComplete, isChecking, ensureEmbeddings]);

  const forceRegenerateAll = useCallback(async () => {
    if (status !== "ready") {
      Logger.debug("Embedding service not ready, skipping regeneration");
      return;
    }

    Logger.debug(
      "Force regenerating all category embeddings with correct prefixes...",
    );
    await ensureEmbeddings(true);
  }, [status, ensureEmbeddings]);

  return {
    ensureEmbeddings,
    forceRegenerateAll,
    isChecking,
    isComplete,
  };
}
