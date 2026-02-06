import { redirect } from "next/navigation";
import { colors } from "@/lib/constants/colors";
import { Navbar } from "@/components/layout";
import { ResponsiveContainer } from "@/components/layout/ResponsiveContainer";
import { NotificationsList } from "@/components/notifications";
import { getRecentActivities } from "@/lib/actions/notifications";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const activities = await getRecentActivities(50);

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
        <div
          style={{
            marginBottom: 20,
            animation: "fadeUp 0.3s ease 0s both",
          }}
        >
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: colors.text,
              margin: 0,
            }}
          >
            Notifications
          </h1>
          <p
            style={{
              fontSize: 13,
              color: colors.textSec,
              margin: "4px 0 0",
            }}
          >
            Your recent activity and updates
          </p>
        </div>
        <NotificationsList activities={activities} />
      </ResponsiveContainer>
    </div>
  );
}
