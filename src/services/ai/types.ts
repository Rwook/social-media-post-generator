import type { ProviderId, TokenUsage } from "../../types";

export interface CompletionRequest {
  system: string;
  user: string;
  model: string;
  apiKey: string;
  maxTokens: number;
  temperature: number;
  signal: AbortSignal;
}

export interface CompletionResponse {
  text: string;
  usage: TokenUsage;
}

/**
 * Every provider reduces to the same shape: text in, text + usage out.
 * Adding a third provider means implementing this interface and registering it
 * in services/ai/index.ts — nothing in the UI changes.
 */
export interface AIProvider {
  id: ProviderId;
  complete(request: CompletionRequest): Promise<CompletionResponse>;
}
