import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const redirectTo = request.nextUrl.clone();
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");

  if (!token_hash || !type) {
    redirectTo.pathname = "/login";
    redirectTo.searchParams.set("error", "missing_params");
    return NextResponse.redirect(redirectTo);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (error) {
      redirectTo.pathname = "/login";
      redirectTo.searchParams.set("error", error.message);
      return NextResponse.redirect(redirectTo);
    }

    redirectTo.pathname = "/home";
    return NextResponse.redirect(redirectTo);
  } catch (e) {
    redirectTo.pathname = "/login";
    redirectTo.searchParams.set("error", e instanceof Error ? e.message : "unknown");
    return NextResponse.redirect(redirectTo);
  }
}
