"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="wp-shell">
      <form onSubmit={handleLogin} className="wp-card" style={{ width: "100%", maxWidth: 380 }}>
        <span className="wp-tag">WIREPILOT AI</span>
        <h1 style={{ fontSize: "1.4rem", margin: "0 0 1.5rem" }}>Log in</h1>

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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="wp-input"
          placeholder="Your password"
          style={{ marginBottom: "1.25rem" }}
        />

        {error && <p className="wp-error">{error}</p>}

        <button type="submit" disabled={loading} className="wp-btn wp-btn-primary" style={{ width: "100%" }}>
          {loading && <span className="wp-spinner" />}
          {loading ? "Logging in..." : "Log In"}
        </button>

        <p style={{ fontSize: "0.85rem", marginTop: "1.25rem", textAlign: "center" }}>
          Don&apos;t have an account? <Link href="/signup">Sign up</Link>
        </p>
      </form>
    </main>
  );
}
