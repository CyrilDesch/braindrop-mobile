import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "../services/categoryService";
import {
  Category,
  CategorizationResponse,
  NewCategorySuggestion,
} from "../types";
import { capturePrettyException } from "../../../core/sentry/config";
import { UUIDTypes } from "uuid";
import { useEmbedding } from "../../embedding/hooks/useEmbedding";
import { EmbeddingService } from "../../embedding/services/embeddingService";
import { CategoryEmbeddingRepo } from "src/db/repos";
import { NoteEmbeddingRepo } from "src/db/repos";
import { Logger } from "../../../core/logger";

// Optimized configuration based on threshold optimization results
const OPTIMIZED_CONFIG = {
  small: { method: "topk_average", k: 4, threshold: 0.86 },
  medium: { method: "topk_average", k: 4, threshold: 0.86 },
  large: { method: "max_similarity", threshold: 0.86 },
} as const;

type NoteSize = "small" | "medium" | "large";

/**
 * Determine note size based on character count
 * - Small: 1-100 characters (quick thoughts, tags)
 * - Medium: 101-500 characters (paragraph notes)
 * - Large: 501-2000 characters (detailed notes, articles)
 */
function getNoteSize(content: string): NoteSize {
  const length = content.length;
  if (length <= 100) return "small";
  if (length <= 500) return "medium";
  return "large";
}

interface UseCategorizeNoteOptions {
  /** Debounce duration (in ms) before a categorize request is sent */
  debounceMs?: number;
  /** Minimum delay (in ms) between two consecutive categorize requests */
  rateLimitMs?: number;
  /**
   * @deprecated Use optimized thresholds instead. This will be ignored.
   * The system now uses dynamic thresholds based on note size.
   */
  similarityThreshold?: number;
}

interface UseCategorizeNoteReturn {
  /** Debounced & rate‑limited note categorization trigger */
  categorizeNote: (noteContent: string) => void;
  /** Ordered list of category IDs suggested by the API */
  suggestedCategoriesIdsOrder: Category["id"][];
  /** Possible “create new category” suggestion returned by the API */
  newCategorySuggestion: NewCategorySuggestion | null;
  /** Currently selected category ("new" when the suggestion card is picked) */
  selectedCategory: UUIDTypes | "new" | null;
  /** Manually change the selected category */
  setSelectedCategory: (categoryId: UUIDTypes | "new") => void;
  /** Is the categorize mutation loading? */
  isLoading: boolean;
  /** Last categorization error */
  error: Error | null;
  /** Clear ordered category suggestions (keep API data intact) */
  clearOrderSuggestion: () => void;
  /** Clear the new‑category suggestion */
  clearNewCategorySuggestion: () => void;
  /** Insert a category ID to the top of the ordered list and select it */
  unshiftCategory: (categoryId: Category["id"]) => void;
  /** Final ordered array ready for the UI (suggested → remainder → non‑orderable) */
  orderedCategories: Category[];
  /** Has the user manually picked/confirmed a category? */
  hasChosenCategory: boolean;
  setHasChosenCategory: (hasChosen: boolean) => void;
  /** Is the initial fetch of categories still loading? */
  categoriesIsLoading: boolean;
}

export function useCategorizeNote({
  debounceMs = 1000,
  rateLimitMs = 5000,
  similarityThreshold, // Deprecated - ignored in favor of optimized thresholds
}: UseCategorizeNoteOptions = {}): UseCategorizeNoteReturn {
  // Log deprecation warning if old threshold is used
  if (similarityThreshold !== undefined) {
    Logger.warn(
      "similarityThreshold is deprecated. Using optimized thresholds based on note size instead.",
    );
  }
  /** Suggested order coming from the categorization API */
  const [suggestedCategoriesIdsOrder, setSuggestedCategoriesIdsOrder] =
    useState<Category["id"][]>([]);
  /** “Create a new category?” card coming from the categorization API */
  const [newCategorySuggestion, setNewCategorySuggestion] =
    useState<NewCategorySuggestion | null>(null);
  /** Currently highlighted category in the UI */
  const [selectedCategory, setSelectedCategory] = useState<
    UUIDTypes | "new" | null
  >(null);
  /** Whether the user has manually picked a category (prevents auto‑selection) */
  const [hasChosenCategory, setHasChosenCategory] = useState(false);

  /* ------------------------------------------------------------------ *
   * Timers & helpers – debouncing + client‑side rate‑limiting
   * ------------------------------------------------------------------ */
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const rateLimitTimer = useRef<NodeJS.Timeout | null>(null);
  const lastRequestTime = useRef<number>(0);
  const pendingRequest = useRef<string | null>(null);

  /* ------------------------------------------------------------------ *
   * Get categories list (kept in React‑Query cache)
   * ------------------------------------------------------------------ */
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading: categoriesIsLoading } = useQuery<
    Category[],
    Error
  >({
    queryKey: ["categories"],
    queryFn: () =>
      categoryService.getAllCategories().catch((error) => {
        capturePrettyException("Error fetching categories", error);
        throw error;
      }),
    staleTime: 60_000, // 1 min – prevents refetch spam when typing fast
  });

  /* ------------------------------------------------------------------ *
   * Derived value: final ordered list for display
   *   1. API‑suggested order
   *   2. Remaining orderable categories (kept as‑is)
   *   3. Non‑orderable categories (flagged with `orderable === false`)
   * ------------------------------------------------------------------ */
  const orderedCategories = useMemo<Category[]>(() => {
    if (!categories.length) return [];

    const byId = new Map(categories.map((cat) => [cat.id, cat]));

    /** 1. Suggestions (in given order) */
    const suggested = suggestedCategoriesIdsOrder
      .map((id) => byId.get(id))
      .filter(Boolean) as Category[];

    const suggestedSet = new Set(suggested.map((c) => c.id));

    /** 2 & 3. Remaining categories split by `orderable` flag */
    const remaining = categories.filter((c) => !suggestedSet.has(c.id));

    return [...suggested, ...remaining];
  }, [categories, suggestedCategoriesIdsOrder]);

  /* ------------------------------------------------------------------ *
   * Auto‑selection logic (kept in an effect → no side‑effects in memo)
   * ------------------------------------------------------------------ */
  useEffect(() => {
    if (hasChosenCategory || !categories.length) return;

    if (newCategorySuggestion) {
      setSelectedCategory("new");
      return;
    }

    if (suggestedCategoriesIdsOrder.length) {
      setSelectedCategory(suggestedCategoriesIdsOrder[0]);
    } else {
      setSelectedCategory(categories[0].id);
    }
  }, [
    categories,
    newCategorySuggestion,
    suggestedCategoriesIdsOrder,
    hasChosenCategory,
  ]);

  /* ------------------------------------------------------------------ *
   * Categorize mutation (rate‑limited & debounced externally)
   * ------------------------------------------------------------------ */
  const { generateEmbedding, status, startBackgroundInitialization } =
    useEmbedding();

  // Start background initialization when this hook is used
  useEffect(() => {
    if (status === "idle") {
      Logger.debug(
        "Starting background embedding initialization from useCategorizeNote",
      );
      startBackgroundInitialization();
    }
  }, [status, startBackgroundInitialization]);

  const mutation = useMutation<CategorizationResponse, Error, string>({
    mutationFn: async (noteContent) => {
      // 🎯 OPTIMIZED CATEGORIZATION
      // This function now uses machine learning-optimized thresholds and methods:
      // - Small notes (1-100 chars): TopK Average (k=4) with threshold 0.84
      // - Medium notes (101-500 chars): TopK Average (k=4) with threshold 0.83
      // - Large notes (501-2000 chars): Max Similarity with threshold 0.86
      // Results show perfect precision/recall for small and large notes!

      if (!noteContent.trim()) {
        throw new Error("Note content is empty");
      }
      if (status !== "ready") {
        throw new Error("Embedding service not initialized");
      }

      // If no categories exist, only try to get new category suggestion
      if (!categories.length) {
        Logger.debug(
          "No categories available - requesting new category suggestion",
        );
        try {
          const newCategorySuggestion = await categoryService.categorizeNote(
            noteContent,
          );
          Logger.debug("API returned suggestion:", newCategorySuggestion);
          return {
            orderedCategoryIds: [],
            newCategory: newCategorySuggestion,
          };
        } catch (error) {
          Logger.warn("Failed to get new category suggestion:", error);
          throw new Error("Failed to get category suggestion");
        }
      }

      // Générer l'embedding de la note
      const noteEmbeddingArr = await generateEmbedding(noteContent, "query");
      const noteEmbeddings = noteEmbeddingArr.map((result) => result.embedding);
      if (!noteEmbeddings.length) {
        throw new Error("Failed to generate note embedding");
      }

      // Debug: analyser les embeddings de la note
      for (let i = 0; i < Math.min(noteEmbeddings.length, 3); i++) {
        EmbeddingService.debugEmbedding(
          noteEmbeddings[i],
          `Note window ${i + 1}: "${noteContent.slice(0, 50)}..."`,
        );
      }

      // Récupérer tous les embeddings de toutes les catégories
      const allCategoryEmbeddings = await Promise.all(
        categories.map(async (category) => {
          const idStr =
            typeof category.id === "string"
              ? category.id
              : Buffer.from(category.id).toString();
          const embeddings = await CategoryEmbeddingRepo.getByCategoryId(idStr);
          return { category, embeddings };
        }),
      );

      // Récupérer tous les embeddings des notes existantes pour chaque catégorie
      const allNoteEmbeddings = await Promise.all(
        categories.map(async (category) => {
          const idStr =
            typeof category.id === "string"
              ? category.id
              : Buffer.from(category.id).toString();
          const noteEmbeddings = await NoteEmbeddingRepo.getByCategoryId(idStr);
          return { category, noteEmbeddings };
        }),
      );

      // Debug: analyser les embeddings des catégories
      for (const { category, embeddings } of allCategoryEmbeddings) {
        if (embeddings.length > 0) {
          EmbeddingService.debugEmbedding(
            embeddings[0].embedding,
            `Category "${category.name}": "${
              category.description?.slice(0, 30) || "no desc"
            }..."`,
          );
        }
      }

      // 🎯 Use optimized configuration based on note size
      const noteSize = getNoteSize(noteContent);
      const config = OPTIMIZED_CONFIG[noteSize];

      Logger.debug(
        `Note size: ${noteSize} (${noteContent.length} chars) - Using ${config.method} with threshold ${config.threshold}`,
      );

      // 🎯 WEIGHTED SIMILARITY CALCULATION
      // Pondération: 70% category embeddings, 30% existing note embeddings
      const CATEGORY_WEIGHT = 0.7;
      const NOTES_WEIGHT = 0.3;

      let categorySimilarities: { category: Category; similarity: number }[] =
        [];

      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        const categoryEmbeddings = allCategoryEmbeddings[i].embeddings;
        const existingNoteEmbeddings = allNoteEmbeddings[i].noteEmbeddings;

        let totalWeightedSimilarity = 0;
        let totalWeight = 0;

        // Calculate similarity with category embeddings (high weight)
        if (categoryEmbeddings.length > 0) {
          let maxCategorySimilarity = -1;

          for (const newNoteEmb of noteEmbeddings) {
            for (const categoryEmb of categoryEmbeddings) {
              const similarity = EmbeddingService.cosineSimilarity(
                newNoteEmb,
                categoryEmb.embedding,
              );
              maxCategorySimilarity = Math.max(
                maxCategorySimilarity,
                similarity,
              );
            }
          }

          if (maxCategorySimilarity > -1) {
            totalWeightedSimilarity += maxCategorySimilarity * CATEGORY_WEIGHT;
            totalWeight += CATEGORY_WEIGHT;
          }
        }

        // Calculate similarity with existing note embeddings (lower weight)
        if (existingNoteEmbeddings.length > 0) {
          let maxNoteSimilarity = -1;

          for (const newNoteEmb of noteEmbeddings) {
            for (const existingNoteEmb of existingNoteEmbeddings) {
              const similarity = EmbeddingService.cosineSimilarity(
                newNoteEmb,
                existingNoteEmb.embedding,
              );
              maxNoteSimilarity = Math.max(maxNoteSimilarity, similarity);
            }
          }

          if (maxNoteSimilarity > -1) {
            totalWeightedSimilarity += maxNoteSimilarity * NOTES_WEIGHT;
            totalWeight += NOTES_WEIGHT;
          }
        }

        // Calculate final weighted similarity
        const finalSimilarity =
          totalWeight > 0 ? totalWeightedSimilarity / totalWeight : 0;

        categorySimilarities.push({
          category,
          similarity: finalSimilarity,
        });

        Logger.debug(
          `Category "${
            category.name
          }": weighted similarity = ${finalSimilarity.toFixed(4)} (cat: ${
            categoryEmbeddings.length
          } embeds, notes: ${existingNoteEmbeddings.length} embeds)`,
        );
      }

      // Sort by similarity (highest first)
      categorySimilarities.sort((a, b) => b.similarity - a.similarity);

      // If weighted calculation fails or gives no results, use fallback
      if (
        categorySimilarities.length === 0 ||
        categorySimilarities.every((c) => c.similarity === 0)
      ) {
        Logger.debug(
          "Weighted calculation failed, falling back to original method",
        );

        // Préparer les données pour les méthodes de similarité (original code)
        const items = allCategoryEmbeddings.map(({ category, embeddings }) => ({
          id:
            typeof category.id === "string"
              ? category.id
              : Buffer.from(category.id).toString(),
          embeddings: embeddings.map((emb) => emb.embedding),
          category, // Keep reference for later use
        }));

        if (config.method === "max_similarity") {
          // Use max similarity method for large notes
          const maxResults = items.map((item) => {
            let maxSimilarity = -1;

            // Find the maximum similarity across all embeddings
            for (const noteEmb of noteEmbeddings) {
              for (const categoryEmb of item.embeddings) {
                const similarity = EmbeddingService.cosineSimilarity(
                  noteEmb,
                  categoryEmb,
                );
                maxSimilarity = Math.max(maxSimilarity, similarity);
              }
            }

            return {
              category: item.category,
              similarity: maxSimilarity > -1 ? maxSimilarity : 0,
            };
          });

          categorySimilarities = maxResults;
        } else {
          // Use TopK average method (default for small/medium notes)
          const topKResults = EmbeddingService.findMostSimilarTopK(
            noteEmbeddings,
            items,
            config.k || 4,
          );

          categorySimilarities = topKResults.map((result) => {
            const category = items.find(
              (item) => item.id === result.id,
            )?.category;
            if (!category)
              throw new Error(`Category not found for id: ${result.id}`);

            return {
              category,
              similarity: result.similarity,
            };
          });
        }

        // Sort again after fallback
        categorySimilarities.sort((a, b) => b.similarity - a.similarity);
      }

      // Debug: afficher toutes les similarités
      Logger.debug(
        `All Similarities (${config.method}):`,
        categorySimilarities.map(
          ({ category, similarity }) =>
            `${category.name}: ${similarity.toFixed(4)}`,
        ),
      );

      // Trier les catégories par similarité décroissante
      const sortedCategories = categorySimilarities
        .sort((a, b) => b.similarity - a.similarity)
        .map((item) => item.category);
      // Retourner l'ordre des IDs
      const orderedCategoryIds = sortedCategories.map(
        (category) => category.id,
      );

      Logger.debug("bestSimilarity", categorySimilarities);

      // Vérifier si la meilleure similarité est en dessous du seuil optimisé
      const bestSimilarity = categorySimilarities[0]?.similarity ?? -Infinity;
      Logger.debug(
        `Best similarity: ${bestSimilarity.toFixed(4)} vs threshold: ${
          config.threshold
        } (${noteSize} note)`,
      );
      let newCategorySuggestion: NewCategorySuggestion | undefined = undefined;

      if (bestSimilarity < config.threshold) {
        try {
          // Appeler l'API pour suggérer une nouvelle catégorie
          Logger.debug(
            `Similarity ${bestSimilarity.toFixed(4)} < threshold ${
              config.threshold
            } - suggesting new category`,
          );
          newCategorySuggestion = await categoryService.categorizeNote(
            noteContent,
          );
          Logger.debug("API returned suggestion:", newCategorySuggestion);
        } catch (error) {
          Logger.warn("Failed to get new category suggestion:", error);
          // On continue sans suggestion de nouvelle catégorie
        }
      }

      const result = {
        orderedCategoryIds,
        newCategory: newCategorySuggestion,
      };
      Logger.debug("Returning result:", result);
      return result;
    },
    onSuccess: (data) => {
      setSuggestedCategoriesIdsOrder(data.orderedCategoryIds);

      // Corriger l'extraction de newCategorySuggestion
      let suggestion: NewCategorySuggestion | null = null;
      if (data.newCategory) {
        // Si data.newCategory a une propriété newCategory imbriquée, l'extraire
        if (
          "newCategory" in data.newCategory &&
          typeof data.newCategory.newCategory === "object"
        ) {
          suggestion = data.newCategory.newCategory as NewCategorySuggestion;
        } else {
          // Sinon utiliser directement data.newCategory
          suggestion = data.newCategory as NewCategorySuggestion;
        }
      }

      setNewCategorySuggestion(suggestion);
      Logger.debug("Set newCategorySuggestion to:", suggestion);
      setHasChosenCategory(false); // allow auto‑selection again
    },
    onError: (error) => {
      Logger.debug("error", error);
      if (
        error.message !== "No categories loaded yet" &&
        error.message !== "Note content is empty" &&
        error.message !== "Embedding service not initialized" &&
        error.message !== "Failed to get category suggestion"
      ) {
        capturePrettyException("Error in note categorization", error);
      }
      setSuggestedCategoriesIdsOrder([]);
      setNewCategorySuggestion(null);
    },
  });

  /* ------------------------------------------------------------------ *
   * Helpers
   * ------------------------------------------------------------------ */
  const executeRequest = useCallback(
    (noteContent: string) => {
      lastRequestTime.current = Date.now();
      mutation.mutate(noteContent);
    },
    [mutation],
  );

  /** Rate‑limiting wrapper around the actual request */
  const handleRateLimitedRequest = useCallback(
    (noteContent: string) => {
      const now = Date.now();
      const timeSinceLast = now - lastRequestTime.current;

      if (timeSinceLast >= rateLimitMs) {
        executeRequest(noteContent);
        return;
      }

      pendingRequest.current = noteContent;

      // Restart the rate‑limit timer for the remaining time
      if (rateLimitTimer.current) clearTimeout(rateLimitTimer.current);

      rateLimitTimer.current = setTimeout(() => {
        if (pendingRequest.current) {
          executeRequest(pendingRequest.current);
          pendingRequest.current = null;
        }
      }, rateLimitMs - timeSinceLast);
    },
    [executeRequest, rateLimitMs],
  );

  /** Public API – debounced wrapper */
  const categorizeNote = useCallback(
    (noteContent: string) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      if (!noteContent.trim()) {
        setSuggestedCategoriesIdsOrder([]);
        setNewCategorySuggestion(null);
        return;
      }

      debounceTimer.current = setTimeout(() => {
        handleRateLimitedRequest(noteContent);
      }, debounceMs);
    },
    [debounceMs, handleRateLimitedRequest],
  );

  /** Remove the ordered suggestions (typically when the user clears input) */
  const clearOrderSuggestion = useCallback(() => {
    setSuggestedCategoriesIdsOrder([]);
  }, []);

  /** Remove the new‑category suggestion card */
  const clearNewCategorySuggestion = useCallback(() => {
    setNewCategorySuggestion(null);
  }, []);

  /**
   * Insert a category at the top of the suggested list & select it.
   * Handy right after a new category is created so the UI feels instant.
   */
  const unshiftCategory = useCallback((categoryId: Category["id"]) => {
    setSuggestedCategoriesIdsOrder((prev) => {
      const cleaned = prev.filter((id) => id !== categoryId);
      return [categoryId, ...cleaned];
    });

    setSelectedCategory(categoryId);
    setHasChosenCategory(true);
    setNewCategorySuggestion(null);
  }, []);

  /* ------------------------------------------------------------------ *
   * Cleanup (unmount)
   * ------------------------------------------------------------------ */
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (rateLimitTimer.current) clearTimeout(rateLimitTimer.current);
    };
  }, []);

  /* ------------------------------------------------------------------ *
   * Public API
   * ------------------------------------------------------------------ */
  return {
    categorizeNote,
    suggestedCategoriesIdsOrder,
    newCategorySuggestion,
    selectedCategory,
    setSelectedCategory,
    isLoading: mutation.isPending,
    error: mutation.error ?? null,
    clearOrderSuggestion,
    clearNewCategorySuggestion,
    unshiftCategory,
    orderedCategories,
    hasChosenCategory,
    setHasChosenCategory,
    categoriesIsLoading,
  };
}
