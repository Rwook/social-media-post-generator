import type { ProviderId, TokenUsage } from "../types";
import { MODELS } from "./constants";

/**
 * Rough client-side estimate used before a request is sent.
 * Romanian text with diacritics tokenizes worse than English, hence ~3.4 chars/token.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.4);
}

export function estimateCostUsd(
  provider: ProviderId,
  modelId: string,
  usage: TokenUsage,
): number {
  const model = MODELS[provider].find((m) => m.id === modelId);
  if (!model) return 0;

  return (
    (usage.inputTokens / 1_000_000) * model.inputPricePerMTok +
    (usage.outputTokens / 1_000_000) * model.outputPricePerMTok
  );
}

export function formatCost(usd: number): string {
  if (usd === 0) return "$0";
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  return `$${usd.toFixed(3)}`;
}
