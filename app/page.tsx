import { redirect } from "next/navigation";
import { colors } from "@/lib/constants/colors";
import { Navbar } from "@/components/layout";
import { ResponsiveContainer } from "@/components/layout/ResponsiveContainer";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import {
  WeeklyProgress,
  ProfileCompletion,
  SmartBanner,
  ApplicationsTracker,
  ActivityFeed,
  TopMatchesPreview,
  MarketInsight,
} from "@/components/dashboard";
import { getTopMatchedJobs } from "@/lib/jobs";
import { analyzeProfileGaps } from "@/lib/profile";
import { activities, applications } from "@/lib/data/mockData";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { jobs: topJobs, totalMatches } = await getTopMatchedJobs({
    profile,
    limit: 5,
  });

  const topJob = topJobs.length > 0 ? topJobs[0] : null;
  const otherJobs = topJobs.slice(1, 5);

  const profileCompletion = profile?.profile_completion ?? 0;
  const profileComplete = profileCompletion === 100;
  const profileGaps = analyzeProfileGaps(profile);

  // Determine SmartBanner variant (priority: interview → new matches)
  // Interview data is currently hardcoded (mock) — same values as previously in Sidebar
  const hasInterview = applications.some((a) => a.status === "Interview");

  let bannerProps: React.ComponentProps<typeof SmartBanner>;
  if (hasInterview) {
    bannerProps = {
      type: "interview",
      company: "Accenture",
      role: "Customer Support",
      date: "Feb 6",
      time: "2:00 PM",
      format: "Video call",
      daysUntil: 2,
    };
  } else {
    bannerProps = {
      type: "new_matches",
      matchCount: totalMatches,
    };
  }

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
      />

      <ResponsiveContainer>
        <WeeklyProgress />
        <ProfileCompletion
          percentage={profileCompletion}
          matchesUnlocked={topJobs.filter((j) => j.match >= 70).length}
          profileComplete={profileComplete}
          gaps={profileGaps}
        />

        <SmartBanner {...bannerProps} />

        <DashboardGrid>
          <ApplicationsTracker applications={applications} />
          <ActivityFeed activities={activities} />
        </DashboardGrid>

        <TopMatchesPreview
          topJob={topJob}
          otherJobs={otherJobs}
          totalMatches={totalMatches}
        />

        <MarketInsight message="Customer Support roles in BGC average ₱19K/mo. You're targeting the right range." />
      </ResponsiveContainer>
    </div>
  );
}
