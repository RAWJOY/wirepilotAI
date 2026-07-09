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
    <main
      style={{
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
        padding: "2rem",
        maxWidth: 700,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h1>Your Dashboard</h1>
        <LogoutButton />
      </div>

      <NewProjectForm />

      <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
        Your Projects
      </h2>

      {(!projects || projects.length === 0) && (
        <p style={{ color: "#666" }}>
          No projects yet — describe an idea above to create your first one.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {projects?.map((project) => (
          <Link
            key={project.id}
            href={`/project/${project.id}`}
            style={{
              display: "block",
              padding: "1rem",
              border: "1px solid #e5e5e5",
              borderRadius: 8,
              textDecoration: "none",
              color: "#111",
            }}
          >
            <strong>{project.title}</strong>
            <div style={{ fontSize: "0.85rem", color: "#888", marginTop: 4 }}>
              {project.status === "generating" && "⏳ Generating..."}
              {project.status === "ready" && "✅ Ready"}
              {project.status === "error" && "⚠️ Generation failed"}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
