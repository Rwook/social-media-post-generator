import { AppError, errorFromStatus, toAppError } from "../errors";
import type { AIProvider, CompletionRequest, CompletionResponse } from "./types";

const ENDPOINT = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2023-06-01";

interface AnthropicContentBlock {
  type: string;
  text?: string;
}

interface AnthropicResponse {
  content?: AnthropicContentBlock[];
  usage?: { input_tokens?: number; output_tokens?: number };
  error?: { message?: string };
}

export const anthropicProvider: AIProvider = {
  id: "anthropic",

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    if (!request.apiKey) throw new AppError("NO_API_KEY");

    let response: Response;
    try {
      response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": request.apiKey,
          "anthropic-version": API_VERSION,
          // Required for calls originating directly from a browser.
          "anthropic-dangerous-direct-browser-access": "true",
        },
        signal: request.signal,
        body: JSON.stringify({
          model: request.model,
          max_tokens: request.maxTokens,
          temperature: request.temperature,
          system: request.system,
          messages: [{ role: "user", content: request.user }],
        }),
      });
    } catch (error) {
      throw toAppError(error);
    }

    if (!response.ok) {
      const detail = await safeErrorMessage(response);
      throw errorFromStatus(response.status, detail);
    }

    const data = (await response.json()) as AnthropicResponse;

    const text = (data.content ?? [])
      .filter((block) => block.type === "text" && typeof block.text === "string")
      .map((block) => block.text as string)
      .join("\n")
      .trim();

    if (!text) throw new AppError("INVALID_RESPONSE", "Răspuns fără conținut text.");

    return {
      text,
      usage: {
        inputTokens: data.usage?.input_tokens ?? 0,
        outputTokens: data.usage?.output_tokens ?? 0,
      },
    };
  },
};

async function safeErrorMessage(response: Response): Promise<string | undefined> {
  try {
    const body = (await response.json()) as AnthropicResponse;
    return body.error?.message;
  } catch {
    return undefined;
  }
}
