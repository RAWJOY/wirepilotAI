import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Persona = {
  name: string;
  role: string;
  goals: string[];
  frustrations: string[];
};

type ScreenItem = {
  name: string;
  purpose: string;
  wireframe_elements: string[];
};

type UserStory = {
  story: string;
  acceptance_criteria: string[];
};

type Metric = {
  name: string;
  description: string;
  target: string;
};

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
  const personas = (getDoc("personas")?.items as Persona[] | undefined) ?? [];
  const userFlow = (getDoc("user_flow")?.items as string[] | undefined) ?? [];
  const screens = (getDoc("screens")?.items as ScreenItem[] | undefined) ?? [];
  const prd = getDoc("prd") as
    | { overview: string; scope: string; requirements: string[] }
    | undefined;
  const userStories =
    (getDoc("user_stories")?.items as UserStory[] | undefined) ?? [];
  const metrics = (getDoc("metrics")?.items as Metric[] | undefined) ?? [];

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
          one.
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
            <CardList>
              {personas.map((persona, i) => (
                <Card key={i}>
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
                </Card>
              ))}
            </CardList>
          </Section>

          <Section title="User Flow">
            <ol>
              {userFlow.map((step, i) => (
                <li key={i} style={{ marginBottom: 4 }}>
                  {step}
                </li>
              ))}
            </ol>
          </Section>

          <Section title="Screens & Low-Fidelity Wireframes">
            <CardList>
              {screens.map((screen, i) => (
                <Card key={i}>
                  <strong>{screen.name}</strong>
                  <p style={{ margin: "4px 0 8px", color: "#555" }}>
                    {screen.purpose}
                  </p>
                  <div
                    style={{
                      border: "1px dashed #bbb",
                      borderRadius: 6,
                      padding: "0.75rem",
                      background: "#fafafa",
                    }}
                  >
                    {screen.wireframe_elements?.map((el, j) => (
                      <div
                        key={j}
                        style={{
                          border: "1px solid #ccc",
                          borderRadius: 4,
                          padding: "0.4rem 0.6rem",
                          marginBottom: 6,
                          fontSize: "0.85rem",
                          color: "#666",
                          background: "#fff",
                        }}
                      >
                        {el}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </CardList>
          </Section>

          {prd && (
            <Section title="Product Requirements Document (PRD)">
              <p>
                <strong>Overview:</strong> {prd.overview}
              </p>
              <p>
                <strong>Scope:</strong> {prd.scope}
              </p>
              <p>
                <strong>Requirements:</strong>
              </p>
              <ul>
                {prd.requirements?.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </Section>
          )}

          <Section title="User Stories & Acceptance Criteria">
            <CardList>
              {userStories.map((story, i) => (
                <Card key={i}>
                  <p style={{ marginTop: 0 }}>{story.story}</p>
                  <ul style={{ marginBottom: 0 }}>
                    {story.acceptance_criteria?.map((ac, j) => (
                      <li key={j}>{ac}</li>
                    ))}
                  </ul>
                </Card>
              ))}
            </CardList>
          </Section>

          <Section title="Success Metrics">
            <CardList>
              {metrics.map((metric, i) => (
                <Card key={i}>
                  <strong>{metric.name}</strong>
                  <p style={{ margin: "4px 0" }}>{metric.description}</p>
                  <p style={{ margin: 0, color: "#555" }}>
                    Target: {metric.target}
                  </p>
                </Card>
              ))}
            </CardList>
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

function CardList({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {children}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        border: "1px solid #e5e5e5",
        borderRadius: 8,
        padding: "1rem",
      }}
    >
      {children}
    </div>
  );
}
