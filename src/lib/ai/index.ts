import { MockAnalysisProvider } from "./mock-provider";
import { OpenAIAnalysisProvider } from "./openai-provider";
import type { AnalysisProvider } from "./types";

export type AiProviderName = "mock" | "openai";

function resolveProviderName(): AiProviderName {
  const configuredProvider = process.env.AI_PROVIDER?.toLowerCase();

  if (configuredProvider === "openai") {
    return "openai";
  }

  if (configuredProvider === "mock") {
    return "mock";
  }

  return process.env.OPENAI_API_KEY ? "openai" : "mock";
}

export function getAnalysisProvider(): AnalysisProvider {
  const providerName = resolveProviderName();

  if (providerName === "openai") {
    return new OpenAIAnalysisProvider();
  }

  return new MockAnalysisProvider();
}

export function getActiveProviderName(): AiProviderName {
  return resolveProviderName();
}
