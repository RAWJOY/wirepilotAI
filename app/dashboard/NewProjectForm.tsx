"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProjectForm() {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      router.push(`/project/${data.projectId}`);
    } catch {
      setError("Could not reach the server. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="wp-card" style={{ marginBottom: "2rem" }}>
      <span className="wp-tag">NEW PROJECT</span>
      <label className="wp-label" style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--ink)", marginTop: "0.25rem" }}>
        Describe your product idea
      </label>
      <textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        placeholder="e.g. Build a food delivery app for small towns"
        rows={3}
        required
        className="wp-textarea"
        style={{ marginBottom: "1rem", marginTop: "0.5rem" }}
      />
      {error && <p className="wp-error">{error}</p>}
      <button type="submit" disabled={loading} className="wp-btn wp-btn-primary">
        {loading && <span className="wp-spinner" />}
        {loading ? "Generating your product plan..." : "Generate"}
      </button>
    </form>
  );
}
