import type { PostVariant } from "../types";
import { createId } from "./id";

interface RawVariant {
  text?: unknown;
  hashtags?: unknown;
}

/**
 * Models occasionally wrap JSON in prose or code fences despite instructions.
 * We strip fences first, then fall back to the outermost array in the string.
 */
function extractJsonArray(raw: string): string | null {
  const withoutFences = raw
    .replace(/^\s*```(?:json)?/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  if (withoutFences.startsWith("[")) return withoutFences;

  const start = withoutFences.indexOf("[");
  const end = withoutFences.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return null;

  return withoutFences.slice(start, end + 1);
}

function normalizeHashtags(value: unknown): string[] {
  const list = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/[\s,]+/)
      : [];

  return list
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => (item.startsWith("#") ? item : `#${item}`));
}

export function parseVariants(raw: string, keepHashtags: boolean): PostVariant[] {
  const json = extractJsonArray(raw);
  if (!json) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((item): PostVariant | null => {
      const candidate = item as RawVariant;
      const text = typeof candidate.text === "string" ? candidate.text.trim() : "";
      if (!text) return null;

      return {
        id: createId(),
        text,
        hashtags: keepHashtags ? normalizeHashtags(candidate.hashtags) : [],
      };
    })
    .filter((variant): variant is PostVariant => variant !== null);
}
