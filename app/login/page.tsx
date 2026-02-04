"use client";

import { useState } from "react";
import { colors } from "@/lib/constants/colors";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { login } from "./actions";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <AuthCard>
      <h1
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: colors.text,
          textAlign: "center",
          marginBottom: 4,
        }}
      >
        Welcome back
      </h1>
      <p
        style={{
          fontSize: 13,
          color: colors.textSec,
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        Sign in to your HanapBuhay account
      </p>

      {error && <AuthMessage type="error" message={error} />}

      <form onSubmit={handleSubmit}>
        <AuthInput
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
        <AuthInput
          label="Password"
          name="password"
          type="password"
          placeholder="Your password"
          required
          autoComplete="current-password"
        />

        <div style={{ textAlign: "right", marginTop: -8, marginBottom: 16 }}>
          <span
            style={{
              fontSize: 12,
              color: colors.primary,
              cursor: "pointer",
            }}
          >
            Forgot password?
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "11px 16px",
            borderRadius: 8,
            border: "none",
            background: loading ? colors.textMuted : colors.primary,
            color: colors.inv,
            fontSize: 14,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Signing in..." : "Log in"}
        </button>
      </form>

      <p
        style={{
          fontSize: 13,
          color: colors.textSec,
          textAlign: "center",
          marginTop: 20,
        }}
      >
        Don&apos;t have an account?{" "}
        <a
          href="/signup"
          style={{
            color: colors.primary,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Sign up
        </a>
      </p>
    </AuthCard>
  );
}
