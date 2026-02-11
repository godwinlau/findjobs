import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PublicProfileView } from "@/components/profile/PublicProfileView";
import type { PublicProfile } from "@/lib/types";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ username: string }>;
}

const PUBLIC_PROFILE_COLUMNS =
  "full_name, headline, avatar_url, preferred_city, work_preference, employment_type, skills, skill_proficiencies, experience_level, education, school, field_of_study, desired_salary_min, desired_salary_max, preferred_industries, username, public_sections";

async function getPublicProfile(
  username: string
): Promise<PublicProfile | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select(PUBLIC_PROFILE_COLUMNS)
    .eq("username", username)
    .eq("is_profile_public", true)
    .maybeSingle();

  return data as PublicProfile | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(username);

  if (!profile) {
    return { title: "Profile Not Found" };
  }

  const description =
    profile.headline ||
    (profile.skills?.length
      ? `Skilled in ${profile.skills.slice(0, 3).join(", ")}`
      : "View my professional profile");

  return {
    title: `${profile.full_name} | bigmovv`,
    description,
    openGraph: {
      title: `${profile.full_name} | bigmovv`,
      description,
      images: [
        {
          url: `/api/og/profile?username=${username}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${profile.full_name} | bigmovv`,
      description,
      images: [`/api/og/profile?username=${username}`],
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await getPublicProfile(username);

  if (!profile) {
    notFound();
  }

  return <PublicProfileView profile={profile} />;
}
