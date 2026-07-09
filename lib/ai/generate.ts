// This file is the "brain connector" — it sends prompts to Claude and
// asks for structured product-management content back as JSON.
// Each function below handles one focused piece of the overall product plan.

// ---- Shared helper: calls Claude and parses its JSON response ----

async function callClaudeForJSON<T>(
  systemPrompt: string,
  userMessage: string
): Promise<T> {
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
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const rawText: string = data.content?.[0]?.text ?? "";

  // The AI sometimes wraps JSON in markdown fences even when told not to.
  const cleaned = rawText
    .trim()
    .replace(/^```json/, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(
      "AI returned content that could not be understood as JSON."
    );
  }
}

// ---- 1. Core plan: Summary, Problem Statement, Goals, Personas ----

export type CorePlan = {
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

const CORE_PLAN_PROMPT = `You are a senior product manager. Given a short product idea from a user, generate a structured product plan.

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

export function generateCorePlan(idea: string): Promise<CorePlan> {
  return callClaudeForJSON<CorePlan>(
    CORE_PLAN_PROMPT,
    `Product idea: ${idea}`
  );
}

// ---- 2. User Flow, Screens, and Wireframe descriptions ----

export type FlowAndScreens = {
  user_flow: string[];
  screens: {
    name: string;
    purpose: string;
    wireframe_elements: string[];
  }[];
};

const FLOW_AND_SCREENS_PROMPT = `You are a senior UX designer. Given a product idea, its summary, and its personas, generate a user flow and a list of screens.

Respond with ONLY a valid JSON object, no other text, no markdown fences, in exactly this shape:

{
  "user_flow": ["Step 1 description", "Step 2 description", "..."],
  "screens": [
    {
      "name": "Screen name, e.g. 'Home Feed'",
      "purpose": "One sentence describing what this screen is for",
      "wireframe_elements": ["Header", "Search bar", "List of items", "Bottom navigation"]
    }
  ]
}

Generate 5-8 user flow steps and 5-8 screens covering the full journey from onboarding to core usage. Keep wireframe_elements simple and low-fidelity (layout blocks, not visual design).`;

export function generateFlowAndScreens(
  idea: string,
  core: CorePlan
): Promise<FlowAndScreens> {
  const context = `Product idea: ${idea}
Summary: ${core.summary}
Personas: ${core.personas.map((p) => `${p.name} (${p.role})`).join(", ")}`;

  return callClaudeForJSON<FlowAndScreens>(FLOW_AND_SCREENS_PROMPT, context);
}

// ---- 3. PRD, User Stories, and Acceptance Criteria ----

export type PRDAndStories = {
  prd: {
    overview: string;
    scope: string;
    requirements: string[];
  };
  user_stories: {
    story: string;
    acceptance_criteria: string[];
  }[];
};

const PRD_AND_STORIES_PROMPT = `You are a senior product manager writing a PRD (Product Requirements Document) and user stories.

Respond with ONLY a valid JSON object, no other text, no markdown fences, in exactly this shape:

{
  "prd": {
    "overview": "A short paragraph overview of the product",
    "scope": "A short paragraph describing what is in scope for the first version",
    "requirements": ["requirement 1", "requirement 2", "..."]
  },
  "user_stories": [
    {
      "story": "As a [persona], I want to [action], so that [benefit]",
      "acceptance_criteria": ["criterion 1", "criterion 2"]
    }
  ]
}

Generate 5-8 requirements and 4-6 user stories, each with 2-3 acceptance criteria. Base the stories on the personas and screens given.`;

export function generatePRDAndStories(
  idea: string,
  core: CorePlan,
  flow: FlowAndScreens
): Promise<PRDAndStories> {
  const context = `Product idea: ${idea}
Summary: ${core.summary}
Goals: ${core.goals.join(", ")}
Personas: ${core.personas.map((p) => `${p.name} (${p.role})`).join(", ")}
Screens: ${flow.screens.map((s) => s.name).join(", ")}`;

  return callClaudeForJSON<PRDAndStories>(PRD_AND_STORIES_PROMPT, context);
}

// ---- 4. Success Metrics ----

export type SuccessMetrics = {
  metrics: {
    name: string;
    description: string;
    target: string;
  }[];
};

const METRICS_PROMPT = `You are a senior product manager defining success metrics for a new product.

Respond with ONLY a valid JSON object, no other text, no markdown fences, in exactly this shape:

{
  "metrics": [
    {
      "name": "Metric name, e.g. 'Activation Rate'",
      "description": "One sentence describing what this measures",
      "target": "A realistic first-version target, e.g. '40% of signups complete onboarding'"
    }
  ]
}

Generate exactly 4 metrics that map directly to the goals given.`;

export function generateSuccessMetrics(
  idea: string,
  core: CorePlan
): Promise<SuccessMetrics> {
  const context = `Product idea: ${idea}
Goals: ${core.goals.join(", ")}`;

  return callClaudeForJSON<SuccessMetrics>(METRICS_PROMPT, context);
}

// ---- 5. Regenerating a single section on its own ----
// Used when a user clicks "Regenerate" on just one part of their plan,
// instead of re-running the whole pipeline.

const SECTION_PROMPTS: Record<
  string,
  { instructions: string; shapeExample: string }
> = {
  summary: {
    instructions: "Write a 2-3 sentence product summary.",
    shapeExample: `{ "text": "..." }`,
  },
  problem_statement: {
    instructions: "Write a clear paragraph describing the problem this product solves.",
    shapeExample: `{ "text": "..." }`,
  },
  goals: {
    instructions: "List exactly 3 product goals.",
    shapeExample: `{ "items": ["goal 1", "goal 2", "goal 3"] }`,
  },
  personas: {
    instructions:
      "Generate exactly 2 user personas, each with a name, role, goals, and frustrations.",
    shapeExample: `{ "items": [{ "name": "...", "role": "...", "goals": ["..."], "frustrations": ["..."] }] }`,
  },
  user_flow: {
    instructions: "List 5-8 steps describing the user's journey through the product.",
    shapeExample: `{ "items": ["Step 1...", "Step 2..."] }`,
  },
  screens: {
    instructions:
      "List 5-8 screens needed, each with a name, purpose, and simple wireframe_elements (layout blocks, not visual design).",
    shapeExample: `{ "items": [{ "name": "...", "purpose": "...", "wireframe_elements": ["Header", "..."] }] }`,
  },
  prd: {
    instructions:
      "Write a PRD with an overview, scope, and 5-8 requirements.",
    shapeExample: `{ "overview": "...", "scope": "...", "requirements": ["..."] }`,
  },
  user_stories: {
    instructions:
      "Generate 4-6 user stories in 'As a [persona], I want to [action], so that [benefit]' format, each with 2-3 acceptance criteria.",
    shapeExample: `{ "items": [{ "story": "...", "acceptance_criteria": ["..."] }] }`,
  },
  metrics: {
    instructions: "Generate exactly 4 success metrics with a name, description, and target.",
    shapeExample: `{ "items": [{ "name": "...", "description": "...", "target": "..." }] }`,
  },
};

export async function generateSingleSection(
  docType: string,
  idea: string,
  contextSummary: string | null
): Promise<unknown> {
  const config = SECTION_PROMPTS[docType];

  if (!config) {
    throw new Error(`Unknown section type: ${docType}`);
  }

  const systemPrompt = `You are a senior product manager. ${config.instructions}

Respond with ONLY a valid JSON object, no other text, no markdown fences, in exactly this shape:

${config.shapeExample}`;

  const userMessage = contextSummary
    ? `Product idea: ${idea}\nProduct summary (for context): ${contextSummary}`
    : `Product idea: ${idea}`;

  return callClaudeForJSON<unknown>(systemPrompt, userMessage);
}
