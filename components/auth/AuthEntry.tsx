"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { sendMagicLink } from "@/app/login/actions";

type Mode = "signup" | "signin";

export function AuthEntry({ initialMode }: { initialMode: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("error")) return;
    const params = new URLSearchParams(hash.slice(1));
    const desc = params.get("error_description");
    if (desc) {
      setError(desc.replace(/\+/g, " "));
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  function toggleMode() {
    setMode((m) => (m === "signup" ? "signin" : "signup"));
    setError("");
    setSent(false);
  }

  function handleSocialAuth(provider: "google") {
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback`;
    supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    formData.set("email", email);

    startTransition(async () => {
      const result = await sendMagicLink(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSent(true);
      }
    });
  }

  const isSignup = mode === "signup";
  const title = isSignup ? "Create your account" : "Welcome back";
  const subtitle = isSignup
    ? "Takes less than a minute. No credit card needed."
    : "Sign in to see your matches and applications.";
  const toggleText = isSignup
    ? "Already have an account?"
    : "Don\u2019t have an account?";
  const toggleLabel = isSignup ? "Sign in" : "Sign up";

  return (
    <div className="auth-page">
      {/* LEFT PANEL — BRAND */}
      <div className="auth-left-panel">
        <div className="auth-lp-top">
          <div className="auth-lp-brand">
            <div className="auth-lp-wordmark">bigmovv<span className="auth-lp-period">.</span></div>
          </div>
          <div className="auth-lp-headline">
            Find work that <span>fits you</span>
          </div>
          <p className="auth-lp-sub">
            Smart job matching powered by your skills. Join thousands of
            Filipino professionals landing better roles, faster.
          </p>
        </div>
        <div className="auth-lp-stats">
          <div className="auth-lp-stat">
            <div className="auth-lp-stat-val auth-yellow">2,400+</div>
            <div className="auth-lp-stat-label">Active Jobs</div>
          </div>
          <div className="auth-lp-stat">
            <div className="auth-lp-stat-val">89%</div>
            <div className="auth-lp-stat-label">Avg. Match</div>
          </div>
          <div className="auth-lp-stat">
            <div className="auth-lp-stat-val auth-yellow">12K</div>
            <div className="auth-lp-stat-label">Users</div>
          </div>
        </div>
        <div className="auth-lp-deco auth-lp-circle" />
        <div className="auth-lp-deco auth-lp-block" />
        <div className="auth-lp-deco auth-lp-sq1" />
        <div className="auth-lp-deco auth-lp-sq2" />
      </div>

      {/* RIGHT PANEL — AUTH */}
      <div className="auth-right-panel">
        <div className="auth-box">
          {/* Mobile brand */}
          <div className="auth-mobile-brand">
            <div className="auth-lp-wordmark">bigmovv<span className="auth-lp-period">.</span></div>
          </div>

          {sent ? (
            /* ── CHECK YOUR EMAIL ── */
            <div className="auth-sent-view">
              <div className="auth-sent-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <div className="auth-sent-title">Check your email</div>
              <div className="auth-sent-sub">
                We sent a magic link to
              </div>
              <div className="auth-sent-email">{email}</div>
              <button
                className="auth-sent-retry"
                onClick={() => {
                  setSent(false);
                  setError("");
                }}
              >
                Didn&apos;t get it?{" "}
                <span>Try again</span>
              </button>
            </div>
          ) : (
            /* ── AUTH FORM ── */
            <>
              <div className="auth-title">{title}</div>
              <div className="auth-sub">{subtitle}</div>

              {/* Social */}
              <div className="auth-social-btns">
                <button
                  className="auth-social-btn"
                  type="button"
                  onClick={() => handleSocialAuth("google")}
                >
                  <svg viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </button>
              </div>

              {/* Divider */}
              <div className="auth-divider">
                <div className="auth-divider-line" />
                <div className="auth-divider-text">or</div>
                <div className="auth-divider-line" />
              </div>

              {/* Error */}
              {error && <div className="auth-error-msg">{error}</div>}

              {/* Email form */}
              <form onSubmit={handleSubmit}>
                <div className={`auth-email-field${error ? " auth-field-error" : ""}`}>
                  <label className="auth-email-label" htmlFor="auth-email">
                    Email address
                  </label>
                  <input
                    className="auth-email-input"
                    type="email"
                    id="auth-email"
                    placeholder="you@email.com"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                  />
                </div>

                <button
                  className="auth-submit-btn"
                  type="submit"
                  disabled={isPending}
                >
                  {isPending
                    ? "Sending link..."
                    : "Continue with Email \u2192"}
                </button>
              </form>

              {/* Footer */}
              <div className="auth-footer">
                <div className="auth-toggle">
                  {toggleText}{" "}
                  <a onClick={toggleMode}>{toggleLabel}</a>
                </div>
              </div>

              <div className="auth-terms">
                By continuing, you agree to our{" "}
                <a href="/terms">Terms of Service</a> and{" "}
                <a href="/privacy">Privacy Policy</a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
