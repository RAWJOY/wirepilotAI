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
    <form
      onSubmit={handleSubmit}
      style={{
        background: "#fff",
        border: "1px solid #e5e5e5",
        borderRadius: 12,
        padding: "1.5rem",
        marginBottom: "2rem",
      }}
    >
      <label
        style={{
          display: "block",
          fontWeight: 600,
          marginBottom: "0.5rem",
        }}
      >
        Describe your product idea
      </label>
      <textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        placeholder="e.g. Build a food delivery app for small towns"
        rows={3}
        required
        style={{
          width: "100%",
          padding: "0.75rem",
          borderRadius: 8,
          border: "1px solid #ccc",
          fontSize: "1rem",
          fontFamily: "inherit",
          marginBottom: "1rem",
          resize: "vertical",
        }}
      />
      {error && (
        <p style={{ color: "#c0392b", marginBottom: "1rem" }}>{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "0.7rem 1.4rem",
          borderRadius: 8,
          border: "none",
          background: "#111",
          color: "#fff",
          fontSize: "1rem",
          cursor: loading ? "default" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Generating your product plan..." : "Generate"}
      </button>
    </form>
  );
}
