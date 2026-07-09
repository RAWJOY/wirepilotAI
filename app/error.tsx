"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="wp-shell">
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <span className="wp-tag">SOMETHING WENT WRONG</span>
        <h1 style={{ fontSize: "1.6rem", margin: "0.25rem 0 0.75rem" }}>
          Unexpected error
        </h1>
        <p className="wp-muted" style={{ marginBottom: "1.5rem" }}>
          This wasn&apos;t supposed to happen. Try again — if it keeps
          occurring, it's worth reporting so it can be fixed.
        </p>
        <button onClick={reset} className="wp-btn wp-btn-primary">
          Try Again
        </button>
      </div>
    </main>
  );
}
