export interface AnalysisResult {
  matchScore: number;
  matchingSkills: string[];
  missingKeywords: string[];
  recommendations: string[];
  tailoredSummary: string;
}

export interface AnalysisProvider {
  readonly name: string;
  analyze(resume: string, jobDescription: string): Promise<AnalysisResult>;
}
