import { NextResponse } from "next/server";
import { isValidSession, COOKIE_NAME } from "./lib/auth";

// Everything is gated behind the dashboard password EXCEPT the actual
// public redirect links (/l/*) that you put in your Instagram bio, and the
// login flow itself. The generator homepage + dashboard + APIs are private
// so random visitors can't spam-create links or see your analytics.
export async function middleware(req) {
  const { pathname } = req.nextUrl;

  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  if (await isValidSession(cookie)) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!l/|login|api/login|_next|favicon.ico).*)"],
};
