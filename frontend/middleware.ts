import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that require authentication
const protectedPaths = ["/dashboard", "/chat"];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if path requires authentication
  const isProtectedPath = protectedPaths.some((prefix) =>
    path.startsWith(prefix)
  );

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const token = request.cookies.get("auth_token");

  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/chat/:path*"],
};
