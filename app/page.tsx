import Link from "next/link";

export default function HomePage() {
  return (
    <main className="wp-shell">
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <span className="wp-tag">WIREPILOT AI · PRODUCT WORKSPACE</span>
        <h1
          style={{
            fontSize: "clamp(2rem, 6vw, 2.75rem)",
            margin: "0.25rem 0 0.75rem",
          }}
        >
          Idea in. Product plan out.
        </h1>
        <p
          className="wp-muted"
          style={{ fontSize: "1.05rem", marginBottom: "2rem" }}
        >
          Describe a product in plain English. Get a summary, personas, user
          flow, wireframes, PRD, and user stories — drafted and ready to
          edit.
        </p>
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href="/login" className="wp-btn">
            Log In
          </Link>
          <Link href="/signup" className="wp-btn wp-btn-primary">
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}
