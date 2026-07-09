import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
        🚀 WirePilot AI
      </h1>
      <p style={{ fontSize: "1.1rem", color: "#555", marginBottom: "1.5rem" }}>
        Milestone 1: accounts and login are live.
      </p>
      <div style={{ display: "flex", gap: "1rem" }}>
        <Link
          href="/login"
          style={{
            padding: "0.7rem 1.4rem",
            borderRadius: 6,
            border: "1px solid #111",
            color: "#111",
            textDecoration: "none",
          }}
        >
          Log In
        </Link>
        <Link
          href="/signup"
          style={{
            padding: "0.7rem 1.4rem",
            borderRadius: 6,
            background: "#111",
            color: "#fff",
            textDecoration: "none",
          }}
        >
          Sign Up
        </Link>
      </div>
    </main>
  );
}
