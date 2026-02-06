"use client";

import { useState } from "react";
import { colors } from "@/lib/constants/colors";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { validatePassword } from "@/lib/validation/password";
import { signup } from "./actions";

export default function SignupPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const passwordValidation = validatePassword(password);
  const passwordsMatch = password === confirmPassword;
  const canSubmit =
    passwordValidation.isValid &&
    passwordsMatch &&
    acceptedTerms &&
    confirmPassword.length > 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!passwordValidation.isValid) {
      setError("Please meet all password requirements.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    if (!acceptedTerms) {
      setError("Please accept the Terms of Service and Privacy Policy.");
      return;
    }

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
          placeholder="Create a strong password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordStrengthIndicator password={password} />

        <AuthInput
          label="Confirm password"
          name="confirm_password"
          type="password"
          placeholder="Re-enter your password"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={
            confirmPassword && !passwordsMatch
              ? "Passwords do not match"
              : undefined
          }
        />

        {/* Terms checkbox */}
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            marginTop: 8,
            marginBottom: 20,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            style={{
              width: 18,
              height: 18,
              marginTop: 2,
              accentColor: colors.primary,
              cursor: "pointer",
            }}
          />
          <span style={{ fontSize: 13, color: colors.textSec, lineHeight: 1.5 }}>
            I agree to the{" "}
            <a
              href="/terms"
              target="_blank"
              style={{ color: colors.primary, textDecoration: "none" }}
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              target="_blank"
              style={{ color: colors.primary, textDecoration: "none" }}
            >
              Privacy Policy
            </a>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading || !canSubmit}
          style={{
            width: "100%",
            padding: "11px 16px",
            borderRadius: 8,
            border: "none",
            background: loading || !canSubmit ? colors.textMuted : colors.primary,
            color: colors.inv,
            fontSize: 14,
            fontWeight: 600,
            cursor: loading || !canSubmit ? "not-allowed" : "pointer",
            marginTop: 4,
            opacity: loading || !canSubmit ? 0.7 : 1,
            transition: "background 0.2s ease, opacity 0.2s ease",
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
