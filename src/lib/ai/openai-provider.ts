import type { AnalysisProvider, AnalysisResult } from "./types";

export class OpenAIAnalysisProvider implements AnalysisProvider {
  readonly name = "openai";

  async analyze(resume: string, jobDescription: string): Promise<AnalysisResult> {
    void resume;
    void jobDescription;

    throw new Error(
      "OpenAI provider is not configured yet. Set OPENAI_API_KEY and implement OpenAIAnalysisProvider.",
    );
  }
}
