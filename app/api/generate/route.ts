import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  generateCorePlan,
  generateFlowAndScreens,
  generatePRDAndStories,
  generateSuccessMetrics,
} from "@/lib/ai/generate";

export async function POST(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const { idea } = await request.json();

  if (!idea || typeof idea !== "string" || idea.trim().length < 5) {
    return NextResponse.json(
      { error: "Please describe your idea in a bit more detail." },
      { status: 400 }
    );
  }

  const cleanIdea = idea.trim();
  const title = cleanIdea.slice(0, 80);

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      title,
      original_prompt: cleanIdea,
      status: "generating",
    })
    .select()
    .single();

  if (projectError || !project) {
    return NextResponse.json(
      { error: "Could not create project. Please try again." },
      { status: 500 }
    );
  }

  try {
    // Step 1: Core plan (summary, problem statement, goals, personas).
    // Everything after this uses its output as context, so we run it first.
    const core = await generateCorePlan(cleanIdea);

    // Steps 2 and 3 both only need the core plan, so they can run
    // at the same time to save time.
    const [flow, metrics] = await Promise.all([
      generateFlowAndScreens(cleanIdea, core),
      generateSuccessMetrics(cleanIdea, core),
    ]);

    // Step 4 needs the screens from step 2, so it runs after.
    const prdAndStories = await generatePRDAndStories(cleanIdea, core, flow);

    const rows = [
      { project_id: project.id, doc_type: "summary", content: { text: core.summary } },
      {
        project_id: project.id,
        doc_type: "problem_statement",
        content: { text: core.problem_statement },
      },
      { project_id: project.id, doc_type: "goals", content: { items: core.goals } },
      { project_id: project.id, doc_type: "personas", content: { items: core.personas } },
      { project_id: project.id, doc_type: "user_flow", content: { items: flow.user_flow } },
      { project_id: project.id, doc_type: "screens", content: { items: flow.screens } },
      {
        project_id: project.id,
        doc_type: "prd",
        content: prdAndStories.prd,
      },
      {
        project_id: project.id,
        doc_type: "user_stories",
        content: { items: prdAndStories.user_stories },
      },
      {
        project_id: project.id,
        doc_type: "metrics",
        content: { items: metrics.metrics },
      },
    ];

    const { error: docsError } = await supabase
      .from("product_documents")
      .insert(rows);

    if (docsError) {
      throw new Error(docsError.message);
    }

    await supabase
      .from("projects")
      .update({ status: "ready" })
      .eq("id", project.id);

    return NextResponse.json({ projectId: project.id });
  } catch (err) {
    await supabase
      .from("projects")
      .update({ status: "error" })
      .eq("id", project.id);

    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `AI generation failed: ${message}`, projectId: project.id },
      { status: 500 }
    );
  }
}
