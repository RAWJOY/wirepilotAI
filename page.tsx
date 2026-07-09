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
      <p style={{ fontSize: "1.1rem", color: "#555" }}>
        Milestone 0 complete — this app is live on the internet.
      </p>
    </main>
  );
}
