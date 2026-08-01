export type Platform = "facebook" | "instagram" | "linkedin" | "x" | "tiktok";

export type Tone =
  | "profesional"
  | "prietenos"
  | "amuzant"
  | "inspirant"
  | "comercial"
  | "informativ";

export type Length = "scurta" | "medie" | "lunga";

export type LanguageCode = "ro" | "en" | "de" | "fr" | "es" | "it";

export type TemplateId =
  | "liber"
  | "promotie"
  | "lansare"
  | "testimonial"
  | "oferta"
  | "eveniment"
  | "sfaturi"
  | "behind_the_scenes";

export type ProviderId = "anthropic" | "openai";

export interface PostFormData {
  product: string;
  description: string;
  theme: string;
  platform: Platform;
  tone: Tone;
  audience: string;
  cta: string;
  variantCount: number;
  length: Length;
  emoji: boolean;
  hashtags: boolean;
  language: LanguageCode;
  template: TemplateId;
}

export interface PostVariant {
  id: string;
  text: string;
  hashtags: string[];
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface GenerationMeta {
  provider: ProviderId;
  model: string;
  usage: TokenUsage;
  estimatedCostUsd: number;
  durationMs: number;
}

export interface HistoryEntry {
  id: string;
  createdAt: number;
  form: PostFormData;
  variants: PostVariant[];
  meta: GenerationMeta;
}

export interface ProviderSettings {
  anthropicKey: string;
  openaiKey: string;
  provider: ProviderId;
  anthropicModel: string;
  openaiModel: string;
}

export type Theme = "light" | "dark";
