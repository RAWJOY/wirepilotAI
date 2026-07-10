import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Workspace from "./Workspace";

export default async function ProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!project) {
    notFound();
  }

  const { data: documents } = await supabase
    .from("product_documents")
    .select("*")
    .eq("project_id", params.id);

  const getRow = (type: string) => documents?.find((d) => d.doc_type === type);

  return (
    <main className="wp-container">
      <Link href="/dashboard" style={{ fontSize: "0.85rem" }} className="wp-muted">
        ← Back to Dashboard
      </Link>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginTop: "0.75rem",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <span className="wp-tag">PRODUCT PLAN</span>
          <h1 style={{ margin: 0, fontSize: "1.6rem" }}>{project.title}</h1>
        </div>
      </div>

      {project.status === "generating" && <GeneratingSkeleton />}

      {project.status === "error" && (
        <p style={{ marginTop: "1.5rem" }}>
          <span className="wp-status-pill wp-status-error">FAILED</span>
          <br />
          <span className="wp-muted" style={{ fontSize: "0.9rem" }}>
            Something went wrong generating this project. Try creating a new one.
          </span>
        </p>
      )}

      {project.status === "ready" && (
        <Workspace
          project={project}
          summaryRow={getRow("summary")}
          problemRow={getRow("problem_statement")}
          goalsRow={getRow("goals")}
          personasRow={getRow("personas")}
          flowRow={getRow("user_flow")}
          screensRow={getRow("screens")}
          prdRow={getRow("prd")}
          storiesRow={getRow("user_stories")}
          metricsRow={getRow("metrics")}
        />
      )}
    </main>
  );
}

function GeneratingSkeleton() {
  return (
    <div style={{ marginTop: "1.5rem" }}>
      <span className="wp-status-pill wp-status-generating">
        <span className="wp-spinner" style={{ marginRight: 6 }} />
        GENERATING
      </span>
      <p className="wp-muted" style={{ fontSize: "0.9rem", margin: "0.5rem 0 1.5rem" }}>
        This usually takes 15-30 seconds. This page will update automatically
        when refreshed.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div className="wp-skeleton-line" style={{ width: "40%" }} />
        <div className="wp-skeleton-line" style={{ width: "90%" }} />
        <div className="wp-skeleton-line" style={{ width: "75%" }} />
        <div className="wp-skeleton-block" />
      </div>
    </div>
  );
}
