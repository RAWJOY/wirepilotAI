"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditableSection({
  documentId,
  tag,
  title,
  rawContent,
  children,
}: {
  documentId: string;
  tag: string;
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
    <section className="wp-section">
      <div className="wp-section-header">
        <div>
          <span className="wp-tag">{tag}</span>
          <h2 className="wp-section-title">{title}</h2>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {mode === "view" && (
            <>
              <button className="wp-btn wp-btn-small" onClick={() => setMode("edit")}>
                Edit
              </button>
              <button
                className="wp-btn wp-btn-small"
                onClick={handleRegenerate}
                disabled={regenerating}
              >
                {regenerating && <span className="wp-spinner" />}
                {regenerating ? "Regenerating..." : "Regenerate"}
              </button>
            </>
          )}
          {mode === "edit" && (
            <>
              <button className="wp-btn wp-btn-small wp-btn-primary" onClick={handleSave} disabled={saving}>
                {saving && <span className="wp-spinner" />}
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                className="wp-btn wp-btn-small"
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

      {error && <p className="wp-error">{error}</p>}

      {mode === "view" ? (
        children
      ) : (
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          rows={10}
          className="wp-textarea wp-textarea-code"
        />
      )}
    </section>
  );
}
