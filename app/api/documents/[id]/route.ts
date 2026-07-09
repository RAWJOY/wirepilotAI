import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
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

  const { content } = await request.json();

  if (!content || typeof content !== "object") {
    return NextResponse.json(
      { error: "Content must be a valid object." },
      { status: 400 }
    );
  }

  // Confirm this document actually belongs to a project owned by this user
  // before allowing any changes — this is our app-level security check,
  // backed up by the database's Row Level Security as a second layer.
  const { data: existingDoc } = await supabase
    .from("product_documents")
    .select("id, version, project_id, projects!inner(user_id)")
    .eq("id", params.id)
    .single();

  if (!existingDoc || (existingDoc as any).projects.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("product_documents")
    .update({
      content,
      version: existingDoc.version + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json(
      { error: "Could not save changes. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
