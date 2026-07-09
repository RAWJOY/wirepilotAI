"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditableSection({
  documentId,
  title,
  rawContent,
  children,
}: {
  documentId: string;
  title: string;
  rawContent: unknown;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [jsonText, setJsonText] = useState(JSON.stringify(rawContent, null, 2));
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      setError("That doesn't look like valid formatting. Check for a missing quote or comma.");
      setSaving(false);
      return;
    }

    const res = await fetch(`/api/documents/${documentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: parsed }),
    });

    setSaving(false);

    if (!res.ok) {
      setError("Could not save. Please try again.");
      return;
    }

    setMode("view");
    router.refresh();
  }

  async function handleRegenerate() {
    setRegenerating(true);
    setError(null);

    const res = await fetch(`/api/documents/${documentId}/regenerate`, {
      method: "POST",
    });

    setRegenerating(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Regeneration failed. Please try again.");
      return;
    }

    router.refresh();
  }

  return (
    <section style={{ marginTop: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.5rem",
        }}
      >
        <h2 style={{ fontSize: "1.1rem", margin: 0 }}>{title}</h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {mode === "view" && (
            <>
              <button style={smallButtonStyle} onClick={() => setMode("edit")}>
                Edit
              </button>
              <button
                style={smallButtonStyle}
                onClick={handleRegenerate}
                disabled={regenerating}
              >
                {regenerating ? "Regenerating..." : "Regenerate"}
              </button>
            </>
          )}
          {mode === "edit" && (
            <>
              <button
                style={smallButtonStyle}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                style={smallButtonStyle}
                onClick={() => {
                  setJsonText(JSON.stringify(rawContent, null, 2));
                  setMode("view");
                  setError(null);
                }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <p style={{ color: "#c0392b", fontSize: "0.85rem" }}>{error}</p>
      )}

      {mode === "view" ? (
        children
      ) : (
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          rows={10}
          style={{
            width: "100%",
            fontFamily: "monospace",
            fontSize: "0.85rem",
            padding: "0.75rem",
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        />
      )}
    </section>
  );
}

const smallButtonStyle: React.CSSProperties = {
  padding: "0.3rem 0.7rem",
  fontSize: "0.8rem",
  borderRadius: 6,
  border: "1px solid #ccc",
  background: "#fff",
  cursor: "pointer",
};
