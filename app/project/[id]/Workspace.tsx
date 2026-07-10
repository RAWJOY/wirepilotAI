"use client";

import { useEffect, useState } from "react";
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

type DocRow = { id: string; content: any } | undefined;

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "prd", label: "PRD" },
  { key: "personas", label: "User Personas" },
  { key: "flow", label: "User Flow" },
  { key: "screens", label: "Screen List" },
  { key: "wireframes", label: "Wireframes" },
  { key: "stories", label: "User Stories" },
  { key: "criteria", label: "Acceptance Criteria" },
  { key: "export", label: "Export" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function Workspace({
  project,
  summaryRow,
  problemRow,
  goalsRow,
  personasRow,
  flowRow,
  screensRow,
  prdRow,
  storiesRow,
  metricsRow,
}: {
  project: {
    title: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  summaryRow: DocRow;
  problemRow: DocRow;
  goalsRow: DocRow;
  personasRow: DocRow;
  flowRow: DocRow;
  screensRow: DocRow;
  prdRow: DocRow;
  storiesRow: DocRow;
  metricsRow: DocRow;
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const goals = (goalsRow?.content?.items as string[] | undefined) ?? [];
  const personas = (personasRow?.content?.items as Persona[] | undefined) ?? [];
  const userFlow = (flowRow?.content?.items as string[] | undefined) ?? [];
  const screens = (screensRow?.content?.items as ScreenItem[] | undefined) ?? [];
  const prd = prdRow?.content as
    | { overview: string; scope: string; requirements: string[] }
    | undefined;
  const userStories = (storiesRow?.content?.items as UserStory[] | undefined) ?? [];
  const metrics = (metricsRow?.content?.items as Metric[] | undefined) ?? [];

  // Keyboard shortcuts: press 1-9 to jump between tabs, so this feels
  // fast to navigate like Linear/Notion for anyone using a keyboard.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      if (isTyping) return;

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= TABS.length) {
        setActiveTab(TABS[num - 1].key);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (project.status !== "ready") {
    return null; // parent page handles generating/error states
  }

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <div className="wp-tabbar" role="tablist" aria-label="Project sections">
        {TABS.map((tab, i) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`wp-tab ${activeTab === tab.key ? "wp-tab-active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
            title={`Press ${i + 1}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="wp-tab-panel" key={activeTab}>
        {activeTab === "overview" && (
          <OverviewTab project={project} summary={summaryRow?.content?.text} problemStatement={problemRow?.content?.text} goals={goals} personas={personas} />
        )}

        {activeTab === "prd" && prdRow && (
          <EditableSection documentId={prdRow.id} tag="PRD" title="Product Requirements Document" rawContent={prdRow.content}>
            <p>
              <strong>Problem:</strong> {problemRow?.content?.text}
            </p>
            <p>
              <strong>Goals:</strong> {goals.join("; ")}
            </p>
            <p>
              <strong>Scope:</strong> {prd?.scope}
            </p>
            <p style={{ marginBottom: 4 }}>
              <strong>Functional Requirements:</strong>
            </p>
            <ul>
              {prd?.requirements?.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
            <p className="wp-muted" style={{ fontSize: "0.85rem", marginTop: "1rem" }}>
              Non-functional requirements, risks, and future enhancements are
              queued as a future improvement to PRD generation.
            </p>
          </EditableSection>
        )}

        {activeTab === "personas" && personasRow && (
          <EditableSection documentId={personasRow.id} tag="PERSONAS" title="User Personas" rawContent={personasRow.content}>
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
                    <strong>Pain Points:</strong> {persona.frustrations?.join("; ")}
                  </p>
                </Card>
              ))}
            </CardList>
          </EditableSection>
        )}

        {activeTab === "flow" && flowRow && (
          <EditableSection documentId={flowRow.id} tag="USER FLOW" title="User Flow" rawContent={flowRow.content}>
            <div className="wp-flow-diagram">
              {userFlow.map((step, i) => (
                <div key={i} className="wp-flow-step-wrap">
                  <div className="wp-flow-step">{step}</div>
                  {i < userFlow.length - 1 && <div className="wp-flow-arrow">↓</div>}
                </div>
              ))}
            </div>
            <p className="wp-muted" style={{ fontSize: "0.85rem", marginTop: "1rem" }}>
              A branching, drag-to-arrange diagram is queued as a future
              improvement — this is a first visual pass beyond plain text.
            </p>
          </EditableSection>
        )}

        {activeTab === "screens" && screensRow && (
          <EditableSection documentId={screensRow.id} tag="SCREENS" title="Screen List" rawContent={screensRow.content}>
            <CardList>
              {screens.map((screen, i) => (
                <Card key={i}>
                  <strong>{screen.name}</strong>
                  <p style={{ margin: "6px 0 4px" }}>
                    <strong>Purpose:</strong> <span className="wp-muted">{screen.purpose}</span>
                  </p>
                  <p style={{ margin: "4px 0" }}>
                    <strong>Components:</strong>{" "}
                    <span className="wp-muted">{screen.wireframe_elements?.join(", ")}</span>
                  </p>
                  <p style={{ margin: "4px 0 0" }} className="wp-muted">
                    Navigation and designer notes are queued as a future
                    generation improvement.
                  </p>
                </Card>
              ))}
            </CardList>
          </EditableSection>
        )}

        {activeTab === "wireframes" && screensRow && (
          <EditableSection documentId={screensRow.id} tag="WIREFRAMES" title="Low-Fidelity Wireframes" rawContent={screensRow.content}>
            <CardList>
              {screens.map((screen, i) => (
                <Card key={i}>
                  <strong>{screen.name}</strong>
                  <div className="wp-wireframe-box" style={{ marginTop: 8 }}>
                    {screen.wireframe_elements?.map((el, j) => (
                      <div key={j} className="wp-wireframe-chip">
                        {el}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </CardList>
            <p className="wp-muted" style={{ fontSize: "0.85rem", marginTop: "1rem" }}>
              Rename, delete, duplicate, add-screen, and per-screen
              regeneration are queued as the next Wireframes feature.
            </p>
          </EditableSection>
        )}

        {activeTab === "stories" && storiesRow && (
          <EditableSection documentId={storiesRow.id} tag="USER STORIES" title="User Stories" rawContent={storiesRow.content}>
            <CardList>
              {userStories.map((story, i) => (
                <Card key={i}>
                  <p style={{ margin: 0 }}>{story.story}</p>
                </Card>
              ))}
            </CardList>
            <p className="wp-muted" style={{ fontSize: "0.85rem", marginTop: "1rem" }}>
              Grouping by Authentication / Core Features / Settings / Admin is
              queued as a future improvement.
            </p>
          </EditableSection>
        )}

        {activeTab === "criteria" && storiesRow && (
          <EditableSection documentId={storiesRow.id} tag="ACCEPTANCE CRITERIA" title="Acceptance Criteria" rawContent={storiesRow.content}>
            <CardList>
              {userStories.map((story, i) => (
                <Card key={i}>
                  <p style={{ marginTop: 0, fontWeight: 600 }}>{story.story}</p>
                  <ul style={{ marginBottom: 0 }}>
                    {story.acceptance_criteria?.map((ac, j) => (
                      <li key={j}>{ac}</li>
                    ))}
                  </ul>
                </Card>
              ))}
            </CardList>
            <p className="wp-muted" style={{ fontSize: "0.85rem", marginTop: "1rem" }}>
              Reformatting these into Given / When / Then requires a change
              to the AI generation prompt — queued as a future feature.
            </p>
          </EditableSection>
        )}

        {activeTab === "export" && (
          <div>
            <span className="wp-tag">EXPORT</span>
            <h2 className="wp-section-title" style={{ marginBottom: "1rem" }}>
              Export this project
            </h2>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
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
              <button className="wp-btn" disabled title="Coming soon">
                Export Markdown
              </button>
              <button className="wp-btn" disabled title="Coming soon">
                Export JSON
              </button>
            </div>
            <p className="wp-muted" style={{ fontSize: "0.85rem", marginTop: "1rem" }}>
              Markdown and JSON export are queued as the next Export feature.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function OverviewTab({
  project,
  summary,
  problemStatement,
  goals,
  personas,
}: {
  project: { title: string; status: string; created_at: string; updated_at: string };
  summary?: string;
  problemStatement?: string;
  goals: string[];
  personas: Persona[];
}) {
  const created = new Date(project.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const updated = new Date(project.updated_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div>
      <div className="wp-overview-grid">
        <div className="wp-card">
          <span className="wp-tag">CREATED</span>
          <p style={{ margin: 0 }}>{created}</p>
        </div>
        <div className="wp-card">
          <span className="wp-tag">LAST UPDATED</span>
          <p style={{ margin: 0 }}>{updated}</p>
        </div>
        <div className="wp-card">
          <span className="wp-tag">STATUS</span>
          <p style={{ margin: 0 }}>
            <span className="wp-status-pill wp-status-ready">READY</span>
          </p>
        </div>
        <div className="wp-card">
          <span className="wp-tag">AI MODEL</span>
          <p style={{ margin: 0 }}>Claude Sonnet 4.5</p>
        </div>
      </div>

      <div className="wp-section" style={{ marginTop: "1.5rem" }}>
        <span className="wp-tag">PRODUCT SUMMARY</span>
        <p>{summary}</p>
      </div>

      <div className="wp-section">
        <span className="wp-tag">PROBLEM STATEMENT</span>
        <p>{problemStatement}</p>
      </div>

      <div className="wp-section">
        <span className="wp-tag">BUSINESS GOALS</span>
        <ul>
          {goals.map((goal, i) => (
            <li key={i}>{goal}</li>
          ))}
        </ul>
      </div>

      <div className="wp-section">
        <span className="wp-tag">TARGET USERS</span>
        <p className="wp-muted">
          {personas.map((p) => p.role).join(", ") || "Not yet generated"}
        </p>
      </div>
    </div>
  );
}

function CardList({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>{children}</div>;
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="wp-card">{children}</div>;
}
