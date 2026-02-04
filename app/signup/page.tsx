"use client";

import { useState } from "react";
import { colors } from "@/lib/constants/colors";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { signup } from "./actions";

export default function SignupPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signup(formData);

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
        Create your account
      </h1>
      <p
        style={{
          fontSize: 13,
          color: colors.textSec,
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        Start finding your next opportunity
      </p>

      {error && <AuthMessage type="error" message={error} />}

      <form onSubmit={handleSubmit}>
        <AuthInput
          label="Full name"
          name="full_name"
          type="text"
          placeholder="Juan dela Cruz"
          required
          autoComplete="name"
        />
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
          placeholder="Min. 6 characters"
          required
          minLength={6}
          autoComplete="new-password"
        />

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
            marginTop: 4,
          }}
        >
          {loading ? "Creating account..." : "Create account"}
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
        Already have an account?{" "}
        <a
          href="/login"
          style={{
            color: colors.primary,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Log in
        </a>
      </p>
    </AuthCard>
  );
}
