import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const cookieStore = await cookies();
  cookieStore.delete("onboarding_completed");
  cookieStore.delete("user_role");

  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/login`, {
    status: 302,
  });
}
