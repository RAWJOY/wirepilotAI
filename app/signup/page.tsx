"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage(
      "Account created. Check your email to confirm your address, then log in."
    );
  }

  return (
    <main className="wp-shell">
      <form onSubmit={handleSignUp} className="wp-card" style={{ width: "100%", maxWidth: 380 }}>
        <span className="wp-tag">WIREPILOT AI</span>
        <h1 style={{ fontSize: "1.4rem", margin: "0 0 1.5rem" }}>Create your account</h1>

        <label className="wp-label">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="wp-input"
          placeholder="you@example.com"
          style={{ marginBottom: "1rem" }}
        />

        <label className="wp-label">Password</label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="wp-input"
          placeholder="At least 6 characters"
          style={{ marginBottom: "1.25rem" }}
        />

        {error && <p className="wp-error">{error}</p>}
        {message && <p className="wp-success">{message}</p>}

        <button type="submit" disabled={loading} className="wp-btn wp-btn-primary" style={{ width: "100%" }}>
          {loading && <span className="wp-spinner" />}
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p style={{ fontSize: "0.85rem", marginTop: "1.25rem", textAlign: "center" }}>
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </form>
    </main>
  );
}
