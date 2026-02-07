import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing";

export const metadata = {
  title: "bigmovv \u2014 Find Work That Fits You",
  description:
    "Career intelligence for Filipino professionals. We score your skills against real jobs and show you the ones that are embarrassingly good matches. Salaries in PHP. Zero guesswork.",
};

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/home");

  return <LandingPage />;
}
