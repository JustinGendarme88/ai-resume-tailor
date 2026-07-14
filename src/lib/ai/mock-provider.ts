import type { AnalysisProvider, AnalysisResult } from "./types";

const COMMON_SKILLS = [
  "javascript",
  "typescript",
  "react",
  "next.js",
  "node.js",
  "python",
  "java",
  "sql",
  "postgresql",
  "mongodb",
  "aws",
  "azure",
  "docker",
  "kubernetes",
  "git",
  "ci/cd",
  "agile",
  "scrum",
  "rest",
  "graphql",
  "html",
  "css",
  "tailwind",
  "figma",
  "communication",
  "leadership",
  "problem solving",
  "teamwork",
  "project management",
  "data analysis",
  "machine learning",
  "testing",
  "jest",
  "cypress",
  "redux",
  "express",
  "fastapi",
  "django",
  "spring",
  "csharp",
  ".net",
  "go",
  "rust",
  "linux",
  "bash",
  "terraform",
  "microservices",
  "api design",
  "seo",
  "analytics",
];

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "you",
  "your",
  "our",
  "will",
  "are",
  "have",
  "this",
  "that",
  "from",
  "into",
  "about",
  "using",
  "used",
  "able",
  "work",
  "team",
  "role",
  "job",
  "years",
  "year",
  "experience",
  "required",
  "preferred",
  "including",
  "such",
  "other",
  "strong",
  "excellent",
  "good",
  "must",
  "should",
]);

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b),
  );
}

function extractRoleTitle(jobDescription: string): string {
  const firstLine = jobDescription.split(/\r?\n/).find((line) => line.trim());

  if (!firstLine) {
    return "the target role";
  }

  const cleaned = firstLine
    .replace(/^(job title|position|role)\s*:\s*/i, "")
    .trim();

  return cleaned || "the target role";
}

function extractKeywords(jobDescription: string): string[] {
  const normalizedJobDescription = normalizeText(jobDescription);
  const keywords = new Set<string>();

  for (const skill of COMMON_SKILLS) {
    if (normalizedJobDescription.includes(skill)) {
      keywords.add(skill);
    }
  }

  const commaSeparated = jobDescription.match(
    /(?:skills|requirements|qualifications)\s*:\s*([^\n]+)/i,
  );

  if (commaSeparated?.[1]) {
    for (const part of commaSeparated[1].split(/[,;|]/)) {
      const cleaned = part.trim().toLowerCase();
      if (cleaned.length >= 2 && cleaned.length <= 40) {
        keywords.add(cleaned);
      }
    }
  }

  const capitalizedPhrases = jobDescription.match(
    /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\b/g,
  );

  for (const phrase of capitalizedPhrases ?? []) {
    const cleaned = phrase.trim().toLowerCase();
    if (
      cleaned.length >= 3 &&
      cleaned.length <= 40 &&
      !STOP_WORDS.has(cleaned)
    ) {
      keywords.add(cleaned);
    }
  }

  const singleTokens = normalizedJobDescription.match(/\b[a-z][a-z0-9+.#/-]{1,}\b/g);

  for (const token of singleTokens ?? []) {
    if (
      token.length >= 3 &&
      token.length <= 24 &&
      !STOP_WORDS.has(token) &&
      !/^\d+$/.test(token)
    ) {
      keywords.add(token);
    }
  }

  return uniqueSorted([...keywords]).slice(0, 24);
}

function resumeContainsKeyword(resume: string, keyword: string): boolean {
  const normalizedResume = normalizeText(resume);
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`\\b${escapedKeyword.replace(/\s+/g, "\\s+")}\\b`, "i");

  return pattern.test(normalizedResume);
}

function buildRecommendations(
  missingKeywords: string[],
  matchingSkills: string[],
): string[] {
  const recommendations: string[] = [];

  if (missingKeywords.length > 0) {
    recommendations.push(
      `Highlight relevant experience with ${missingKeywords.slice(0, 3).join(", ")} using concrete project examples.`,
    );
  }

  if (matchingSkills.length > 0) {
    recommendations.push(
      `Move matching strengths such as ${matchingSkills.slice(0, 3).join(", ")} closer to the top of your resume summary and most recent role.`,
    );
  }

  recommendations.push(
    "Add measurable outcomes (percentages, revenue, time saved, or team size) to your strongest bullet points.",
  );
  recommendations.push(
    "Mirror key phrases from the job description naturally in your experience section without keyword stuffing.",
  );
  recommendations.push(
    "Tailor your professional summary to emphasize the role's top requirements in the first two sentences.",
  );

  return recommendations;
}

function buildTailoredSummary(
  roleTitle: string,
  matchingSkills: string[],
  missingKeywords: string[],
): string {
  const highlightedSkills =
    matchingSkills.length > 0
      ? matchingSkills.slice(0, 4).join(", ")
      : "relevant technical and professional strengths";

  const growthAreas =
    missingKeywords.length > 0
      ? ` with additional emphasis on ${missingKeywords.slice(0, 2).join(" and ")}`
      : "";

  return [
    `Results-driven professional targeting ${roleTitle}, bringing demonstrated experience across ${highlightedSkills}.`,
    `Known for translating business needs into practical deliverables, collaborating across teams, and improving outcomes through clear communication and ownership.`,
    `Seeking to contribute immediately by aligning proven accomplishments with this role's priorities${growthAreas}.`,
  ].join(" ");
}

function calculateMatchScore(
  matchingSkills: string[],
  keywords: string[],
  resume: string,
  jobDescription: string,
): number {
  if (keywords.length === 0) {
    return resume.length >= 200 && jobDescription.length >= 100 ? 55 : 35;
  }

  const ratio = matchingSkills.length / keywords.length;
  const rawScore = Math.round(ratio * 100);
  return Math.max(0, Math.min(100, rawScore));
}

export class MockAnalysisProvider implements AnalysisProvider {
  readonly name = "mock";

  async analyze(resume: string, jobDescription: string): Promise<AnalysisResult> {
    const keywords = extractKeywords(jobDescription);
    const matchingSkills = keywords.filter((keyword) =>
      resumeContainsKeyword(resume, keyword),
    );
    const missingKeywords = keywords.filter(
      (keyword) => !resumeContainsKeyword(resume, keyword),
    );
    const roleTitle = extractRoleTitle(jobDescription);

    return {
      matchScore: calculateMatchScore(
        matchingSkills,
        keywords,
        resume,
        jobDescription,
      ),
      matchingSkills,
      missingKeywords,
      recommendations: buildRecommendations(missingKeywords, matchingSkills),
      tailoredSummary: buildTailoredSummary(
        roleTitle,
        matchingSkills,
        missingKeywords,
      ),
    };
  }
}
