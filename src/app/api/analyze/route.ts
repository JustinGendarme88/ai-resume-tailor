import { NextResponse } from "next/server";

import { getAnalysisProvider } from "@/lib/ai";
import { analysisResultSchema, analyzeRequestSchema } from "@/lib/validators/analyze";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsedRequest = analyzeRequestSchema.safeParse(body);

  if (!parsedRequest.success) {
    return NextResponse.json(
      {
        error: "Validation failed.",
        details: parsedRequest.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const provider = getAnalysisProvider();
    const result = await provider.analyze(
      parsedRequest.data.resume,
      parsedRequest.data.jobDescription,
    );
    const parsedResult = analysisResultSchema.safeParse(result);

    if (!parsedResult.success) {
      return NextResponse.json(
        { error: "Analysis provider returned an invalid response." },
        { status: 500 },
      );
    }

    return NextResponse.json(parsedResult.data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Analysis failed unexpectedly.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
