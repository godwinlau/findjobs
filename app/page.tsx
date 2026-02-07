import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing";

export const metadata = {
  title: "HanapBuhay \u2014 Find Work That Fits You",
  description:
    "Smart job matching for Filipino professionals. Get matched with jobs that fit your skills, see salaries in PHP, and land your next role in days.",
};

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/home");

  return <LandingPage />;
}
