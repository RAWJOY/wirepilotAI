import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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

  const getDoc = (type: string) =>
    documents?.find((d) => d.doc_type === type)?.content;

  const summary = getDoc("summary")?.text as string | undefined;
  const problemStatement = getDoc("problem_statement")?.text as
    | string
    | undefined;
  const goals = (getDoc("goals")?.items as string[] | undefined) ?? [];
  const personas =
    (getDoc("personas")?.items as
      | { name: string; role: string; goals: string[]; frustrations: string[] }[]
      | undefined) ?? [];

  return (
    <main
      style={{
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
        padding: "2rem",
        maxWidth: 700,
        margin: "0 auto",
      }}
    >
      <Link href="/dashboard" style={{ color: "#666", fontSize: "0.9rem" }}>
        ← Back to Dashboard
      </Link>

      <h1 style={{ marginTop: "1rem" }}>{project.title}</h1>

      {project.status === "generating" && (
        <p style={{ color: "#888" }}>
          ⏳ Still generating — refresh this page in a few seconds.
        </p>
      )}

      {project.status === "error" && (
        <p style={{ color: "#c0392b" }}>
          ⚠️ Something went wrong generating this project. Try creating a new
          one, or let your co-founder (Claude) know so it can look into the
          error.
        </p>
      )}

      {project.status === "ready" && (
        <>
          <Section title="Product Summary">
            <p>{summary}</p>
          </Section>

          <Section title="Problem Statement">
            <p>{problemStatement}</p>
          </Section>

          <Section title="Goals">
            <ul>
              {goals.map((goal, i) => (
                <li key={i}>{goal}</li>
              ))}
            </ul>
          </Section>

          <Section title="User Personas">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {personas.map((persona, i) => (
                <div
                  key={i}
                  style={{
                    border: "1px solid #e5e5e5",
                    borderRadius: 8,
                    padding: "1rem",
                  }}
                >
                  <strong>
                    {persona.name} — {persona.role}
                  </strong>
                  <p style={{ marginTop: 8, marginBottom: 4 }}>
                    <strong>Goals:</strong> {persona.goals?.join("; ")}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Frustrations:</strong>{" "}
                    {persona.frustrations?.join("; ")}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        </>
      )}
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginTop: "2rem" }}>
      <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>{title}</h2>
      {children}
    </section>
  );
}
