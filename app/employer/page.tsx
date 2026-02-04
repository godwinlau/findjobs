import { redirect } from "next/navigation";
import Link from "next/link";
import { colors } from "@/lib/constants/colors";
import { Navbar } from "@/components/layout";
import { ResponsiveContainer } from "@/components/layout/ResponsiveContainer";
import { StatsRow, PostedJobsList, EmptyState } from "@/components/employer";
import { Button } from "@/components/ui/Button";
import { getEmployerJobs, getEmployerStats } from "@/lib/employer";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EmployerDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, user_role")
    .eq("id", user.id)
    .single();

  if (profile?.user_role !== "employer") {
    redirect("/");
  }

  const [jobs, stats] = await Promise.all([
    getEmployerJobs(user.id),
    getEmployerStats(user.id),
  ]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bg,
        color: colors.text,
      }}
    >
      <Navbar
        fullName={profile?.full_name || user.user_metadata?.full_name || ""}
        email={user.email || ""}
        role="employer"
      />

      <ResponsiveContainer maxWidth={900}>
        <div
          className="employer-header-row"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: colors.text }}>
              Employer Dashboard
            </div>
            <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
              Manage your job postings and track performance
            </div>
          </div>
          <Link href="/employer/post" style={{ textDecoration: "none" }}>
            <Button variant="primary" size="lg">
              Post a Job
            </Button>
          </Link>
        </div>

        <StatsRow stats={stats} />

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: colors.text, marginBottom: 12 }}>
            Your Job Postings
          </div>
          {jobs.length > 0 ? <PostedJobsList jobs={jobs} /> : <EmptyState />}
        </div>
      </ResponsiveContainer>
    </div>
  );
}
