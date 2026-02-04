import { redirect } from "next/navigation";
import { colors } from "@/lib/constants/colors";
import { Navbar } from "@/components/layout";
import { ResponsiveContainer } from "@/components/layout/ResponsiveContainer";
import { JobPostForm } from "@/components/employer/JobPostForm";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PostJobPage() {
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
        <JobPostForm mode="create" />
      </ResponsiveContainer>
    </div>
  );
}
