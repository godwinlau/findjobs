import { redirect, notFound } from "next/navigation";
import { colors } from "@/lib/constants/colors";
import { Navbar } from "@/components/layout";
import { ResponsiveContainer } from "@/components/layout/ResponsiveContainer";
import { JobPostForm } from "@/components/employer/JobPostForm";
import { getEmployerJob } from "@/lib/employer";
import { createClient } from "@/lib/supabase/server";
import type { JobFormData } from "@/lib/types";

export const dynamic = "force-dynamic";

interface EditJobPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { id } = await params;
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

  const job = await getEmployerJob(user.id, id);

  if (!job) {
    notFound();
  }

  const initialData: Partial<JobFormData> = {
    company_name: job.company_name,
    company_logo_url: job.company_logo_url ?? "",
    title: job.title,
    description: job.description_plain,
    apply_url: job.apply_url,
    experience_level: job.experience_level ?? "",
    skills_required: job.skills_required ?? [],
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    location_city: job.location_city ?? "",
    location_area: job.location_area ?? "",
    work_setup: job.work_setup ?? "",
    job_type: job.job_type ?? "",
    expires_at: job.expires_at ? job.expires_at.split("T")[0] : "",
  };

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
        <JobPostForm initialData={initialData} jobId={id} mode="edit" />
      </ResponsiveContainer>
    </div>
  );
}
