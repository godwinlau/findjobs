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
  const isAuthCallback = pathname === "/auth/callback";
  const isSignOut = pathname === "/auth/signout";

  // Skip protection for API routes and auth callback
  if (isPublicApi || isAuthCallback || isSignOut) {
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
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Onboarding gate: authenticated users without completed onboarding.
  // Skip the DB check if we already know onboarding is done (cookie flag).
  // The cookie is set by completeOnboarding() and avoids a DB round-trip
  // on every single page navigation (~200ms saved per page load).
  if (user && !isAuthRoute && pathname !== "/onboarding") {
    const onboardingDone = request.cookies.get("onboarding_completed")?.value === "1";

    if (!onboardingDone) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed, user_role")
        .eq("id", user.id)
        .single();

      if (profile && !profile.onboarding_completed) {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }

      // Onboarding confirmed done — set cookies so we skip DB check next time
      if (profile?.onboarding_completed) {
        supabaseResponse.cookies.set("onboarding_completed", "1", {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 365, // 1 year
        });
        if (profile.user_role) {
          supabaseResponse.cookies.set("user_role", profile.user_role, {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
          });
        }
      }
    }

    // Role-based routing (use cached cookie to avoid DB query)
    const userRole = request.cookies.get("user_role")?.value;

    if (userRole === "employer" && pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/employer";
      return NextResponse.redirect(url);
    }

    if (userRole === "job_seeker" && pathname.startsWith("/employer")) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
