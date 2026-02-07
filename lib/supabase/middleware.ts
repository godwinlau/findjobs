import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — important for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Public routes that don't need auth
  const isAuthRoute = pathname === "/login" || pathname === "/signup";
  const isPublicApi = pathname.startsWith("/api/");
  const isAuthCallback = pathname === "/auth/callback" || pathname === "/auth/confirm";
  const isSignOut = pathname === "/auth/signout";

  const isLandingPage = pathname === "/";

  // Skip protection for API routes, auth callback, and landing page
  if (isPublicApi || isAuthCallback || isSignOut || isLandingPage) {
    return supabaseResponse;
  }

  // Unauthenticated users → redirect to login
  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Authenticated users on auth pages → redirect to home
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  // Onboarding gate: authenticated users without completed onboarding.
  // Skip the DB check if we already know onboarding is done (cookie flag).
  if (user && !isAuthRoute && pathname !== "/onboarding") {
    const onboardingDone = request.cookies.get("onboarding_completed")?.value === "1";

    if (!onboardingDone) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      if (profile && !profile.onboarding_completed) {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }

      // Onboarding confirmed done — set cookie so we skip DB check next time
      if (profile?.onboarding_completed) {
        supabaseResponse.cookies.set("onboarding_completed", "1", {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 365, // 1 year
        });
      }
    }
  }

  return supabaseResponse;
}
