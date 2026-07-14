import { z } from "zod";

export const analyzeRequestSchema = z.object({
  resume: z
    .string()
    .trim()
    .min(100, "Resume must be at least 100 characters."),
  jobDescription: z
    .string()
    .trim()
    .min(50, "Job description must be at least 50 characters."),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

export const analysisResultSchema = z.object({
  matchScore: z.number().int().min(0).max(100),
  matchingSkills: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  recommendations: z.array(z.string()),
  tailoredSummary: z.string(),
});
