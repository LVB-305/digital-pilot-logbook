import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  publicRoutes,
  privateRoutes,
  authRoutes,
  DEFAULT_REDIRECT,
} from "@/routes";

export async function middleware(request: NextRequest) {
  // Initialize Supabase client and handle session
  let response = NextResponse.next({
    request,
  });

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
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get user session
  const {
    data: { user: session },
  } = await supabase.auth.getUser();

  // Helper function to check if the current path matches any route pattern
  const pathStartsWith = (path: string, patterns: string[]) => {
    return patterns.some((pattern) => path.startsWith(pattern));
  };

  const currentPath = request.nextUrl.pathname;

  // Handle authentication routes
  if (pathStartsWith(currentPath, authRoutes)) {
    if (session) {
      return NextResponse.redirect(new URL(DEFAULT_REDIRECT, request.url));
    }
    return response;
  }

  // Handle private routes
  if (pathStartsWith(currentPath, privateRoutes) && !session) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("callbackUrl", currentPath);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
// Matcher to exclude certain paths from middleware
export const config = {
  matcher: [
    {
      source:
        "/((?!_next/static|_next/image|favicon.ico|favicons/.*\\.png|manifest.webmanifest|manifest.json|api/.*|fonts/.*|sitemap.xml|robots.txt|manifest.json|manifest.webmanifest|\\.well-known/.*).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
