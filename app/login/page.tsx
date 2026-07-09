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
    <main style={styles.wrapper}>
      <form onSubmit={handleLogin} style={styles.card}>
        <h1 style={styles.title}>Log in to WirePilot AI</h1>

        <label style={styles.label}>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          placeholder="you@example.com"
        />

        <label style={styles.label}>Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          placeholder="Your password"
        />

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Logging in..." : "Log In"}
        </button>

        <p style={styles.footerText}>
          Don&apos;t have an account? <Link href="/signup">Sign up</Link>
        </p>
      </form>
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "system-ui, sans-serif",
    background: "#f7f7f8",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    background: "#fff",
    padding: "2rem",
    borderRadius: 12,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
  },
  title: { fontSize: "1.4rem", marginBottom: "1.5rem" },
  label: { fontSize: "0.85rem", marginBottom: "0.3rem", color: "#333" },
  input: {
    padding: "0.6rem",
    marginBottom: "1rem",
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: "1rem",
  },
  button: {
    padding: "0.7rem",
    borderRadius: 6,
    border: "none",
    background: "#111",
    color: "#fff",
    fontSize: "1rem",
    cursor: "pointer",
    marginTop: "0.5rem",
  },
  error: { color: "#c0392b", fontSize: "0.9rem", marginBottom: "0.5rem" },
  footerText: { fontSize: "0.85rem", marginTop: "1rem", textAlign: "center" },
};
