import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return new Response("Missing username", { status: 400 });
  }

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, headline, skills, username")
    .eq("username", username)
    .eq("is_profile_public", true)
    .maybeSingle();

  if (!profile) {
    return new Response("Profile not found", { status: 404 });
  }

  const topSkills = (profile.skills || []).slice(0, 5);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          background: "#0A0A0A",
          color: "#F5F5F0",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "48px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "#FBBF24",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: 800,
              color: "#0A0A0A",
            }}
          >
            H
          </div>
          <span
            style={{
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "rgba(245,245,240,0.5)",
            }}
          >
            bigmovv
          </span>
        </div>

        {/* Name */}
        <div
          style={{
            fontSize: "56px",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            marginBottom: "16px",
          }}
        >
          {profile.full_name}
        </div>

        {/* Headline */}
        {profile.headline && (
          <div
            style={{
              fontSize: "22px",
              color: "rgba(245,245,240,0.6)",
              marginBottom: "32px",
            }}
          >
            {profile.headline}
          </div>
        )}

        {/* Skills */}
        {topSkills.length > 0 && (
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {topSkills.map((skill: string) => (
              <div
                key={skill}
                style={{
                  padding: "8px 18px",
                  border: "2px solid rgba(251,191,36,0.4)",
                  color: "#FBBF24",
                  fontSize: "14px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {skill}
              </div>
            ))}
          </div>
        )}

        {/* URL at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "80px",
            fontSize: "16px",
            color: "rgba(245,245,240,0.3)",
            fontWeight: 600,
          }}
        >
          bigmovv.com/u/{username}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}
