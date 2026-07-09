import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wp-shell">
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <span className="wp-tag">404 / NOT FOUND</span>
        <h1 style={{ fontSize: "1.6rem", margin: "0.25rem 0 0.75rem" }}>
          This page doesn&apos;t exist
        </h1>
        <p className="wp-muted" style={{ marginBottom: "1.5rem" }}>
          The project or page you're looking for isn't here — it may have
          been deleted, or the link might be incorrect.
        </p>
        <Link href="/dashboard" className="wp-btn wp-btn-primary">
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
