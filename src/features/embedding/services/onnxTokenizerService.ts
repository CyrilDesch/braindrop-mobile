import * as ort from "onnxruntime-react-native";
import { Asset } from "expo-asset";
import { Logger } from "../../../core/logger";

// E5 (XLM-R) constants
const PAD_ID = 1;
const MAX_LEN = 512;

// Helper: turn anything (number[] | Int32Array | BigInt64Array) into BigInt64Array
function toBigInt64(a: any): BigInt64Array {
  if (a instanceof BigInt64Array) return a;
  const src: number[] = Array.from(a as ArrayLike<number>);
  const out = new BigInt64Array(src.length);
  for (let i = 0; i < src.length; i++) out[i] = BigInt(src[i] | 0);
  return out;
}

// Pack the tokenizer's row-splits outputs into dense ids/mask
function packRowSplits(
  tokensRaw: Int32Array | BigInt64Array | number[],
  instanceSplitsRaw: BigInt64Array | number[],
  tokenIdxRaw: Int32Array | BigInt64Array | number[],
  batch: number,
  maxLen = MAX_LEN,
  padId = PAD_ID,
) {
  // Shapes:
  // tokens: (N)
  // token_indices: (N)
  // instance_indices: (B+1) with last == N  (row-splits)
  const tokens = toBigInt64(tokensRaw); // (N) as BigInt
  const splits = toBigInt64(instanceSplitsRaw); // (B+1)
  const pos = toBigInt64(tokenIdxRaw); // (N)

  const B = Number(splits.length) - 1;
  if (B !== batch) {
    // Not fatal; use the splits-derived batch
  }

  const ids = new BigInt64Array(B * maxLen).fill(BigInt(padId));
  const mask = new BigInt64Array(B * maxLen); // zeros

  // For each sequence b, fill positions [splits[b], splits[b+1]) into row b
  for (let b = 0; b < B; b++) {
    const start = Number(splits[b]);
    const end = Number(splits[b + 1]);
    for (let i = start; i < end; i++) {
      const t = Number(pos[i]);
      if (t >= 0 && t < maxLen) {
        const off = b * maxLen + t;
        ids[off] = tokens[i];
        mask[off] = 1n;
      }
    }
  }

  // Return ORT tensors (int64)
  return {
    input_ids: new ort.Tensor("int64", ids, [B, maxLen]),
    attention_mask: new ort.Tensor("int64", mask, [B, maxLen]),
  };
}

export interface OnnxTokenizerResult {
  input_ids: ort.Tensor;
  attention_mask: ort.Tensor;
}

export class OnnxTokenizerService {
  private static instance: OnnxTokenizerService;
  private tokenizerSession: ort.InferenceSession | null = null;
  private initialisePromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): OnnxTokenizerService {
    if (!OnnxTokenizerService.instance) {
      OnnxTokenizerService.instance = new OnnxTokenizerService();
    }
    return OnnxTokenizerService.instance;
  }

  public get ready(): boolean {
    return !!this.tokenizerSession;
  }

  /**
   * Initialize the ONNX tokenizer session
   */
  public async initialise(): Promise<void> {
    if (this.ready) return;
    if (this.initialisePromise) return this.initialisePromise;

    this.initialisePromise = (async () => {
      try {
        Logger.debug("Loading ONNX tokenizer...");
        const startTime = Date.now();

        // Load tokenizer asset
        const tokenizerAsset = Asset.fromModule(
          require("../../../../assets/models/tokenizer.onnx"),
        );

        if (!tokenizerAsset.downloaded) {
          await tokenizerAsset.downloadAsync();
        }

        if (!tokenizerAsset.localUri) {
          throw new Error("Tokenizer asset has no localUri");
        }

        // Create tokenizer session (needs Extensions enabled in package.json)
        this.tokenizerSession = await ort.InferenceSession.create(
          tokenizerAsset.localUri,
        );

        const loadTime = Date.now() - startTime;
        Logger.debug(`ONNX tokenizer loaded in ${loadTime}ms`);
      } catch (error) {
        Logger.error("Failed to initialize ONNX tokenizer:", error);
        this.tokenizerSession = null;
        this.initialisePromise = null;
        throw error;
      }
    })();

    return this.initialisePromise;
  }

  /**
   * Tokenize texts using the ONNX tokenizer with E5 prefixes
   */
  public async tokenize(
    texts: string[],
    mode: "query" | "passage" = "query",
  ): Promise<OnnxTokenizerResult> {
    if (!this.ready) {
      await this.initialise();
    }

    if (!this.tokenizerSession) {
      throw new Error("Tokenizer session not initialized");
    }

    // E5 wants the prefix for best quality
    const prefixed = texts.map((t) => `${mode}: ${t}`);

    // Tokenizer input is a string tensor of shape [B]
    const input = new ort.Tensor("string", prefixed, [prefixed.length]);

    try {
      // Run tokenizer: outputs have fixed names from the export
      const tokOut = await this.tokenizerSession.run({ inputs: input });

      const tokens = tokOut["tokens"].data as Int32Array | BigInt64Array;
      const instance_indices = tokOut["instance_indices"].data as
        | BigInt64Array
        | number[];
      const token_indices = tokOut["token_indices"].data as
        | Int32Array
        | BigInt64Array;

      // Pack to ids/mask
      const result = packRowSplits(
        tokens,
        instance_indices,
        token_indices,
        prefixed.length,
        MAX_LEN,
        PAD_ID,
      );

      return result;
    } catch (error) {
      Logger.error("Failed to tokenize with ONNX tokenizer:", error);
      throw error;
    }
  }

  /**
   * Tokenize a single text
   */
  public async tokenizeSingle(
    text: string,
    mode: "query" | "passage" = "query",
  ): Promise<OnnxTokenizerResult> {
    return this.tokenize([text], mode);
  }

  /**
   * Clean up resources
   */
  public async dispose(): Promise<void> {
    if (this.tokenizerSession) {
      await this.tokenizerSession.release();
      this.tokenizerSession = null;
    }
    this.initialisePromise = null;
  }
}

export const onnxTokenizerService = OnnxTokenizerService.getInstance();
