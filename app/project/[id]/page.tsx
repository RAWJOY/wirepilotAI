import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EditableSection from "./EditableSection";
import ExportPdfButton from "./ExportPdfButton";

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

  const getRow = (type: string) => documents?.find((d) => d.doc_type === type);

  const summaryRow = getRow("summary");
  const problemRow = getRow("problem_statement");
  const goalsRow = getRow("goals");
  const personasRow = getRow("personas");
  const flowRow = getRow("user_flow");
  const screensRow = getRow("screens");
  const prdRow = getRow("prd");
  const storiesRow = getRow("user_stories");
  const metricsRow = getRow("metrics");

  const goals = (goalsRow?.content?.items as string[] | undefined) ?? [];
  const personas = (personasRow?.content?.items as Persona[] | undefined) ?? [];
  const userFlow = (flowRow?.content?.items as string[] | undefined) ?? [];
  const screens = (screensRow?.content?.items as ScreenItem[] | undefined) ?? [];
  const prd = prdRow?.content as
    | { overview: string; scope: string; requirements: string[] }
    | undefined;
  const userStories = (storiesRow?.content?.items as UserStory[] | undefined) ?? [];
  const metrics = (metricsRow?.content?.items as Metric[] | undefined) ?? [];

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
        {project.status === "ready" && (
          <ExportPdfButton
            data={{
              title: project.title,
              summary: summaryRow?.content?.text,
              problemStatement: problemRow?.content?.text,
              goals,
              personas,
              userFlow,
              screens,
              prd,
              userStories,
              metrics,
            }}
          />
        )}
      </div>

      {project.status === "generating" && (
        <p style={{ marginTop: "1.5rem" }}>
          <span className="wp-status-pill wp-status-generating">
            <span className="wp-spinner" style={{ marginRight: 6 }} />
            GENERATING
          </span>
          <br />
          <span className="wp-muted" style={{ fontSize: "0.9rem" }}>
            Refresh this page in a few seconds.
          </span>
        </p>
      )}

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
        <>
          {summaryRow && (
            <EditableSection documentId={summaryRow.id} tag="01 / SUMMARY" title="Product Summary" rawContent={summaryRow.content}>
              <p>{summaryRow.content?.text}</p>
            </EditableSection>
          )}

          {problemRow && (
            <EditableSection documentId={problemRow.id} tag="02 / PROBLEM" title="Problem Statement" rawContent={problemRow.content}>
              <p>{problemRow.content?.text}</p>
            </EditableSection>
          )}

          {goalsRow && (
            <EditableSection documentId={goalsRow.id} tag="03 / GOALS" title="Goals" rawContent={goalsRow.content}>
              <ul>
                {goals.map((goal, i) => (
                  <li key={i}>{goal}</li>
                ))}
              </ul>
            </EditableSection>
          )}

          {personasRow && (
            <EditableSection documentId={personasRow.id} tag="04 / PERSONAS" title="User Personas" rawContent={personasRow.content}>
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
                      <strong>Frustrations:</strong> {persona.frustrations?.join("; ")}
                    </p>
                  </Card>
                ))}
              </CardList>
            </EditableSection>
          )}

          {flowRow && (
            <EditableSection documentId={flowRow.id} tag="05 / USER FLOW" title="User Flow" rawContent={flowRow.content}>
              <ol>
                {userFlow.map((step, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>
                    {step}
                  </li>
                ))}
              </ol>
            </EditableSection>
          )}

          {screensRow && (
            <EditableSection documentId={screensRow.id} tag="06 / SCREENS" title="Screens & Low-Fidelity Wireframes" rawContent={screensRow.content}>
              <CardList>
                {screens.map((screen, i) => (
                  <Card key={i}>
                    <strong>{screen.name}</strong>
                    <p style={{ margin: "4px 0 8px" }} className="wp-muted">
                      {screen.purpose}
                    </p>
                    <div className="wp-wireframe-box">
                      {screen.wireframe_elements?.map((el, j) => (
                        <div key={j} className="wp-wireframe-chip">
                          {el}
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </CardList>
            </EditableSection>
          )}

          {prdRow && (
            <EditableSection documentId={prdRow.id} tag="07 / PRD" title="Product Requirements Document" rawContent={prdRow.content}>
              <p>
                <strong>Overview:</strong> {prd?.overview}
              </p>
              <p>
                <strong>Scope:</strong> {prd?.scope}
              </p>
              <p>
                <strong>Requirements:</strong>
              </p>
              <ul>
                {prd?.requirements?.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </EditableSection>
          )}

          {storiesRow && (
            <EditableSection documentId={storiesRow.id} tag="08 / USER STORIES" title="User Stories & Acceptance Criteria" rawContent={storiesRow.content}>
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
            </EditableSection>
          )}

          {metricsRow && (
            <EditableSection documentId={metricsRow.id} tag="09 / METRICS" title="Success Metrics" rawContent={metricsRow.content}>
              <CardList>
                {metrics.map((metric, i) => (
                  <Card key={i}>
                    <strong>{metric.name}</strong>
                    <p style={{ margin: "4px 0" }}>{metric.description}</p>
                    <p style={{ margin: 0 }} className="wp-muted">
                      Target: {metric.target}
                    </p>
                  </Card>
                ))}
              </CardList>
            </EditableSection>
          )}
        </>
      )}
    </main>
  );
}

function CardList({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>{children}</div>;
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="wp-card">{children}</div>;
}
