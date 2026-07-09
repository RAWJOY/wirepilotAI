// This file is the "brain connector" — it sends the user's idea to
// Claude and asks for a structured product plan back as JSON.

export type GeneratedPlan = {
  summary: string;
  problem_statement: string;
  goals: string[];
  personas: {
    name: string;
    role: string;
    goals: string[];
    frustrations: string[];
  }[];
};

const SYSTEM_PROMPT = `You are a senior product manager. Given a short product idea from a user, generate a structured product plan.

Respond with ONLY a valid JSON object, no other text, no markdown code fences. The JSON must match exactly this shape:

{
  "summary": "A 2-3 sentence product summary",
  "problem_statement": "A clear paragraph describing the problem this product solves",
  "goals": ["goal 1", "goal 2", "goal 3"],
  "personas": [
    {
      "name": "A realistic first name",
      "role": "Their job title or role, e.g. 'Busy Parent' or 'Startup Founder'",
      "goals": ["what this persona wants"],
      "frustrations": ["what frustrates this persona today"]
    }
  ]
}

Generate exactly 3 goals and exactly 2 personas. Be specific to the idea given, not generic.`;

export async function generateProductPlan(
  idea: string
): Promise<GeneratedPlan> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Product idea: ${idea}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const rawText: string = data.content?.[0]?.text ?? "";

  // The AI sometimes wraps JSON in markdown fences even when told not to.
  // This strips those out just in case, so parsing doesn't fail.
  const cleaned = rawText
    .trim()
    .replace(/^```json/, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();

  let parsed: GeneratedPlan;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("AI returned content that could not be understood as JSON.");
  }

  return parsed;
}
