import { InferenceSession, Tensor } from "onnxruntime-react-native";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import { capturePrettyException } from "../../../core/sentry/config";
import { onnxTokenizerService } from "./onnxTokenizerService";
import { Logger } from "../../../core/logger";

export interface EmbeddingResult {
  embedding: number[];
  modelName: string;
  timestamp: number;
}

export class EmbeddingService {
  private static instance: EmbeddingService;

  private session: InferenceSession | null = null;

  private readonly modelName = "e5_int8.with_runtime_opt.ort";
  private readonly maxLength = 512; // Updated to match tokenizer

  private initialisePromise: Promise<void> | null = null;

  // Permanent cache paths for downloaded models
  private static readonly MODEL_CACHE_DIR = `${FileSystem.documentDirectory}models/`;
  private static readonly MODEL_FILE_PATH = `${FileSystem.documentDirectory}models/e5_int8.with_runtime_opt.ort`;

  private constructor() {}

  public static getInstance(): EmbeddingService {
    if (!EmbeddingService.instance) {
      EmbeddingService.instance = new EmbeddingService();
    }
    return EmbeddingService.instance;
  }

  public get ready(): boolean {
    return !!this.session && onnxTokenizerService.ready;
  }

  /**
   * Get cache information
   */
  public static async getCacheInfo(): Promise<{
    totalSize: number;
    modelExists: boolean;
  }> {
    try {
      const modelInfo = await FileSystem.getInfoAsync(
        EmbeddingService.MODEL_FILE_PATH,
      );

      const totalSize = modelInfo.exists ? modelInfo.size || 0 : 0;

      return {
        totalSize,
        modelExists: modelInfo.exists,
      };
    } catch (error) {
      Logger.warn("Failed to get cache info:", error);
      return { totalSize: 0, modelExists: false };
    }
  }

  /**
   * Clear the model cache (useful for debugging or freeing space)
   */
  public static async clearCache(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(
        EmbeddingService.MODEL_CACHE_DIR,
      );
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(EmbeddingService.MODEL_CACHE_DIR, {
          idempotent: true,
        });
        Logger.debug("Model cache cleared");
      }
    } catch (error) {
      Logger.warn("Failed to clear cache:", error);
    }
  }

  /**
   * Ensure models are cached locally and return their file paths
   */
  private async ensureModelsAreCached(): Promise<{ modelPath: string }> {
    // Create cache directory if it doesn't exist
    const dirInfo = await FileSystem.getInfoAsync(
      EmbeddingService.MODEL_CACHE_DIR,
    );
    if (!dirInfo.exists) {
      Logger.debug("Creating models cache directory...");
      await FileSystem.makeDirectoryAsync(EmbeddingService.MODEL_CACHE_DIR, {
        intermediates: true,
      });
    }

    // Check if model file exists in cache
    const modelInfo = await FileSystem.getInfoAsync(
      EmbeddingService.MODEL_FILE_PATH,
    );

    let modelPath = EmbeddingService.MODEL_FILE_PATH;

    // Download model if not cached
    if (!modelInfo.exists) {
      Logger.debug("Model not cached, downloading from bundle...");
      const downloadStartTime = Date.now();

      const modelAsset = Asset.fromModule(
        require("../../../../assets/models/e5_int8.with_runtime_opt.ort"),
      );

      if (!modelAsset.downloaded) {
        await modelAsset.downloadAsync();
      }

      if (!modelAsset.localUri) {
        throw new Error("Model asset has no localUri");
      }

      // Copy from temp location to permanent cache
      await FileSystem.copyAsync({
        from: modelAsset.localUri,
        to: EmbeddingService.MODEL_FILE_PATH,
      });

      Logger.debug(
        `Model cached permanently in ${Date.now() - downloadStartTime}ms`,
      );
    } else {
      Logger.debug("Using cached model file");
    }

    return { modelPath };
  }

  /**
   * Initialise ONNX session + ONNX tokenizer.
   */
  public async initialise(): Promise<void> {
    if (this.ready) return;
    if (this.initialisePromise) return this.initialisePromise;

    this.initialisePromise = (async () => {
      try {
        const startTime = Date.now();
        Logger.debug("Starting ONNX Runtime initialization...");

        // 1. Ensure model is cached permanently --------------------------------
        const { modelPath } = await this.ensureModelsAreCached();

        const providers =
          Platform.OS === "android"
            ? ["nnapi", "cpu"]
            : Platform.OS === "ios"
            ? ["coreml", "cpu"]
            : ["cpu"];

        Logger.debug(
          `Platform: ${Platform.OS}, trying providers: ${providers.join(", ")}`,
        );

        const sessionStartTime = Date.now();
        this.session = await InferenceSession.create(modelPath, {
          executionProviders: providers as unknown as string[],
          graphOptimizationLevel: "all",
          enableCpuMemArena: true,
          enableMemPattern: true,
        });

        Logger.debug(
          `ONNX Session created in ${Date.now() - sessionStartTime}ms`,
        );
        Logger.debug(`Execution providers configured: ${providers.join(", ")}`);

        // 2. Initialize ONNX Tokenizer -----------------------------------------
        Logger.debug("Initializing ONNX tokenizer...");
        const tokenizerStartTime = Date.now();

        await onnxTokenizerService.initialise();

        Logger.debug(
          `ONNX tokenizer initialized in ${Date.now() - tokenizerStartTime}ms`,
        );

        // Test a small inference to verify everything works
        try {
          const testResult = await this.generateEmbedding("test", "query");
          Logger.debug(
            `Test inference successful - generated embedding of length ${testResult[0].embedding.length}`,
          );
        } catch (error) {
          Logger.warn(
            "Test inference failed (this can be normal during initialization):",
            error,
          );
        }

        const totalTime = Date.now() - startTime;
        Logger.debug(`Embedding service fully initialized in ${totalTime}ms`);
        Logger.debug(`Model: ${this.modelName} (${Platform.OS} platform)`);
      } catch (e) {
        Logger.error("Failed to initialize EmbeddingService:", e);
        capturePrettyException("Failed to initialise EmbeddingService", e);
        throw e;
      }
    })();

    return this.initialisePromise;
  }

  // --------------------------------------------------------------------
  // Public helpers
  // --------------------------------------------------------------------

  public async generateEmbedding(
    text: string,
    kind: "query" | "passage" = "query",
  ): Promise<EmbeddingResult[]> {
    if (!this.ready) await this.initialise();

    // Use ONNX tokenizer to get input_ids and attention_mask
    const { input_ids, attention_mask } =
      await onnxTokenizerService.tokenizeSingle(text, kind);

    // Add token_type_ids (all zeros for single sequence)
    const [B, L] = input_ids.dims!;
    const tokenTypeIds = new BigInt64Array(B * L).fill(0n);
    const token_type_ids = new Tensor("int64", tokenTypeIds, [B, L]);

    const feeds = {
      input_ids,
      attention_mask,
      token_type_ids,
    };

    const output = await this.session!.run(feeds);
    const embeddings = this.extractEmbeddings(output, attention_mask);

    return embeddings.map((e) => ({
      embedding: e,
      modelName: this.modelName,
      timestamp: Date.now(),
    }));
  }

  public async generateEmbeddings(
    texts: string[],
    kind: "query" | "passage" = "query",
  ): Promise<EmbeddingResult[][]> {
    if (!this.ready) await this.initialise();

    // For batch processing, we could optimize by tokenizing all texts at once
    // But for now, let's process them individually for simplicity
    const results: EmbeddingResult[][] = [];
    for (const text of texts) {
      results.push(await this.generateEmbedding(text, kind));
    }
    return results;
  }

  // --------------------------------------------------------------------
  // Internal helpers
  // --------------------------------------------------------------------

  /**
   * Extract embeddings from ONNX output, handling both sentence embeddings and token embeddings
   */
  private extractEmbeddings(
    outputs: InferenceSession.OnnxValueMapType,
    attentionMask: Tensor,
  ): number[][] {
    // Check if we have pre-computed sentence embeddings
    const sentenceEmbedding = outputs["sentence_embedding"] as Tensor;
    if (sentenceEmbedding) {
      const [B, H] = sentenceEmbedding.dims!;
      const data = sentenceEmbedding.data as Float32Array;
      const results: number[][] = [];

      for (let b = 0; b < B; b++) {
        const embedding = Array.from(data.subarray(b * H, (b + 1) * H));
        results.push(this.l2Norm(new Float32Array(embedding)));
      }

      return results;
    }

    // Fallback: mean-pool token embeddings with mask, then L2-normalize
    const tokenEmbeddings = this.pickFirstTensor(outputs);
    const [B, L, H] = tokenEmbeddings.dims!;
    const embData = tokenEmbeddings.data as Float32Array;
    const maskData = attentionMask.data as BigInt64Array;

    const results: number[][] = [];

    for (let b = 0; b < B; b++) {
      const embedding = new Float32Array(H);
      let tokenCount = 0;

      // Mean pooling over valid tokens
      for (let l = 0; l < L; l++) {
        if (maskData[b * L + l] === 1n) {
          tokenCount++;
          const tokenOffset = (b * L + l) * H;
          for (let h = 0; h < H; h++) {
            embedding[h] += embData[tokenOffset + h];
          }
        }
      }

      if (tokenCount > 0) {
        for (let h = 0; h < H; h++) {
          embedding[h] /= tokenCount;
        }
      }

      results.push(this.l2Norm(embedding));
    }

    return results;
  }

  private pickFirstTensor(outputs: InferenceSession.OnnxValueMapType) {
    const first = Object.values(outputs)[0];
    if (!first) throw new Error("No output tensor found");
    return first as import("onnxruntime-react-native").Tensor;
  }

  private l2Norm(src: Float32Array): number[] {
    let norm = 0;
    for (let i = 0; i < src.length; i++) norm += src[i] * src[i];
    norm = Math.sqrt(norm) || 1; // Avoid division by zero
    const dst = new Float32Array(src.length);
    for (let i = 0; i < src.length; i++) dst[i] = src[i] / norm;
    return Array.from(dst);
  }

  // --------------------------------------------------------------------
  // Static utilities
  // --------------------------------------------------------------------

  public static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length)
      throw new Error("Embeddings must have same length");

    // Since embeddings are already L2 normalized, we can use dot product directly
    // This is more efficient and avoids numerical precision issues
    let dot = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
    }

    // For L2 normalized vectors, cosine similarity = dot product
    return dot;
  }

  public static cosineSimilarityWithNorm(a: number[], b: number[]): number {
    if (a.length !== b.length)
      throw new Error("Embeddings must have same length");
    let dot = 0,
      aa = 0,
      bb = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      aa += a[i] * a[i];
      bb += b[i] * b[i];
    }
    const denom = Math.sqrt(aa) * Math.sqrt(bb);
    return denom === 0 ? 0 : dot / denom;
  }

  public static debugEmbedding(
    embedding: number[],
    name: string = "embedding",
  ) {
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    const min = Math.min(...embedding);
    const max = Math.max(...embedding);
    const mean =
      embedding.reduce((sum, val) => sum + val, 0) / embedding.length;

    Logger.debug(`${name}:`, {
      length: embedding.length,
      norm: norm.toFixed(6),
      min: min.toFixed(6),
      max: max.toFixed(6),
      mean: mean.toFixed(6),
      isNormalized: Math.abs(norm - 1) < 0.001,
    });
  }

  public static findMostSimilar(
    query: number[],
    items: Array<{ id: string; embedding: number[] }>,
    topK = 5,
  ) {
    return items
      .map((it) => ({
        id: it.id,
        similarity: EmbeddingService.cosineSimilarity(query, it.embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Find most similar items using Top-K Average similarity for multi-vector documents
   * This is the community best practice for whole-document classification
   */
  public static findMostSimilarTopK(
    queryEmbeddings: number[][],
    items: Array<{ id: string; embeddings: number[][] }>,
    topK = 5,
    topKSimilarities = 4,
  ) {
    return items
      .map((item) => {
        const similarities: number[] = [];

        // Compare each query embedding with each item embedding
        for (const queryEmb of queryEmbeddings) {
          for (const itemEmb of item.embeddings) {
            const sim = EmbeddingService.cosineSimilarity(queryEmb, itemEmb);
            similarities.push(sim);
          }
        }

        // Sort similarities in descending order and take top-K average
        similarities.sort((a, b) => b - a);
        const k = Math.min(topKSimilarities, similarities.length);
        const avgTopK =
          similarities.slice(0, k).reduce((sum, sim) => sum + sim, 0) / k;

        return {
          id: item.id,
          similarity: avgTopK,
          totalComparisons: similarities.length,
          topKUsed: k,
        };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Test method to verify prefix differences are working correctly
   */
  public static async testPrefixDifferences(): Promise<void> {
    const service = EmbeddingService.getInstance();
    await service.initialise();

    // Test with same text, different prefixes
    const queryEmbedding = await service.generateEmbedding(
      "le chat est sur le canapé",
      "query",
    );
    const passageEmbedding = await service.generateEmbedding(
      "le chat est sur le canapé",
      "passage",
    );

    // Test with different text, same prefix
    const queryEmbedding2 = await service.generateEmbedding(
      "quantum field theory",
      "query",
    );

    // Test similarities
    const sameTextDiffPrefix = EmbeddingService.cosineSimilarity(
      queryEmbedding[0].embedding,
      passageEmbedding[0].embedding,
    );

    const diffTextSamePrefix = EmbeddingService.cosineSimilarity(
      queryEmbedding[0].embedding,
      queryEmbedding2[0].embedding,
    );

    Logger.debug("Prefix Test Results:");
    Logger.debug(
      `Same text, different prefixes: ${sameTextDiffPrefix.toFixed(4)}`,
    );
    Logger.debug(
      `Different text, same prefix: ${diffTextSamePrefix.toFixed(4)}`,
    );

    // Expected behavior: same text with different prefixes should be higher than different text with same prefix
    if (sameTextDiffPrefix > diffTextSamePrefix) {
      Logger.debug("Prefix differences are working correctly");
      Logger.debug(
        `   Same text, different prefixes (${sameTextDiffPrefix.toFixed(
          4,
        )}) > Different text, same prefix (${diffTextSamePrefix.toFixed(4)})`,
      );
    } else {
      Logger.warn("Prefix differences may not be working as expected");
      Logger.debug(
        `   Same text, different prefixes (${sameTextDiffPrefix.toFixed(
          4,
        )}) <= Different text, same prefix (${diffTextSamePrefix.toFixed(4)})`,
      );
    }
  }
}

export const embeddingService = EmbeddingService.getInstance();
