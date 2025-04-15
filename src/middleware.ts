import { type NextRequest, NextResponse } from "next/server";

import {
  DEFAULT_REDIRECT,
  SESSION_COOKIE_NAME,
  authRoutes,
  privateRoutes,
} from "@/routes";

export default async function middelware(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value || "";

  const isAuthRoute = authRoutes.includes(request.nextUrl.pathname);

  // Redirect login page to default redirect if logged in
  if (isAuthRoute) {
    if (session) {
      const absoluteURL = new URL(DEFAULT_REDIRECT, request.nextUrl);
      return NextResponse.redirect(absoluteURL);
    }
    return null;
  }

  // Redirect if no active session
  if (!session && privateRoutes.includes(request.nextUrl.pathname)) {
    const absoluteURL = new URL("/login", request.nextUrl.origin);
    return NextResponse.redirect(absoluteURL.toString());
  }
}

export const config = {
  matcher:
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
};
