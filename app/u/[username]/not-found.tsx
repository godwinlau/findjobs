import Link from "next/link";

export default function PublicProfileNotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F5F0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 440 }}>
        <div
          style={{
            width: 80,
            height: 80,
            border: "3px solid #0A0A0A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            fontFamily: "var(--font-mono)",
            fontSize: 32,
            fontWeight: 800,
          }}
        >
          404
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            marginBottom: 12,
          }}
        >
          Profile not found
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "#888",
            lineHeight: 1.6,
            marginBottom: 28,
          }}
        >
          This profile doesn&apos;t exist or is no longer public. The user may
          have changed their username or made their profile private.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "12px 28px",
            background: "#0A0A0A",
            color: "#F5F5F0",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            textDecoration: "none",
            transition: "all 0.15s",
          }}
        >
          Go to bigmovv
        </Link>
      </div>
    </div>
  );
}
