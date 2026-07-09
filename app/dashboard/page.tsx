import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";
import NewProjectForm from "./NewProjectForm";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="wp-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.5rem",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div>
          <span className="wp-tag">WIREPILOT AI</span>
          <h1 style={{ fontSize: "1.6rem", margin: 0 }}>Dashboard</h1>
        </div>
        <LogoutButton />
      </div>
      <p className="wp-muted" style={{ marginTop: 0, marginBottom: "1.5rem" }}>
        {user.email}
      </p>

      <NewProjectForm />

      <h2 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Your Projects</h2>

      {(!projects || projects.length === 0) && (
        <p className="wp-muted">
          No projects yet — describe an idea above to create your first one.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {projects?.map((project) => (
          <Link
            key={project.id}
            href={`/project/${project.id}`}
            className="wp-card"
            style={{ textDecoration: "none", color: "var(--ink)", display: "block" }}
          >
            <strong>{project.title}</strong>
            <div style={{ marginTop: 8 }}>
              {project.status === "generating" && (
                <span className="wp-status-pill wp-status-generating">GENERATING</span>
              )}
              {project.status === "ready" && (
                <span className="wp-status-pill wp-status-ready">READY</span>
              )}
              {project.status === "error" && (
                <span className="wp-status-pill wp-status-error">FAILED</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
