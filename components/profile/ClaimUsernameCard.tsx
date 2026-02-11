"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  checkUsernameAvailability,
  claimUsername,
} from "@/app/profile/actions";

interface ClaimUsernameCardProps {
  onClaimed: (username: string) => void;
}

export function ClaimUsernameCard({ onClaimed }: ClaimUsernameCardProps) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "error" | "claiming" | "claimed"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [claimedUsername, setClaimedUsername] = useState("");
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const checkAvailability = useCallback(async (username: string) => {
    if (username.length < 3) {
      setStatus("idle");
      return;
    }
    setStatus("checking");
    const result = await checkUsernameAvailability(username);
    if (result.available) {
      setStatus("available");
      setErrorMsg("");
    } else {
      setStatus("taken");
      setErrorMsg(result.error || "Username unavailable");
    }
  }, []);

  function handleChange(input: string) {
    const cleaned = input.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setValue(cleaned);
    setStatus("idle");
    setErrorMsg("");

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (cleaned.length >= 3) {
      debounceRef.current = setTimeout(() => checkAvailability(cleaned), 300);
    }
  }

  async function handleClaim() {
    if (status !== "available") return;
    setStatus("claiming");
    const result = await claimUsername(value);
    if (result.error) {
      setStatus("error");
      setErrorMsg(result.error);
    } else {
      setClaimedUsername(value);
      setStatus("claimed");
      onClaimed(value);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(`${window.location.origin}/u/${claimedUsername}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Cleanup debounce
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  if (status === "claimed") {
    return (
      <div className="claim-username-card claimed">
        <div className="claim-header">
          <span className="claim-check">&#10003;</span>
          <span className="claim-title">Your public profile is live!</span>
        </div>
        <div className="claim-url-display">
          <span className="claim-url-text">
            {typeof window !== "undefined"
              ? `${window.location.host}/u/${claimedUsername}`
              : `/u/${claimedUsername}`}
          </span>
          <button className="claim-copy-btn" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="claim-username-card">
      <div className="claim-header">
        <span className="claim-icon">@</span>
        <div>
          <div className="claim-title">Claim your public profile URL</div>
          <div className="claim-subtitle">
            Share your skills and experience with a personalized link
          </div>
        </div>
      </div>

      <div className="claim-input-row">
        <span className="claim-prefix">bigmovv.com/u/</span>
        <input
          className="claim-input"
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="yourname"
          maxLength={30}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {/* Feedback */}
      {status === "checking" && (
        <div className="claim-feedback checking">Checking availability...</div>
      )}
      {status === "available" && (
        <div className="claim-feedback available">Username is available!</div>
      )}
      {(status === "taken" || status === "error") && errorMsg && (
        <div className="claim-feedback error">{errorMsg}</div>
      )}

      <button
        className="claim-btn"
        onClick={handleClaim}
        disabled={status !== "available"}
      >
        {status === "claiming" ? "Claiming..." : "Claim URL"}
      </button>
    </div>
  );
}
