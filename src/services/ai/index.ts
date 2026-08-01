import { buildGenerationPrompt, buildRegenerationPrompt } from "../../prompts/buildPrompt";
import type {
  GenerationMeta,
  PostFormData,
  PostVariant,
  ProviderId,
  ProviderSettings,
} from "../../types";
import { REQUEST_TIMEOUT_MS } from "../../utils/constants";
import { estimateCostUsd } from "../../utils/tokens";
import { parseVariants } from "../../utils/parseVariants";
import { AppError, toAppError } from "../errors";
import { anthropicProvider } from "./anthropicProvider";
import { openaiProvider } from "./openaiProvider";
import type { AIProvider } from "./types";

const REGISTRY: Record<ProviderId, AIProvider> = {
  anthropic: anthropicProvider,
  openai: openaiProvider,
};

export function getProvider(id: ProviderId): AIProvider {
  return REGISTRY[id];
}

export function resolveCredentials(settings: ProviderSettings): {
  provider: AIProvider;
  apiKey: string;
  model: string;
} {
  const apiKey =
    settings.provider === "anthropic" ? settings.anthropicKey : settings.openaiKey;
  const model =
    settings.provider === "anthropic" ? settings.anthropicModel : settings.openaiModel;

  if (!apiKey.trim()) throw new AppError("NO_API_KEY");

  return { provider: getProvider(settings.provider), apiKey: apiKey.trim(), model };
}

export interface GenerationOutcome {
  variants: PostVariant[];
  meta: GenerationMeta;
}

/** Wraps a provider call with an abort-based timeout so a hung request cannot block the UI. */
async function callWithTimeout(
  provider: AIProvider,
  args: { system: string; user: string; model: string; apiKey: string; maxTokens: number },
) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await provider.complete({
      ...args,
      temperature: 0.9,
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timer);
  }
}

function maxTokensFor(variantCount: number): number {
  return Math.min(4096, 600 + variantCount * 500);
}

export async function generatePosts(
  form: PostFormData,
  settings: ProviderSettings,
): Promise<GenerationOutcome> {
  const { provider, apiKey, model } = resolveCredentials(settings);
  const { system, user } = buildGenerationPrompt(form);
  const startedAt = performance.now();

  try {
    const response = await callWithTimeout(provider, {
      system,
      user,
      model,
      apiKey,
      maxTokens: maxTokensFor(form.variantCount),
    });

    const variants = parseVariants(response.text, form.hashtags);
    if (variants.length === 0) throw new AppError("INVALID_RESPONSE");

    const meta: GenerationMeta = {
      provider: provider.id,
      model,
      usage: response.usage,
      estimatedCostUsd: estimateCostUsd(provider.id, model, response.usage),
      durationMs: Math.round(performance.now() - startedAt),
    };

    return { variants: variants.slice(0, form.variantCount), meta };
  } catch (error) {
    throw toAppError(error);
  }
}

export async function regenerateSingle(
  form: PostFormData,
  settings: ProviderSettings,
  existingTexts: string[],
): Promise<{ variant: PostVariant; meta: GenerationMeta }> {
  const { provider, apiKey, model } = resolveCredentials(settings);
  const { system, user } = buildRegenerationPrompt(form, existingTexts);
  const startedAt = performance.now();

  try {
    const response = await callWithTimeout(provider, {
      system,
      user,
      model,
      apiKey,
      maxTokens: maxTokensFor(1),
    });

    const variants = parseVariants(response.text, form.hashtags);
    const variant = variants[0];
    if (!variant) throw new AppError("INVALID_RESPONSE");

    const meta: GenerationMeta = {
      provider: provider.id,
      model,
      usage: response.usage,
      estimatedCostUsd: estimateCostUsd(provider.id, model, response.usage),
      durationMs: Math.round(performance.now() - startedAt),
    };

    return { variant, meta };
  } catch (error) {
    throw toAppError(error);
  }
}
