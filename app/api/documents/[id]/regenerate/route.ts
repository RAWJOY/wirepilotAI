import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSingleSection } from "@/lib/ai/generate";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const { data: existingDoc } = await supabase
    .from("product_documents")
    .select("id, doc_type, version, project_id, projects!inner(user_id, original_prompt)")
    .eq("id", params.id)
    .single();

  if (!existingDoc || (existingDoc as any).projects.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const project = (existingDoc as any).projects;

  try {
    // Grab the summary as extra context, if this isn't the summary itself.
    let contextSummary: string | null = null;
    if (existingDoc.doc_type !== "summary") {
      const { data: summaryDoc } = await supabase
        .from("product_documents")
        .select("content")
        .eq("project_id", existingDoc.project_id)
        .eq("doc_type", "summary")
        .single();
      contextSummary = summaryDoc?.content?.text ?? null;
    }

    const newContent = await generateSingleSection(
      existingDoc.doc_type,
      project.original_prompt,
      contextSummary
    );

    const { error } = await supabase
      .from("product_documents")
      .update({
        content: newContent,
        version: existingDoc.version + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ content: newContent });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Regeneration failed: ${message}` },
      { status: 500 }
    );
  }
}
