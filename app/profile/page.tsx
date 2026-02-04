import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { colors } from "@/lib/constants/colors";
import { Navbar } from "@/components/layout";
import { ProfileEditor } from "@/components/profile/ProfileEditor";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
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

  if (!profile || !profile.onboarding_completed) {
    redirect("/onboarding");
  }

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      <Navbar
        fullName={profile.full_name || ""}
        email={user.email || ""}
      />
      <ProfileEditor profile={profile} email={user.email || ""} />
    </div>
  );
}
