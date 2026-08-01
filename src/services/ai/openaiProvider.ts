import { AppError, errorFromStatus, toAppError } from "../errors";
import type { AIProvider, CompletionRequest, CompletionResponse } from "./types";

const ENDPOINT = "https://api.openai.com/v1/chat/completions";

interface OpenAIResponse {
  choices?: { message?: { content?: string } }[];
  usage?: { prompt_tokens?: number; completion_tokens?: number };
  error?: { message?: string };
}

export const openaiProvider: AIProvider = {
  id: "openai",

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    if (!request.apiKey) throw new AppError("NO_API_KEY");

    let response: Response;
    try {
      response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${request.apiKey}`,
        },
        signal: request.signal,
        body: JSON.stringify({
          model: request.model,
          max_tokens: request.maxTokens,
          temperature: request.temperature,
          messages: [
            { role: "system", content: request.system },
            { role: "user", content: request.user },
          ],
        }),
      });
    } catch (error) {
      throw toAppError(error);
    }

    if (!response.ok) {
      const detail = await safeErrorMessage(response);
      throw errorFromStatus(response.status, detail);
    }

    const data = (await response.json()) as OpenAIResponse;
    const text = data.choices?.[0]?.message?.content?.trim() ?? "";

    if (!text) throw new AppError("INVALID_RESPONSE", "Răspuns fără conținut text.");

    return {
      text,
      usage: {
        inputTokens: data.usage?.prompt_tokens ?? 0,
        outputTokens: data.usage?.completion_tokens ?? 0,
      },
    };
  },
};

async function safeErrorMessage(response: Response): Promise<string | undefined> {
  try {
    const body = (await response.json()) as OpenAIResponse;
    return body.error?.message;
  } catch {
    return undefined;
  }
}
