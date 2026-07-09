import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If nobody is logged in, send them to the login page instead.
  if (!user) {
    redirect("/login");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
        padding: "2rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1>Your Dashboard</h1>
        <LogoutButton />
      </div>
      <p>
        Logged in as <strong>{user.email}</strong>
      </p>
      <p style={{ color: "#666", marginTop: "1rem" }}>
        Your product ideas will show up here once we build Milestone 2.
      </p>
    </main>
  );
}
