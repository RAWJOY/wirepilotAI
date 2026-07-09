import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateProductPlan } from "@/lib/ai/generate";

export async function POST(request: NextRequest) {
  const supabase = createClient();

  // Step 1: Make sure someone is actually logged in.
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

  // Step 2: Create the project row right away, marked "generating".
  const title = idea.trim().slice(0, 80);

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      title,
      original_prompt: idea.trim(),
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

  // Step 3: Call the AI to generate the plan.
  try {
    const plan = await generateProductPlan(idea.trim());

    // Step 4: Save each section as its own row.
    const rows = [
      { project_id: project.id, doc_type: "summary", content: { text: plan.summary } },
      {
        project_id: project.id,
        doc_type: "problem_statement",
        content: { text: plan.problem_statement },
      },
      { project_id: project.id, doc_type: "goals", content: { items: plan.goals } },
      {
        project_id: project.id,
        doc_type: "personas",
        content: { items: plan.personas },
      },
    ];

    const { error: docsError } = await supabase
      .from("product_documents")
      .insert(rows);

    if (docsError) {
      throw new Error(docsError.message);
    }

    // Step 5: Mark the project as ready.
    await supabase
      .from("projects")
      .update({ status: "ready" })
      .eq("id", project.id);

    return NextResponse.json({ projectId: project.id });
  } catch (err) {
    // If anything went wrong, mark the project as errored so the UI
    // can show something sensible instead of hanging forever.
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
